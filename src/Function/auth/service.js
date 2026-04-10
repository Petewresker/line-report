import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


export async function verifyLineIdToken(idToken) {
  try {
    const url = 'https://api.line.me/oauth2/v2.1/verify';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: process.env.LINE_CHANNEL_ID
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API verification failed: ${response.status} - ${errorText}`);
    }
    
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('LINE verification error:', error);
    throw new Error(`Failed to verify LINE ID token: ${error.message}`);
  }
}



export async function findOrCreateUser(lineUserId, lineProfile) {
  try {
    const tableName = process.env.TABLE_TABLE_NAME;
    
    if (!tableName) {
      throw new Error('TABLE_TABLE_NAME environment variable is not set');
    }
   
    const getParams = {
      TableName: tableName,
      Key: {
        PK: `USER#${lineUserId}`,
        SK: 'PROFILE'
      }
    };
    
    const { Item } = await docClient.send(new GetCommand(getParams));
    
    if (Item) {
      const userData = {
        userId: lineUserId,
        role: Item.role || 'user',
        name: Item.name || lineProfile.name
      };
      
      if (Item.agencyId) {
        userData.agencyId = Item.agencyId;
      }
      
      return userData;
    }
  

    const newUser = {
      PK: `USER#${lineUserId}`,
      SK: 'PROFILE',
      userId: lineUserId,
      role: 'user',
      name: lineProfile.name,
      email: lineProfile.email,
      createdAt: new Date().toISOString()
    };
    
    const putParams = {
      TableName: tableName,
      Item: newUser
    };
    
    await docClient.send(new PutCommand(putParams));
    
    return {
      userId: lineUserId,
      role: 'user',
      name: lineProfile.name
    };
    
  } catch (error) {
    console.error('DynamoDB error:', error);
    throw new Error(`Failed to find or create user: ${error.message}`);
  }
}
