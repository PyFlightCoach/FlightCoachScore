import {reloadSchedules} from '$lib/schedule/library';
import {loadGuiLists, loadRules} from '$lib/stores/shared';
import { dev as envDev } from '$app/environment';
import { dev } from '$lib/stores/shared';


console.log("setting dev to ", envDev)
dev.set(envDev);

loadGuiLists();
loadRules();
reloadSchedules();
