import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({ region: "us-east-1" })
const BUCKET = process.env.BUCKET_NAME

export const getUploadUrl = async (fileName) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `images/${fileName}`,
  })
  return await getSignedUrl(s3, command, { expiresIn: 900 })
}

export const getDownloadUrl = async (fileName) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: `images/${fileName}`,
  })
  return await getSignedUrl(s3, command, { expiresIn: 900 })
}