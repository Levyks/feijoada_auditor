import axios from 'axios';

export async function auditPost(id: string) {

    const data = await axios.get(`https://feijoadasimulator.top/api/post-data?p=${id}`).then(r => r.data);

    return data;
}