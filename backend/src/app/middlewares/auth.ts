import { NextFunction, Request, Response } from "express";

import { Secret } from "jsonwebtoken";


import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import prisma from "../../shared/prisma";
import { env } from "../../config/env.config";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.accessToken;
      
      let token = authHeader || cookieToken;
      if (token && typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        env.JWT_SECRET as Secret
      ) as any;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(verifiedUser.email ? [{ email: verifiedUser.email }] : []),
            ...(verifiedUser.id ? [{ id: verifiedUser.id }] : []),
          ],
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
      }

      const userStatus = user?.status;

      if (userStatus === "BLOCKED") {
        throw new ApiError(httpStatus.FORBIDDEN, "This user is blocked ! !");
      }

      const userRole = user.role || verifiedUser.role;
      if (roles.length && !roles.includes(userRole)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Forbidden! Your role ${String(userRole).toLowerCase()} is not allowed to access this route..!!`
        );
      }

      req.user = {
        ...verifiedUser,
        ...user,
        id: user.id,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
