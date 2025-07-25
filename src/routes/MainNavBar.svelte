<script lang="ts">
	import { base } from '$app/paths';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import SuperMenu from './SuperMenu.svelte';
	import CdMenu from './CDMenu.svelte';
	import { user } from '$lib/stores/user';
	import { dev, help } from '$lib/stores/shared';
	import navBarContents from '$lib/stores/navBarContents';
	import { nMans, nRunning } from '$lib/stores/analysis';
	import { servers } from '$lib/api';

	const n = $derived($nMans - $nRunning);
</script>

<nav class="navbar navbar-expand-md {$servers==='uk' ? 'bg-body-tertiary' : 'bg-primary'}" data-bs-theme="dark">
	<div class="container-fluid justify-content-between">
		<div class="col-auto d-flex flex-row">
			<a class="col-auto navbar-brand" href={base + '/'}>FCScore</a>
			<ul class="col-auto navbar-nav flex-row">
				<UserMenu />
				<FlightMenu />
				<DataBaseMenu />
				{#if $user?.is_cd || $user?.is_superuser || $dev}
					<CdMenu />
				{/if}
				{#if $user?.is_superuser || $dev}
					<SuperMenu />
				{/if}
				{#if $servers != 'uk'}
					<a
						class="nav-link"
						href={base + '/?main'}
						aria-label="Server Warning!"
						data-sveltekit-preload-data="tap"
            title="You are talking to a {$servers} server, this is not reccommended! Click here to switch to the UK server."
          >
            <i class="bi bi-exclamation-triangle strong"></i>
          </a>
				{/if}
				{#if $help}
					<div class="nav-item">
						<button
							class="nav-link ms-2"
							id="navbarDropdown"
							title="help"
							aria-label="Help Menu"
							data-bs-toggle="offcanvas"
							data-bs-target="#help"
							aria-controls="Offcanvas"
						>
							<span><i class="bi bi-question"></i></span>
						</button>
					</div>
				{/if}
			</ul>
		</div>

		<div class="col navbar-nav collapse navbar-collapse" id="pageMenu">
			<svelte:component this={$navBarContents} />
		</div>

		<ul class="col-auto justify-content-end navbar-nav">
			<div class="row">
				{#if $nRunning}
					<div class="col-auto progress align-self-center d-none d-sm-block" style="width:200px">
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
				<span
					class="col-auto navbar-text mr-auto text-nowrap {$user?.is_verified
						? ''
						: 'text-danger'} d-none d-sm-block"
				>
					{#if $user}
						{$user.first_name}
						{$user.last_name}
						{$dev ? 'd' : ''}{$user.is_superuser ? '*' : ''}
					{:else}
						Not Logged In
					{/if}
				</span>
				{#if $navBarContents}
					<button
						class="col-auto navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#pageMenu"
						aria-controls="pageMenu"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span class="navbar-toggler-icon"></span>
					</button>
				{/if}
			</div>
		</ul>
	</div>
</nav>
