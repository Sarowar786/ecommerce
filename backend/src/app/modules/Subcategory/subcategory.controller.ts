import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SubcategoryServices } from "./subcategory.service";

const createSubcategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.createSubcategory(req.file, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subcategory created successfully",
    data: result,
  });
});

const getAllSubcategories = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.getAllSubcategories(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subcategories fetched successfully",
    data: result,
  });
});

const getSubcategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.getSubcategoryById(String(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subcategory fetched successfully",
    data: result,
  });
});

const updateSubcategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.updateSubcategory(
    String(req.params.id),
    req.file,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subcategory updated successfully",
    data: result,
  });
});

const deleteSubcategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.deleteSubcategory(String(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const SubcategoryControllers = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
};
