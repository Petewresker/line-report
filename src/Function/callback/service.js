import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

async function getImageUrl(key) {
  if (!key) return null
  if (key.startsWith('http')) return key
  const command = new GetObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
  })
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export const getCasesByUserService = async (userId) => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ProjectionExpression: 'caseId, title, description, #st, imageUrlBefore, createdAt',
    ExpressionAttributeNames: { '#st': 'status' },
  }))

  const items = await Promise.all(
    result.Items.map(async (item) => ({
      ...item,
      imageUrl: await getImageUrl(item.imageUrlBefore),
    }))
  )

  return items
}



