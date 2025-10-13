<script lang="ts">
	import type { ContestManager } from '../compthings/ContestManager';
	import { reloadDropDownComps, setComp } from '$lib/stores/contests';
	import { split_country } from '$lib/utils/countries.js';
	import type { CreateFakeUserRequest } from '../../api/DBInterfaces/competition';
	import { loading } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import { prettyPrintHttpError } from '$lib/utils/text';
	import UserSearch from '$lib/components/UserSearch.svelte';

	interface CompetitorSearchResult {
		id: string;
		name: string;
		country: string;
	}

	let { competition, onadded = () => {} }: { competition: ContestManager; onadded?: () => void } =
		$props();

	let selected: CompetitorSearchResult | undefined = $state();

	let formState: string | undefined = $state();
</script>

<UserSearch
	allowFake={true}
	onadded={(newUser) => {
		$loading = true;
		competition
			.createPilot(
				newUser.id ||
					({
						first_name: newUser.forname!,
						last_name: newUser.surname!,
						email: newUser.email,
						...split_country(newUser.country!)
					} as CreateFakeUserRequest)
			)
			.then((res) => {
				return competition.addPilot(res);
			})
			.then((res) => {
				setComp(res);
				if (selected?.id === $user!.id.replaceAll('-', '')) {
					reloadDropDownComps();
				}
				onadded();
			})
			.catch((e) => {
				console.log(e);
				formState = `Failed to add pilot: ${prettyPrintHttpError(e)}`;
			})
			.finally(() => {
				$loading = false;
			});
	}}
/>
