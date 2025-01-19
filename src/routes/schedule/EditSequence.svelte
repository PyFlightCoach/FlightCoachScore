<script lang="ts">
	import { dbServer } from '$lib/api';
	import { mans, dbSchedule, canIEdit } from '$lib/schedules/schedule_builder';

  const clear = () => {
    $mans = [];
    $dbSchedule = undefined;
  };
</script>

<div class="row pt-2">
	{#if $dbSchedule && $canIEdit && $dbSchedule.num_flights == 0}
		<button
			class="col col-form-control btn btn-outline-secondary mx-2"
			onclick={() => {
				if (confirm('Are you sure you want to delete this schedule?')) {
					dbServer.delete(`schedule/${$dbSchedule!.schedule_id}`);
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
