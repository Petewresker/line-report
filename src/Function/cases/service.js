import { randomUUID } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
//ใช้คำสั่ง ScanCommand ของ DynamoDB เพื่อดึงข้อมูลทั้งหมดใน Table
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import crypto from 'node:crypto'
import { S3Client, PutObjectCommand ,GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { it } from 'node:test'

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

  const command = new GetObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client,command,{expiresIn:3600});
}

export const getAllCasesService = async () => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }))

  //Show PresignUrl instead of keys
  const casesWithUrls = await Promise.all(
    result.Items.map(async (item) => ({
      ...item,
      imageUrl: await getImageUrl(item.imageUrlBefore),
    }))
  )

  const grouped = casesWithUrls.reduce((acc, item) => {
    const groupKey = `${item.geohash}__${item.title}`

    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: item.title,
        geohash: item.geohash,
        lat: item.lat,
        lon: item.lon,
        count: 0,
        images: [],
        cases: [],
      }
    }

     acc[groupKey].count += 1

    // เก็บรูปไม่เกิน 3 รูป
    if (acc[groupKey].images.length < 3 && item.imageUrl) {
      acc[groupKey].images.push(item.imageUrl)
    }

    //เพิ่มรูปเรื่อยๆถ้ามันเคสเดียวกัน
    acc[groupKey].cases.push(item.caseId)

    return acc
 }, {})

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

}

export const deleteCasesByUserService = async (userId) => {
  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ProjectionExpression: 'PK, SK',
  }))

  await Promise.all(
    result.Items.map((item) =>
      client.send(new DeleteCommand({
        TableName: process.env.TABLE_TABLE_NAME,
        Key: { PK: item.PK, SK: item.SK },
      }))
    )
  )

  return { deleted: result.Items.length }
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




//Loop MockData Test เราแนะนําให้ใช้ docClient แทน Client
export const postCaseService = async (body) => {
  const results = [];

  for (const mock of mockData) {
    const reportId = randomUUID();

    try {
      await docClient.send(new PutCommand({
        TableName: process.env.TABLE_TABLE_NAME,
        Item: {
          PK: `REPORT#${reportId}`,
          SK: `METADATA#${reportId}`,
          ReporterID: mock.userId,
          Title: mock.Topic,
          Description: mock.description,
          Status: "PENDING",
          PhotoURL_Before: mock.imageUrlBefore,
          PhotoURL_After: null,
          Lat: mock.location.lat,
          Lng: mock.location.long,
          AI_Suggested_Category: "",
          AI_Confidence: 0,
          AssignedAgencyID: "",
          CreatedAt: new Date().toISOString(),
          AcceptedAt: null,
          ResolvedAt: null,
          Summary: "",
        },
      }));
      results.push({ reportId, topic: mock.Topic, status: "success" });
    } catch (error) {
      results.push({ reportId, topic: mock.Topic, status: "failed", error: error.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Seeded ${results.filter(r => r.status === "success").length}/${mockData.length} cases`,
      results,
    }),
  };
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


/*
 3 API for analysis
 - Hostspot google map required
 - แนวโน้มรายสัปดาห์/เดือน
 - Resolution Time เคสไหนค้างนานต้องยกขึ้นมาเตือน
*/


export const HostspotService = async () =>{

  const result = await client.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }));

  //reduced stradegy
  //group by using Geohasing!
  const grouped = result.Items.reduce((acc,item)=>{
    const group = item.geohash;

    if(!acc[group]){
      acc[group] = {
        lat:item.lat,
        lon:item.lon,
        count:0
      }
    }

    acc[group].count += 1;

    return acc;
  }, {})
  // sort(a,b) เทียบกับเอาตัวมากขึ้นก่อน
  return Object.values(grouped).sort((a,b)=>b.count - a.count);
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

