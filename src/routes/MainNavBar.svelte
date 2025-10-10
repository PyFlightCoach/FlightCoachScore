<script lang="ts">
	import { base, resolve } from '$app/paths';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import CDMenu from './CDMenu.svelte';
	import SuperMenu from './SuperMenu.svelte';
	import { user } from '$lib/stores/user';
	import { dev } from '$lib/stores/shared';
	import * as nbc from '$lib/stores/navBarContents';
	import { nMans, nRunning } from '$lib/stores/analysis';
	import { servers } from '$lib/api';
	import { navBarContents } from '$lib/stores/navBarContents';

	let { hasHelp = $bindable() }: { hasHelp: boolean } = $props();

	const n = $derived($nMans - $nRunning);

</script>

<nav
	class="navbar navbar-expand-md {$servers === 'uk' ? 'bg-body-tertiary' : 'bg-primary'}"
	data-bs-theme="dark"
>
	<div class="container-fluid justify-content-between">
		<div class="col-auto d-flex flex-row">
			<a class="col-auto navbar-brand" href={resolve('/')}>FCScore</a>
			<ul class="col-auto navbar-nav flex-row">
				<UserMenu />
				<FlightMenu />
				<DataBaseMenu />
				{#if $user?.is_verified}
					<CDMenu />
				{/if}
				{#if $user?.is_superuser || $dev}
					<SuperMenu />
				{/if}

				{#if $servers != 'uk'}
					<a
						class="nav-link"
						href="{resolve('/')}?main"
						aria-label="Server Warning!"
						data-sveltekit-preload-data="tap"
						title="You are talking to a {$servers} server, this is not reccommended! Click here to switch to the UK server."
					>
						<i class="bi bi-exclamation-triangle strong"></i>
					</a>
				{/if}

				<div class="nav-item">
					<button
						class="nav-link ms-2"
						id="navbarDropdown"
						title="help"
						aria-label="Help Menu"
						data-bs-toggle="offcanvas"
						data-bs-target="#help"
						aria-controls="Offcanvas"
						disabled={!hasHelp}
					>
						<span><i class="bi bi-question"></i></span>
					</button>
				</div>
			</ul>
		</div>

		<div class="col navbar-nav d-none d-lg-block" id="pageMenu">
      <div class="row">
			{#each $navBarContents.items as pageLink, i }
				<button
					class="col nav-link {$navBarContents.active.has(pageLink.name) ? 'active' : ''}"
					role="link"
					onclick={() => {nbc.click(i)}}
					title={pageLink.title}
					data-sveltekit-preload-data="tap"
					disabled={pageLink.disabled}
				>
					{pageLink.name}
				</button>
			{/each}
      </div>
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
			</div>
		</ul>
	</div>
</nav>
