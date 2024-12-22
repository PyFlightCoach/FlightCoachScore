<script lang="ts">
	import { dbServer } from '$lib/api';
	import { countries, split_country } from '$lib/countries.js';
	import { goto } from '$app/navigation';
  	import {base} from '$app/paths';
  
	let form_state: string | undefined;

	async function _handleSubmit(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			if (!fdata.has('accept-terms')) {
				form_state = 'Please review and accept the Terms of Use.';
				return;
			}

			if (fdata.get('new-password') != fdata.get('password-confirm')) {
				form_state = 'Passwords do not match, please try again.';
				return;
			}

			const s_country = split_country(fdata.get('country'));

			const user = {
				first_name: fdata.get('first_name'),
				last_name: fdata.get('last_name'),
				email: fdata.get('email'),
				password: fdata.get('new-password'),
				country: s_country[0],
				country_emoji: s_country[1]
			};

			form_state = undefined;

			const res = await dbServer.post('auth/register', user);

			// Registration was successful
			goto(`${base}/user/verify-request?email=${user.email}`);
		} catch (error) {
			form_state = 'Oops...something has gone wrong. Please try again later.';
		}
	}
</script>

<div class="container" style="max-width:800px">
	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}

	<form class="row mt-4" method="POST" on:submit|preventDefault={_handleSubmit}>
		<div class="col">
			<div class="mb-3">
				<label for="first_name" class="form-label">First Name</label>
				<input type="text" class="form-control" id="first_name" name="first_name" required />
			</div>
		</div>
		<div class="col">
			<div class="mb-3">
				<label for="last_name" class="form-label">Last Name</label>
				<input type="text" class="form-control" id="last_name" name="last_name" required />
			</div>
		</div>

		<div class="mb-3">
			<label for="email" class="form-label">Email address</label>
			<input
				type="email"
				class="form-control"
				id="email"
				name="email"
				required
				aria-describedby="emailhelp"
			/>
			<div id="emailhelp" class="form-text">
				Your email address will be verified after registration
			</div>
		</div>

		<div class="mb-3">
			<label for="new-password" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="new-password"
				name="new-password"
				autocomplete="new-password"
				minlength="10"
				required
				aria-describedby="passwordhelp"
			/>
			<div id="passwordhelp" class="form-text">Minimum of ten characters</div>
		</div>

		<div class="mb-3">
			<input
				type="password"
				class="form-control"
				id="password-confirm"
				name="password-confirm"
				placeholder="Confirm your password"
				minlength="10"
				required
			/>
		</div>

		<div class="mb-3" style="font-family: 'Twemoji Country Flags', sans-serif !important" >
			<label for="country" class="form-label">Country</label>
			<select class="form-select" id="country" name="country" required>
				{#each countries as c}
					<option value="{c.name} {c.emoji}">{c.name} {c.emoji}</option>
				{/each}
			</select>
		</div>

		<div class="mb-3">
			<div class="custom-check checkbox-lg">
				<input class="custom-check-input" type="checkbox" value="" id="accept-terms" name="accept-terms"/>
				<label class="custom-check-label" for="accept-terms">
					I accept the Flight Coach Score Terms of Use 
				</label>
			</div>
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary me-3">Register</button>
			<button class="btn btn-link" data-bs-toggle="offcanvas" data-bs-target="#terms-of-use">View Terms of Use</button>
		</div>
	</form>

	<div class="offcanvas offcanvas-end position-fixed" tabindex="-1" id="terms-of-use">
		<div class="offcanvas-header">
			<button
				type="button"
				class="btn-close text-reset"
				data-bs-dismiss="offcanvas"
				aria-label="Close"
			></button>
		</div>
		<div class="offcanvas-body">
			<p><b>Terms of Use</b></p>
			<ul>
				<li>Any flight data you upload will be in the spirit of this database:</li>
				<ul>
					<li>Flown by yourself (or the named pilot if you are a contest director).</li>
					<li>Unadulterated and not post-processed in any way.</li>
					<li>Flown, within reason, under conditions stipulated by the rules of your discipline.</li>
				</ul>
				<li>
					Your name, country, uploaded scores and basic flight information will be shared with other 
					users in ranking tables, competition results and other forms as part of this website. 
					You may further opt to share detailed flight information.
				</li>
				<li>Your uploaded flight data may be used to further develop Flight Coach Score.</li>
				<li>At the discretion of the site administrators, your account may be suspended or deleted.</li>
			</ul>	
		</div>
	</div>
	
</div>