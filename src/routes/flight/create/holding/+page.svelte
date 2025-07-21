<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states, manSplits } from '$lib/stores/analysis';
	import { dataSource, isFullSize } from '$lib/stores/shared';
  import BinReader from '$lib/flight/bin/BinReader.svelte';
  import {dbServer} from '$lib/api';
  import {States} from '$lib/utils/state';
  import {goto} from '$app/navigation';
  import { base } from '$app/paths';
  import * as split from '$lib/flight/splitting';
  import {library} from '$lib/schedule/library';

	const { data } = $props();

  let percent: number | undefined = $state(undefined);
  let binfile = $state(data.bin);
  $inspect($states);
  $origin = data.origin;
  const schedule = $library.subset({category_name:data.sinfo.category, schedule_name:data.sinfo.name}).only;
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
    $manSplits = [split.takeOff(data.mans[0][1])];
    data.mans.forEach((m, i)=>$manSplits.push(split.build(
      schedule.category_name, schedule.schedule_name, schedule.manoeuvres[i], m[1],
    )))
    $manSplits.push(split.landing($states.data.length));

    goto(base + '/flight/create/manoeuvres');
  }}
  showInput={false}
/>

<p>Reading bin: {percent}</p>
<p>{data.origin.lat},{data.origin.lng},{data.origin.alt}, {data.origin.heading}</p>
<p>{data.sinfo.category}, {data.sinfo.name}</p>
{#each data.mans as man}
  <p>{man[0]}, {man[1]}  </p>
{/each}
