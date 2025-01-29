<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ServerSelection from '$lib/components/ServerSelection.svelte';
	import { base } from '$app/paths';
	import { dev } from '$lib/stores/shared';
	import { an_servers, anSOption, customAnalysisServer, dbServer, db_servers } from '$lib/api';
	import { dbSOption, customDbServer } from '$lib/api';
	import { user } from '$lib/stores/user';
  import {reloadSchedules} from '$lib/schedules/library';
  import {loadGuiLists} from '$lib/stores/shared';
	import { loadRules } from '$lib/schedules/builder';
</script>

<NavMenu tooltip="Super User Menu">
	<span slot="icon"><i class="bi bi-star"></i> </span>

	{#if $user?.is_superuser || $dev}
		<ServerSelection
			title="Analysis Server"
			options={Object.keys(an_servers)}
			bind:custom={$customAnalysisServer}
			bind:selected={$anSOption}
      onselected={() => {
        console.log("Analysis Server address changed, reloading info...");
        loadRules();
      }}
		/>
		<div class="dropdown-divider"></div>
		<ServerSelection
			title="Database Server"
			options={Object.keys(db_servers)}
			bind:custom={$customDbServer}
			bind:selected={$dbSOption}
      onselected={() => {
        console.log("DB Server address changed, reloading info...");
        $user = undefined;
        loadGuiLists();
        reloadSchedules();
      }}
		/>
	{/if}
	<hr />
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
	{/if}
</NavMenu>
