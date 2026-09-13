import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import ApiPathError from "../../errors/ApiPathError";


/* Ensure upload directory */
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* Storage Config */
const storage = multer.memoryStorage()

/*Types*/
type UploadOptions = {
  maxCount?: number;
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

type FieldOption = {
  name: string;
  maxCount?: number;
  required?: boolean;
};

/* Default */
const DEFAULTS = {
  maxSize: 100 * 1024 * 1024,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
  ],
};

/* File Filter */
const fileFilter = (allowedTypes: string[]) => {
  return (_: any, file: Express.Multer.File, cb: any) => {
    if (
      allowedTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type: ${file.mimetype}`));
    }
  };
};

/*  Core Uploader Factory */
const createUploader = (options: {
  type: "single" | "array" | "fields" | "any";
  fieldName?: string;
  fields?: FieldOption[];
} & UploadOptions) => {
  const upload = multer({
    storage,
    limits: { fileSize: options.maxSize || DEFAULTS.maxSize },
    fileFilter: fileFilter(options.allowedTypes || DEFAULTS.allowedTypes),
  });

  let middleware: any;

  if (options.type === "single") {
    middleware = upload.single(options.fieldName!);
  } else if (options.type === "array") {
    middleware = upload.array(options.fieldName!, options.maxCount || 20);
  } else if (options.type === "fields") {
    middleware = upload.fields(options.fields!);
  } else {
    middleware = upload.any();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (err) {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            err.message || "File upload error"
          )
        );
      }

      /* Required Validation */
      if (options.required) {
        const file = req.file || req.files;

        if (!file || (Array.isArray(file) && file.length === 0)) {
          return next(
            new ApiPathError(
              httpStatus.BAD_REQUEST,
              options.fieldName || "file",
              "File is required"
            )
          );
        }
      }

      /* Fields Validation*/
      if (options.fields) {
        for (const field of options.fields) {
          if (field.required) {
            const files = (req.files as any)?.[field.name];
            if (!files || files.length === 0) {
              return next(
                new ApiPathError(
                  httpStatus.BAD_REQUEST,
                  field.name,
                  `${field.name} is required`
                )
              );
            }
          }
        }
      }

      next();
    });
  };
};

export const fileUploader = {
  single: (fieldName: string, options?: UploadOptions) =>
    createUploader({ type: "single", fieldName, ...options }),

  array: (fieldName: string, options?: UploadOptions) =>
    createUploader({ type: "array", fieldName, ...options }),

  fields: (fields: FieldOption[], options?: UploadOptions) =>
    createUploader({ type: "fields", fields, ...options }),

  any: (options?: UploadOptions) =>
    createUploader({ type: "any", ...options }),
};