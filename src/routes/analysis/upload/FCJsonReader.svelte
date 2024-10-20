<script lang="ts">
	import { FCJson } from '$lib/fcjson';
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

	export let fcj: FCJson = undefined;

	const loadFCJ = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = () => {
			const contents = reader.result as string;
			fcj = FCJson.parse(JSON.parse(contents));
			dispatch('newFCJ', {fcj});
		};
		reader.readAsText(file);
		ddopen = false;
	};


	let ddopen = false;
</script>

<Button>{fcj ? fcj.name : 'FC json'} <ChevronDownOutline /></Button>
<Dropdown bind:open={ddopen}>
	{#if !fcj}
		<DropdownItem>
			<Fileupload on:change={loadFCJ} accept=".F3A, .f3a, .json" />
		</DropdownItem>
	{:else}
		<DropdownItem on:click={()=>{fcj=undefined}}>Clear</DropdownItem>
	{/if}
</Dropdown>
