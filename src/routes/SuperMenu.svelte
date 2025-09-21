<script lang="ts">
	import NavMenu from './NavMenu.svelte';
	import { base } from '$app/paths';
	import { activeFlight, dev } from '$lib/stores/shared';
	import { servers, dbServer } from '$lib/api/api';
	import { user } from '$lib/stores/user';
	import { postUploadSearch } from '$lib/leaderboards/stores';
	import { goto } from '$app/navigation';


</script>

<NavMenu tooltip="Super User Menu">
	<span slot="icon"><i class="bi bi-star"></i> </span>

	<small class="dropdown-header">Management</small>
	<a class="dropdown-item" href="{base}/news">News</a>
	<a class="dropdown-item" href="{base}/user/manage">Users</a>
  <a class="dropdown-item" href="{base}/telemetry">Telemetry</a>
	<hr />
	<small class="dropdown-header">Debugging</small>
	<button
		class="dropdown-item"
		title="Temporarily make me a normal user to see how it looks."
		onclick={() => {
			$dev = false;
			user.update((u) => {
        if (u) u.is_superuser = false;
				return u;
			});
		}}
	>
		Make Me Normal
	</button>
	{#if dev}
		<button
			class="dropdown-item"
			onclick={() => {
				dbServer.post('auth/jwt/logout', {});
			}}
		>
			Invalidate Token
		</button>
		<button
			class="dropdown-item"
			onclick={() => {
				if ($user) {
					$user.is_verified = false;
				}
			}}
		>
			Uverify me
		</button>
    {#if $activeFlight}
      <button
        class="dropdown-item"
        onclick={() => {
          postUploadSearch();
          goto(base + '/database/query/leaderboards');
        }}
      >
        Post Upload Test
      </button>
    {/if}
	{/if}
  
  
</NavMenu>
