import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardServices } from "./dashboard.service";

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardServices.getOverview();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard overview retrieved successfully",
    data: result,
  });
});

export const DashboardControllers = {
  getOverview,
};
