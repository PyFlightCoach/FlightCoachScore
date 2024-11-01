import { dbServer } from '$lib/api';

export async function load({ url }) {
  const myToken = url.searchParams.get("token");
  try {
    return await dbServer.post('auth/verify', {token: myToken});
  } catch (e: any) {
    return {error: e.message};
  }
  
}
