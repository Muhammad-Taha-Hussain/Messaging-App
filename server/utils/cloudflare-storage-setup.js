import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
export default s3;
// await s3.send(
//   new PutObjectCommand({
//     Bucket: "media-storage",
//     Key: "images/photo.jpg",
//     Body: fs.readFileSync("./photo.jpg"),
//     ContentType: "image/jpeg",
//   })
// );

