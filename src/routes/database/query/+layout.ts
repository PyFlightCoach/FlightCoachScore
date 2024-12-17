import {dbServer} from '$lib/api.js';

export async function load() {
    return (await dbServer.get('analysis/guilists')).data;
}