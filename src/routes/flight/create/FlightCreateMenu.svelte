<script lang="ts">
	import { binData, bin, origin } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let datActive = $derived(page.url.pathname.includes('data') ? 'active' : '');
	let manActive = $derived(page.url.pathname.includes('manoeuvres') ? 'active' : '');
	let datEnabled = $derived('');
	let manEnabled = $derived($origin && $binData ? '' : 'disabled');
</script>

{#if !page.url.pathname.includes('holding')}
<a class="col-auto nav-link {datActive} {datEnabled}" href={base + '/flight/create/data'}
  >1 Load Flight Data</a
>
<a class="col-auto nav-link {manActive} {manEnabled}" href={base + '/flight/create/manoeuvres'}
  >2 Select Manoeuvres</a
>
{/if}

