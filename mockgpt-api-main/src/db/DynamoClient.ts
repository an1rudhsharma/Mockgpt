import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv'
dotenv.config();

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS configuration in environment variables.')
}

const dynamoUser = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export default dynamoUser;