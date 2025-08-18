import { goto } from '$app/navigation';
import {checkUser} from '$lib/stores/user';

import {dbServer} from '$lib/api';

export async function load() {
  
  
  if (await checkUser(true)) {
    const users = await dbServer.get(
      "users/list"
    ).then(res=>res.data.results)
    return {users}
  } else {
    goto("/");
  }
  
}