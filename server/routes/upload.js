import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../utils/cloudflare-storage-setup.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/image",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const file =
        req.file ??
        req.files?.file?.[0] ??
        req.files?.image?.[0] ??
        req.files?.photo?.[0] ??
        null;

      if (!file) {
        return res.status(400).json({
          success: false,
          message:
            'No file uploaded. Send multipart/form-data with field name "file" (or "image"/"photo").',
        });
      }

      const key = `images/${Date.now()}-${file.originalname}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      res.json({
        success: true,
        key,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }
    return next(error);
  }
);

export default router;