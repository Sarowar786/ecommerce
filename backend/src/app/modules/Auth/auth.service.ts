import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

import ApiPathError from "../../../errors/ApiPathError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { env } from "../../../config/env.config";
import { AuthUtils } from "./auth.utils";
import emailSender from "../../../helpers/emailSender";
import generateOtp from "../../../utils/generateOtp";

// ── register ─────────────────────────────────────────

const register = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) {
    throw new ApiPathError(
      httpStatus.CONFLICT,
      "email",
      "Email already exists.",
    );
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const { password, phone, ...userData } = payload;

  const user = await prisma.user.create({
    data: {
      ...userData,
      email: payload.email.trim().toLowerCase(),
      auth: {
        create: { password: hashedPassword },
      },
    },
    select: { id: true, name: true, email: true, role: true },
  });

  const otp = generateOtp();
  await prisma.authChallenge.deleteMany({
    where: { email: user.email, type: "REGISTER" },
  });
  await prisma.authChallenge.create({
    data: {
      email: user.email,
      otpHash: await bcrypt.hash(otp, 10),
      type: "REGISTER",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await emailSender({
    to: user.email,
    subject: "Your verification OTP",
    html: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return user;
};

// ── resend OTP ───────────────────────────────────────

const resendOtp = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new ApiPathError(
      httpStatus.NOT_FOUND,
      "email",
      "User with this email does not exist.",
    );
  }

  const otp = generateOtp();
  await prisma.authChallenge.deleteMany({
    where: { email: payload.email, type: "REGISTER" },
  });
  await prisma.authChallenge.create({
    data: {
      email: payload.email,
      otpHash: await bcrypt.hash(otp, 10),
      type: "REGISTER",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await emailSender({
    to: payload.email,
    subject: "Your verification OTP (Resent)",
    html: `Your new OTP is ${otp}. It expires in 5 minutes.`,
  });

  return { message: "OTP sent to your email successfully." };
};

// ── verify OTP (email verification) ──────────────────

const verifyOtp = async (payload: { email: string; otp: string }, res: any) => {
  const challenge = await prisma.authChallenge.findFirst({
    where: {
      email: payload.email,
      type: "REGISTER",
      expiresAt: { gt: new Date() },
    },
  });
  if (!challenge || !(await bcrypt.compare(payload.otp, challenge.otpHash))) {
    throw new ApiPathError(
      httpStatus.BAD_REQUEST,
      "otp",
      "Invalid or expired OTP.",
    );
  }

  const user = await prisma.user.update({
    where: { email: payload.email },
    data: { isEmailVerified: true },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.authChallenge.delete({ where: { id: challenge.id } });

  const tokens = AuthUtils.setTokenCookies(res, user);
  return { user, ...tokens };
};

// ── login ─────────────────────────────────────────────

const login = async (
  payload: { email: string; password: string },
  res: any,
) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { auth: true },
  });

  if (!user || !user.auth) {
    throw new ApiPathError(
      httpStatus.UNAUTHORIZED,
      "email",
      "Invalid credentials.",
    );
  }
  if (user.status === "BLOCKED") {
    throw new ApiPathError(
      httpStatus.FORBIDDEN,
      "email",
      "Your account is blocked.",
    );
  }
  if (!user.isEmailVerified) {
    throw new ApiPathError(
      httpStatus.FORBIDDEN,
      "email",
      "Please verify your email first.",
    );
  }

  const passwordMatch = await bcrypt.compare(
    payload.password,
    user.auth.password,
  );
  if (!passwordMatch) {
    throw new ApiPathError(
      httpStatus.UNAUTHORIZED,
      "password",
      "Invalid credentials.",
    );
  }

  await prisma.userAuth.update({
    where: { userId: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { auth, ...safeUser } = user;
  const tokens = AuthUtils.setTokenCookies(res, user);
  return { user: safeUser, ...tokens };
};

// ── forgot password ───────────────────────────────────

const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    // Don't reveal if email exists — silently succeed
    return { message: "If this email exists, an OTP has been sent." };
  }

  const otp = generateOtp();
  await prisma.authChallenge.deleteMany({
    where: { email: payload.email, type: "PASSWORD_RESET" },
  });
  await prisma.authChallenge.create({
    data: {
      email: payload.email,
      otpHash: await bcrypt.hash(otp, 10),
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await emailSender({
    to: payload.email,
    subject: "Password reset OTP",
    html: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { message: "If this email exists, an OTP has been sent." };
};

// ── verify reset OTP → return short-lived reset token ─

const verifyResetOtp = async (payload: { email: string; otp: string }) => {
  const challenge = await prisma.authChallenge.findFirst({
    where: {
      email: payload.email,
      type: "PASSWORD_RESET",
      expiresAt: { gt: new Date() },
    },
  });
  if (!challenge || !(await bcrypt.compare(payload.otp, challenge.otpHash))) {
    throw new ApiPathError(
      httpStatus.BAD_REQUEST,
      "otp",
      "Invalid or expired OTP.",
    );
  }

  await prisma.authChallenge.delete({ where: { id: challenge.id } });

  // Issue a short-lived, single-use reset token (JWT)
  const resetToken = jwt.sign(
    { email: payload.email, purpose: "password_reset" },
    env.RESET_PASS_TOKEN,
    { expiresIn: "10m" },
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      email: payload.email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { resetToken };
};

// ── reset password ────────────────────────────────────

const resetPassword = async (payload: {
  resetToken: string;
  newPassword: string;
}) => {
  // Verify token
  let decoded: { email: string; purpose: string };
  try {
    decoded = jwtHelpers.verifyToken(
      payload.resetToken,
      env.RESET_PASS_TOKEN,
    ) as any;
  } catch {
    throw new ApiPathError(
      httpStatus.BAD_REQUEST,
      "resetToken",
      "Invalid or expired reset token.",
    );
  }

  if (decoded.purpose !== "password_reset") {
    throw new ApiPathError(
      httpStatus.BAD_REQUEST,
      "resetToken",
      "Invalid token purpose.",
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(payload.resetToken)
    .digest("hex");
  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (
    !storedToken ||
    storedToken.usedAt ||
    storedToken.expiresAt <= new Date() ||
    storedToken.email !== decoded.email
  ) {
    throw new ApiPathError(
      httpStatus.BAD_REQUEST,
      "resetToken",
      "Token already used or expired.",
    );
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { email: decoded.email },
    data: {
      auth: {
        update: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      },
    },
  });

  await prisma.passwordResetToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  return { message: "Password reset successfully." };
};

// ── refresh access token ──────────────────────────────

const refreshToken = async (token: string, res: any) => {
  let decoded: { id: string; role: string };
  try {
    decoded = jwtHelpers.verifyToken(token, env.JWT_SECRET!) as any;
  } catch {
    throw new ApiPathError(
      httpStatus.UNAUTHORIZED,
      "refreshToken",
      "Invalid or expired refresh token.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, status: true, isDeleted: true },
  });

  if (!user || user.isDeleted || user.status === "BLOCKED") {
    throw new ApiPathError(
      httpStatus.UNAUTHORIZED,
      "refreshToken",
      "User no longer active.",
    );
  }

  const tokens = AuthUtils.setTokenCookies(res, user);
  return tokens;
};

// ── logout ────────────────────────────────────────────

const logout = (res: any) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return { message: "Logged out successfully." };
};

export const AuthServices = {
  register,
  resendOtp,
  verifyOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshToken,
  logout,
};
