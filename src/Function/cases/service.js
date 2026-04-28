import { randomUUID } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
//ใช้คำสั่ง ScanCommand ของ DynamoDB เพื่อดึงข้อมูลทั้งหมดใน Table
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand, GetCommand, UpdateCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import crypto from 'node:crypto'
import { S3Client, PutObjectCommand ,GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getMockCases } from './mockData.js'
// For DyamoDB Local testing
const clientConfig = {}
console.log('DYNAMODB_ENDPOINT=', process.env.DYNAMODB_ENDPOINT)
console.log('TABLE_TABLE_NAME=', process.env.TABLE_TABLE_NAME)

if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT
  clientConfig.region = 'us-east-1'
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  }
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig))
const s3Client = new S3Client({
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

//Convert img to url for frontend
async function getImageUrl(key){
  if(!key) return null;
  if(key.startsWith('http')) return key;

  const command = new GetObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client,command,{expiresIn:3600});
}

export const getAllCasesAdminService = async () => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'begins_with(PK, :prefix)',
    ExpressionAttributeValues: { ':prefix': 'CASE#' },
    ProjectionExpression: 'caseId, title, description, #st, imageUrlBefore, createdAt, lat, lon, userId',
    ExpressionAttributeNames: { '#st': 'status' },
  }))

  const items = await Promise.all(
    result.Items.map(async (item) => ({
      ...item,
      imageUrl: await getImageUrl(item.imageUrlBefore),
    }))
  )

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const GROUP_RADIUS_M = 500

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const getAllCasesService = async () => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }))

  const casesWithUrls = await Promise.all(
    result.Items.map(async (item) => ({
      ...item,
      imageUrl: await getImageUrl(item.imageUrlBefore),
    }))
  )

  const grouped = {}

  for (const item of casesWithUrls) {
    const existingKey = Object.keys(grouped).find((k) => {
      const g = grouped[k]
      return g.title === item.title
        && haversine(g.lat, g.lon, item.lat, item.lon) <= GROUP_RADIUS_M
    })

    if (existingKey) {
      grouped[existingKey].count += 1
      if (grouped[existingKey].images.length < 3 && item.imageUrl) {
        grouped[existingKey].images.push(item.imageUrl)
      }
      grouped[existingKey].cases.push(item.caseId)
    } else {
      grouped[`${item.title}__${item.caseId}`] = {
        title: item.title,
        lat: item.lat,
        lon: item.lon,
        count: 1,
        images: item.imageUrl ? [item.imageUrl] : [],
        cases: [item.caseId],
      }
    }
  }

  return Object.values(grouped)
}

export const getPresignedUrlService = async (filename, contentType) => {
  const key = `images/${randomUUID()}-${filename}`
  const command = new PutObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  return { uploadUrl, key }
}

export const editCaseService = async (caseId, data) => {
  // Verify case exists
  const getResult = await client.send(new GetCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Key: {
      PK: `CASE#${caseId}`,
      SK: 'METADATA',
    },
  }))

  if (!getResult.Item) {
    throw new Error('Case not found')
  }

  // Build update expression dynamically
  const updateExpressionParts = []
  const expressionAttributeNames = {}
  const expressionAttributeValues = {}

  if (data.description !== undefined) {
    updateExpressionParts.push('#desc = :description')
    expressionAttributeNames['#desc'] = 'description'
    expressionAttributeValues[':description'] = data.description
  }

  if (data.location) {
    if (data.location.lat !== undefined) {
      updateExpressionParts.push('lat = :lat')
      expressionAttributeValues[':lat'] = data.location.lat
    }
    if (data.location.long !== undefined) {
      updateExpressionParts.push('lon = :lon')
      expressionAttributeValues[':lon'] = data.location.long
    }
  }

  if (data.imageUrlBefore !== undefined) {
    updateExpressionParts.push('imageUrlBefore = :imageUrlBefore')
    expressionAttributeValues[':imageUrlBefore'] = data.imageUrlBefore
  }

  if (updateExpressionParts.length === 0) {
    throw new Error('No fields to update')
  }

  //update timestamp
  updateExpressionParts.push('updatedAt = :updatedAt')
  expressionAttributeValues[':updatedAt'] = new Date().toISOString()

  // Execute update
  const updateResult = await client.send(new UpdateCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Key: {
      PK: `CASE#${caseId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
    ...(Object.keys(expressionAttributeNames).length > 0 && { ExpressionAttributeNames: expressionAttributeNames }),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  }))

  return updateResult.Attributes
}

export const getCasesByUserService = async (userId) => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ProjectionExpression: 'caseId, title, description, #st, imageUrlBefore',
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




export const createCaseService = async (caseInformation) => {
  const caseId = crypto.randomUUID()
  const now = new Date().toISOString()

  const item = {
    PK: `CASE#${caseId}`,
    SK: 'METADATA',
    caseId,
    title: caseInformation.title,
    description: caseInformation.description,
    userId: caseInformation.userId,
    lat: caseInformation.lat,
    lon: caseInformation.lon,
    imageUrlBefore: caseInformation.imageUrlBefore,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }

  await client.send(new PutCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Item: item,
  }))
  
  return item
}


export const deleteAllCasesService = async () => {
  const scanResult = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'begins_with(PK, :prefix)',
    ExpressionAttributeValues: { ':prefix': 'CASE#' },
    ProjectionExpression: 'PK, SK',
  }))

  const items = scanResult.Items
  if (!items || items.length === 0) return { deleted: 0 }

  // DynamoDB BatchWrite จำกัด 25 items ต่อ request
  const chunks = []
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25))
  }

  await Promise.all(
    chunks.map((chunk) =>
      client.send(new BatchWriteCommand({
        RequestItems: {
          [process.env.TABLE_TABLE_NAME]: chunk.map((item) => ({
            DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
          })),
        },
      }))
    )
  )

  return { deleted: items.length }
}

export const monthlyReportService = async () => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'begins_with(PK, :prefix)',
    ExpressionAttributeValues: { ':prefix': 'CASE#' },
    ProjectionExpression: 'createdAt',
  }))

  const monthly = result.Items.reduce((acc, item) => {
    if (!item.createdAt) return acc
    const yearMonth = item.createdAt.substring(0, 7)
    if (!acc[yearMonth]) acc[yearMonth] = { month: yearMonth, count: 0 }
    acc[yearMonth].count += 1
    return acc
  }, {})

  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month))
}

/*
 3 API for analysis
 - Hostspot google map required
 - แนวโน้มรายสัปดาห์/เดือน
 - Resolution Time เคสไหนค้างนานต้องยกขึ้นมาเตือน
*/


export const HostspotService = async () =>{

  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'begins_with(PK, :prefix)',
    ExpressionAttributeValues: { ':prefix': 'CASE#' },
  }));

  const HOTSPOT_RADIUS_M = 300
  const groups = []

  for (const item of result.Items) {
    if (!item.lat || !item.lon) continue
    const existing = groups.find(g => haversine(g.lat, g.lon, item.lat, item.lon) <= HOTSPOT_RADIUS_M)
    if (existing) {
      existing.count += 1
    } else {
      groups.push({ lat: item.lat, lon: item.lon, count: 1 })
    }
  }

  return groups.sort((a, b) => b.count - a.count)
}


//Monthly and weekly trend
export const trendAnalysisService = async () =>{

  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }));

  //Use reduce loop insert stradegy acc = accumulator / item = each component
  const Summary = result.Items.reduce((acc,item)=>{
    const title = item.title;

    //Don't have acc[of an item ?? ] yet?
    if(!acc[title]){
      acc[title] = {title,count:0};
    }

    acc[title].count += 1;

    return acc;
  },{});

  return Summary;

}


//Resolution Time 

export const ResolutionTime = async () =>{

  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }))

  const now = new Date();


  const grouped = result.Items.reduce((acc,item)=>{
    const groupKey = `${item.geohash}_${item.title}`;

    if(!acc[groupKey]){
      acc[groupKey] = {
        title: item.title,
        geohash:item.geohash,
        lat:item.lat,
        lon:item.lon,
        count:0,
        createdAt:item.createdAt, //Mark!
        cases:[]
      }
    }

    acc[groupKey].count += 1;
    acc[groupKey].cases.push(item.caseId);

    return acc;

  }, {})

  //Aggregation
  const Resolution = Object.values(grouped)
    .map(group => ({ ...group, PendingDays: Math.floor(Math.abs(now - new Date(group.createdAt)) / (1000 * 60 * 60 * 24)) }))
    .sort((a,b) => b.PendingDays - a.PendingDays || b.count - a.count)

  return Resolution;
};

// Service to get all mock cases (for testing)
export const getAllMockCasesService = async () => {
  return getMockCases()
}

// Service to create mock cases in DynamoDB
export const createMockCasesService = async () => {
  const mockCases = getMockCases()
  const createdCases = []
  
  for (const caseData of mockCases) {
    const caseId = caseData.caseId
    const now = new Date().toISOString()
    
    const item = {
      PK: `CASE#${caseId}`,
      SK: 'METADATA',
      caseId,
      title: caseData.title,
      description: caseData.description,
      userId: caseData.userId,
      lat: caseData.lat,
      lon: caseData.lon,
      imageUrlBefore: caseData.imageUrlBefore,
      status: caseData.status.toUpperCase(),
      createdAt: caseData.createdAt,
      updatedAt: now,
    }
    
    // เพิ่ม AssignedAgencyID ถ้ามี
    if (caseData.AssignedAgencyID) {
      item.AssignedAgencyID = caseData.AssignedAgencyID
    }
    
    await client.send(new PutCommand({
      TableName: process.env.TABLE_TABLE_NAME,
      Item: item,
    }))
    
    createdCases.push(item)
  }
  
  return { created: createdCases.length, cases: createdCases }
}

