<script lang="ts">
  import { base } from '$app/paths';
  import { user } from '$lib/stores/user';
  import NavMenu from '$lib/components/NavMenu.svelte';
  import {page} from '$app/stores';

  const plink = (name: string) => base + '/schedule/' + name;
  const isLoaded = (name: string) => $page.url.pathname.includes(name) ? 'active' : '';

</script>


<a class="col-auto nav-link {isLoaded('browse')}" href={plink('browse')}>Browse</a>
{#if $user?.is_superuser}
<a class="col-auto nav-link {isLoaded('create')}" href={plink('create')}>Create</a>
{/if}