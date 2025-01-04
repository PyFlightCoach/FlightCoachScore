import { dbServer } from '$lib/api.js';
export async function load({ url }) {
    const users = (await dbServer.get(`users/list`)).data
    return { users: users.results };
}
