<script lang="ts">
	import { resolve } from '$app/paths';
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
	import { activeFlight } from '$lib/stores/shared';
	import { navBarContents } from '$lib/stores/navBarContents';
	import { page } from '$app/state';
	import { analyseAll, clearDataLoading } from '$lib/flight/analysis';
  import { goto } from '$app/navigation';

  
	let { hasHelp = $bindable() }: { hasHelp: boolean } = $props();

	const navBarItems = $derived({
		'/flight': $activeFlight
			? [
					{
						name: 'Box',
						href: '/flight/create/box/',
						icon: 'bi-box',
						title: 'Locate the aerobatic box',
						disabled: !$activeFlight
					},
					{
						name: 'Manoeuvres',
						href: '/flight/create/manoeuvres/',
						icon: 'bi-scissors',
						title: 'Segment the flight into manoeuvres',
						disabled: !$activeFlight?.segmentation
					},
					{
						name: 'Results',
						href: '/flight/results/',
						icon: 'bi-card-list',
						title: 'View the analysis results',
						disabled: !$activeFlight?.segmentation
					},
					...($user?.is_superuser
						? [
								{
									name: 'Optimise All',
									onclick: () => {
										analyseAll(true, true);
									},
									icon: 'bi-plus-circle',
									title: 'Load flight data',
									disabled: false
								}
							]
						: [])
				]
			: [],
		'/flight/results/manoeuvre': [
			{
				name: 'View',
				href: '/flight/results/manoeuvre/',
				icon: 'bi-card-text',
				title: 'View Manoeuvre',
				disabled: false
			},
			{
				name: 'Segmentation',
				href: '/flight/results/manoeuvre/segmentation/',
				icon: 'bi-align-center',
				title: 'Edit Element Segmentation',
				disabled: false
			},
			{
				name: 'Intra',
				href: '/flight/results/manoeuvre/intra/',
				icon: 'bi-columns-gap',
				title: 'Intra Element Downgrades',
				disabled: false
			},
			{
				name: 'Inter',
				href: '/flight/results/manoeuvre/inter/',
				icon: 'bi-columns',
				title: 'Inter Element Downgrades',
				disabled: false
			},
			{
				name: 'Positioning',
				href: '/flight/results/manoeuvre/positioning/',
				icon: 'bi-box',
				title: 'Box downgrades',
				disabled: false
			},
			{
				name: 'Templates',
				href: '/flight/results/manoeuvre/templates/',
				icon: 'bi-file-earmark-text',
				title: 'Show templates',
				disabled: false
			},
			{
				name: 'Back',
				icon: 'bi-arrow-left',
				title: 'Back to results',
        onclick: () =>{goto(resolve('/flight/results'))},
				disabled: false
			}
		],
		'/database': [
			{
				href: '/database/leaderboards/',
				name: 'Leaderboards',
				title: 'Show results in a table',
				icon: 'bi-trophy'
			},
			{
				href: '/database/map/',
				name: 'Map',
				title: 'Show results in a map',
				icon: 'bi-map'
			}
		],
		'/competition/view': [
			{
				name: 'Results',
				icon: 'bi-trophy',
				title: 'Show results table',
        active: true,
			},
			{
				name: 'Running Order',
				icon: 'bi-list-ol',
				title: 'Show running order table'
			}
		]
	});

	const n = $derived($nMans - $nRunning);

	$effect(() => {
    let selectedNavBarItems = undefined;
      
    for (const [path, items] of Object.entries(navBarItems)) {
      console.log("checking:", resolve(path));    
      if (page.url.pathname.startsWith(resolve(path))) {
        selectedNavBarItems = items;
        break;
      }
    }

    nbc.reset(selectedNavBarItems || []);

	});

	//$effect(()=>{nbc.checkUrl(page.url.pathname)});
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
						<span><i class="bi bi-question-lg"></i></span>
					</button>
				</div>
			</ul>
		</div>

		<div class="col navbar-nav d-none d-lg-block" id="pageMenu">
			<div class="row px-4">
				{#each $navBarContents.items as pageLink, i}
					<button
						class="col-auto px-3 nav-link {pageLink.active
							? 'active'
							: ''}"
						role="link"
						onclick={() => {
							nbc.click(i);
						}}
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
						: 'text-danger'} d-none d-sm-block fw-bold"
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
