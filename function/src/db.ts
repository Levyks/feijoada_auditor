import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient();

type TokenType = 'access' | 'refresh';

export async function getToken(type: TokenType): Promise<string | undefined> {
    const data = await db.get({
        TableName: 'tokens',
        Key: {
            type
        }
    }).promise();

    return data.Item?.token;
}

export async function saveToken(type: TokenType, token: string) {
    await db.put({
        TableName: 'tokens',
        Item: {
            type,
            token,
            date: new Date().toISOString()
        }
    }).promise();
}

export default db;