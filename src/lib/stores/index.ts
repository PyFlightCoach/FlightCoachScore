import { loadGuiLists, loadRules, loadFAVersion } from '$lib/stores/shared';
import { requestActivity } from '$lib/stores/userActivity.js';
import { reloadSchedules } from '$lib/schedule/library';

export let serverDataLoaded = false;


export async  function loadAllServerData() {
  return await Promise.all([loadGuiLists(), loadRules(), reloadSchedules(), loadFAVersion(), requestActivity()])
    .then(() => {
      console.log('All data loaded successfully.');
      serverDataLoaded = true;
    })
    .catch(() => {
      console.error('Error loading required data');
    });
}