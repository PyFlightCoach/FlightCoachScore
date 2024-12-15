<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ServerSelection from '$lib/components/ServerSelection.svelte';
	import { dev } from '$lib/stores/shared';
	import { an_servers, anSOption, customAnalysisServer, dbServer } from '$lib/api';
	import { dbSOption, customDbServer } from '$lib/api';
	import { user } from '$lib/stores/user';
</script>

<NavMenu tooltip="Super User Menu">
	<span slot="icon"><i class="bi bi-star"></i> </span>

	{#if $user?.is_superuser || $dev}
		<ServerSelection
			title="Analysis Server"
			options={Object.keys(an_servers)}
			bind:custom={$customAnalysisServer}
			bind:selected={$anSOption}
		/>
	{/if}
	{#if $dev}
		<div class="dropdown-divider"></div>
		<ServerSelection
			title="Database Server"
			options={['uk']}
			bind:custom={$customDbServer}
			bind:selected={$dbSOption}
		/>
	{/if}
	<button
		class="dropdown-item"
		title="Temporarily make me a normal user to see how it looks."
		on:click={() => {
			$dev = false;
			user.update((u) => {
				u.is_superuser = false;
				return u;
			});
		}}
	>
		Make Me Normal
	</button>
	{#if dev}
		<button
			class="dropdown-item"
			on:click={() => {
				dbServer.post('auth/jwt/logout', {});
			}}
		>
			Invalidate Token
		</button>
    <button class="dropdown-item"
      on:click={()=>{if ($user) {$user.is_verified=false}}}
    >
      Uverify me
    </button>
	{/if}
</NavMenu>
