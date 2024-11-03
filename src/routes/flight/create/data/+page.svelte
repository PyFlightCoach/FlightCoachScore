<script lang="ts">
	import { binData, bin, bootTime, fcj, states } from '$lib/stores/analysis';
	import { BinData, BinReader, FieldInfo } from '$lib/components/bin';
	import { base } from '$app/paths';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import { onMount } from 'svelte';
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import { States } from '$lib/analysis/state';

	let _bd: [File, BinData, Date] | undefined = undefined;
	let _fcj: FCJson | undefined = undefined;
  let _states: States | undefined = undefined;
	let getmans: boolean = true;
	let files: FileList;

	let inputMode = 'bin';
	const inputNames: Record<string, string> = {
		bin: 'BIN File',
		fcj: 'FC JSON File',
		state: 'State Dict'
	};

	$: if (inputMode) {
		_bd = undefined;
		_fcj = undefined;
	}

	const parseFile = (file: File) => {
    const reader = new FileReader();
		reader.onload = (e) => {
      if (inputMode === 'state') {
        _states = States.parse(JSON.parse(reader.result));
      } else {
        _fcj = FCJson.parse(JSON.parse(reader.result));;
      }
		};
		reader.readAsText(file);
	};

	onMount(() => {
		binData.set(undefined);
		bin.set(undefined);
		bootTime.set(undefined);
		states.set(undefined);
		fcj.set(undefined);
	});
</script>

<div class="col-lg-5 pt-5">
	<div class="row">
		<div class="input-group">
			<button
				class="btn btn-outline-secondary dropdown-toggle form-control-sm"
				type="button"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				{inputNames[inputMode] || 'Select Input Mode'}
			</button>
			<ul class="dropdown-menu">
				{#each Object.entries(inputNames) as [k, v]}
					<li><ToggleButton bind:group={inputMode} value={k}>{v}</ToggleButton></li>
				{/each}
			</ul>
			{#if inputMode === 'bin'}
				<BinReader
					onloaded={(...data) => {
						_bd = data;
					}}
				/>
				{#if _bd}
					<a
						type="button"
						href={base + '/flight/create/box'}
						class="btn btn-outline-primary form-control"
						on:click={() => {
							$bin = _bd[0];
							$binData = _bd[1];
							$bootTime = _bd[2];
						}}
					>
						Next
					</a>
				{/if}
			{:else if inputMode === 'fcj' || inputMode === 'state'}
				<label
					for="fcjfile"
					class="btn btn-outline-secondary form-control text-nowrap"
					style:overflow="hidden"
				>
					{#if files && files.length > 0}
						{files[0].name}
					{:else}
						Select File
					{/if}
				</label>
				<input
					id="fcjfile"
					class="form-control"
					type="file"
					accept=".json"
					bind:files
					style="display:none"
				/>
				{#if files && files.length > 0}
					<button
						class="btn btn-outline-secondary form-control"
						on:click={() => {parseFile(files[0]);}}
					>
						Load
					</button>
				{/if}
				{#if _fcj}
					<div class="input-group-text">
						<input
							id="getmans"
							class="form-check-input mt-0"
							type="checkbox"
							bind:checked={getmans}
							aria-label="Parse manoeuvre split locations from FC json"
						/>
						<label for="getmans" class="form-check-label">Include Manoeuvres</label>
					</div>
        {/if}
        {#if _states || _fcj}
					<a
						type="button"
						href={base + '/flight/create/manoeuvres'}
						class="btn btn-outline-primary form-control"
            data-sveltekit-preload-data="false"
						on:click={() => {
							$fcj = _fcj;
              $states = _states;
						}}
					>
						Next
					</a>
				{/if}
			{/if}
		</div>
	</div>
	<div class="row">
		{#if inputMode === 'bin' && $binData}
			<FieldInfo bind:binData={$binData} />
		{/if}
	</div>
</div>
