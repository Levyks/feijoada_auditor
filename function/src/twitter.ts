import { TwitterApi, TweetV2, ErrorV2 } from 'twitter-api-v2';
import { auditPost } from './audit';
import { getToken, saveToken } from './db';

const FETCH_LIMIT = 1;
const feijoadaSim = 'FeijoadaSim';
const feijoadaAudit = 'FeijoadaAudit';

export async function getRefreshedClient(): Promise<TwitterApi> {

    if(!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
        throw new Error('TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET must be set');
    }

    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!
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

export async function wasTweetAnswered(client: TwitterApi, tweet: TweetV2): Promise<boolean> {

    const tweets = await client.v2.search(`from:${feijoadaAudit} conversation_id:${tweet.id}`);
    return tweets.meta.result_count > 0;

}

export async function getTweetsUnanswered(client: TwitterApi): Promise<TweetV2[]> {

    const tweets = await client.v2.search(`from:${feijoadaSim} has:images`);

    const unansweredTweets: TweetV2[] = [];

    let count = 0;
    for await (const tweet of tweets) {

        if(await wasTweetAnswered(client, tweet) || ++count > FETCH_LIMIT) {
            break;
        }

        unansweredTweets.unshift(tweet);

    }

    return unansweredTweets;
}

export async function getDetailsTweet(client: TwitterApi, tweet: TweetV2): Promise<TweetV2 | undefined> {
    const tweets = await client.v2.search(`from:${feijoadaSim} conversation_id:${tweet.id} url:"feijoadasimulator.top/used"`, {
        "tweet.fields": "id,text,entities"
    });
    return tweets.data.data[0];
}

export async function answerTweet(client: TwitterApi, tweet: TweetV2) {

    const detailsTweet = await getDetailsTweet(client, tweet);

    if(!detailsTweet) {
        throw new Error('Tweet details not found');
    }

    const url = detailsTweet.entities?.urls[0];
    if(!url) {
        throw new Error('Tweet details URL not found');
    }   

    const unwoundUrlObj = new URL(url.unwound_url);
    const postId = unwoundUrlObj.searchParams.get('p');

    if(!postId) {
        throw new Error('Post ID not found');
    }

    return auditPost(postId);

}