import {loadSchedulesforUser} from '$lib/schedules/library';
import {loadRules} from '$lib/schedules/schedule_builder';
import {loadGuiLists} from '$lib/stores/shared';
import { dev as envDev } from '$app/environment';
import { dev } from '$lib/stores/shared';


console.log("setting dev to ", envDev)
dev.set(envDev);

loadGuiLists();
loadRules();

loadSchedulesforUser("admin@fcscore.org")
