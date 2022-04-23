import { DynamoDB } from 'aws-sdk';
import { getRefreshedClient } from './src/twitter';

export const lambdaHandler = async () => {

    const client = await getRefreshedClient();    

    return 'hello world';

};
