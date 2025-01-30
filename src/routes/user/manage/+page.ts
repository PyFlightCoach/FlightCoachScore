import { dbServer } from '$lib/api/api.js';
export async function load({ url }) {
    const users = (await dbServer.get(`users/list`)).data
    return { users: users.results };
}
