<script lang="ts">
	import { nMans, nRunning } from '$lib/stores/analysis';
  import {faVersion} from '$lib/api';
  
	$: n = $nMans - $nRunning;
</script>

{#if $nRunning}
  <div class="col-auto progress w-100 align-self-center d-none d-sm-block">
    <div
      class="progress-bar"
      style="width: {Math.round((100 * n) / $nMans)}%"
      role="progressbar"
      aria-valuenow={n}
      aria-valuemin="0"
      aria-valuemax={$nMans}
    >
      {n} / {$nMans}
    </div>
  </div>
{/if}
