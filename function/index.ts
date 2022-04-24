import { getRefreshedClient, getTweetsUnanswered, answerTweet } from './src/twitter';

export const lambdaHandler = async () => {

    const client = await getRefreshedClient();  
    
    const tweetsToAnswer = await getTweetsUnanswered(client);

    return answerTweet(client, tweetsToAnswer[0]);

    for (const tweet of tweetsToAnswer) {
        await answerTweet(client, tweet);
    }

    return tweetsToAnswer;

};
