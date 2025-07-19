<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states, manSplits } from '$lib/stores/analysis';
	import { dataSource, isFullSize } from '$lib/stores/shared';
  import BinReader from '$lib/flight/bin/BinReader.svelte';
  import {dbServer} from '$lib/api';
  import {States} from '$lib/utils/state';
	import * as MSplit from '$lib/flight/splitting';
  import {goto} from '$app/navigation';
  import { base } from '$app/paths';

	const { data } = $props();

  let percent: number | undefined = $state(undefined);
  let binfile = $state(data.bin);
  $inspect($states);
  $origin = data.origin;

</script>


<BinReader 
  bind:bin={binfile}
  bind:percent={percent}
  onloaded={(...parseddata) => {
    let md5: string;
    [$bin, $binData, $bootTime, md5] = parseddata;
    dbServer
      .get(`flight/check_duplicate/${md5}`)
      .then((r) => {return r.statusText != 'OK';})
      .catch((e) => {return true;})
      .then((isDuplicate) => {if (isDuplicate) {$bin = undefined}});
    $states = States.from_xkf1($origin!, $binData!.orgn, $binData!.xkf1);
    
    $manSplits = data.mans.map((m, i)=>MSplit.build(data.sinfo.category, data.sinfo.name, i+1, m.stop))
    //goto(base + '/flight/create/manoeuvres');
  }}
  showInput={false}
/>

<p>Reading bin: {percent}</p>
<p>{data.origin.lat},{data.origin.lng},{data.origin.alt}, {data.origin.heading}</p>
<p>{data.sinfo.category}, {data.sinfo.name}</p>
{#each data.mans as man}
  <p>{man.start}, {man.stop}  </p>
{/each}
