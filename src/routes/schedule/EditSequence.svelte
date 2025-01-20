<script lang="ts">
	import { dbServer } from '$lib/api';
	import { library, ScheduleLibrary, loadSchedulesforUser } from '$lib/schedules/library';
	import { mans, dbSchedule, canIEdit } from '$lib/schedules/schedule_builder';
	import {user} from '$lib/stores/user';

  const clear = () => {
    $mans = [];
    $dbSchedule = undefined;
  };
</script>


{#if $dbSchedule}
  <div class="row pt-2">
    <h2 class="h2">
      {$dbSchedule.category_name.toUpperCase()} {$dbSchedule.schedule_name}
    </h2>
  </div>
{/if}
<div class="row pt-2">
	{#if $dbSchedule && $canIEdit && $dbSchedule.num_flights == 0}
		<button
			class="col col-form-control btn btn-outline-secondary mx-2"
			onclick={() => {
				if (confirm('Are you sure you want to delete this schedule?')) {
					dbServer.delete(`schedule/${$dbSchedule!.schedule_id}`);
          $mans = [];
          $dbSchedule = undefined;
          $library = new ScheduleLibrary();
          loadSchedulesforUser("admin@fcscore.org");
          if ($user) loadSchedulesforUser($user.email);
				}
			}}
		>
			Delete
		</button>
  {:else}
    <div class="col col-form-label">
      {#if $dbSchedule}Flight Count = {$dbSchedule?.num_flights}{/if}
    </div>
	{/if}
	<button class="col col-form-input btn btn-outline-secondary mx-2" onclick={clear}>
		Clear Sequence
	</button>
</div>
