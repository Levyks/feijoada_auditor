import { TwitterApi, TweetV2, IParsedOAuth2TokenResult } from 'twitter-api-v2';
import { getToken, saveToken } from './db';


export async function getRefreshedClient() {

    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const refreshToken = await getToken('refresh');

    if(!refreshToken) {
        throw new Error('No refresh token found');
    }

    const result = await client.refreshOAuth2Token(refreshToken);

    if(!result.refreshToken) {
        throw new Error('No refresh token found');
    }

    await Promise.all([
        saveToken('access', result.accessToken),
        saveToken('refresh', result.refreshToken),
    ]);

    return result.client;

}