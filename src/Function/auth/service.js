import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


export async function verifyLineIdToken(idToken) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      if (idToken === 'dev-user') {
        return { sub: 'U_DEV_USER', name: 'Dev User', role: 'user' };
      }
    
      if (idToken === 'dev-agency') {
        return { sub: 'U_DEV_AGENCY', name: 'Dev Agency', role: 'agency', agencyId: 'AGENCY_DEV_001' };
      }
    
      if (idToken === 'dev-admin') {
        return { sub: 'U_DEV_ADMIN', name: 'Dev Admin', role: 'admin' };
      }
    }
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
    console.log('findOrCreateUser input:', { lineUserId, lineProfile });
    
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
    
    console.log('DynamoDB Item:', Item);
    
    if (Item) {
      const userData = {
        userId: lineUserId,
        role: lineProfile.role || Item.role,
        name: Item.name || lineProfile.name
      };
      
      if (Item.agencyId) {
        userData.agencyId = Item.agencyId;
      }
      
      if (Item.adminId) {
        userData.adminId = Item.adminId;
      }
      
      return userData;
    }
  

    const newUser = {
      PK: `USER#${lineUserId}`,
      SK: 'PROFILE',
      userId: lineUserId,
      role: lineProfile.role ,
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
      role: lineProfile.role || 'user',
      name: lineProfile.name
    };
    
  } catch (error) {
    console.error('DynamoDB error:', error);
    throw new Error(`Failed to find or create user: ${error.message}`);
  }
}
