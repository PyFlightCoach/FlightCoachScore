<script lang="ts">
	import MarkdownIt from 'markdown-it';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import axios, { type AxiosInstance } from 'axios';

	let { hasHelp = $bindable(false) }: { hasHelp: Boolean } = $props();

	const md = new MarkdownIt({
		html: true,
		linkify: true,
		typographer: true
	});

	let help = $derived.by(async () => {
		let helpFileName = page.url.pathname
			.replaceAll('/', '_')
			.split(resolve('/').replace('/', '_'))
			.join('')
			.replace('_', '');

		helpFileName = helpFileName.endsWith('_') ? helpFileName.slice(0, -1) : helpFileName;
		return axios
			.get(`https://pyflightcoach.github.io/ScoringInfo/help/${helpFileName || 'home'}.md`)
			.then((response) => {
				hasHelp = true;
				return response.data.replace('/fcscorebase', resolve('/'));
			})
			.catch((e) => {
				hasHelp = false;
				return 'No help for this page';
			});
	});
</script>

<div class="offcanvas offcanvas-end position-fixed" tabindex="-1" id="help">
	<div class="offcanvas-header">
		<h5>Help for {page.url.pathname}</h5>
		<button
			type="button"
			class="btn-close text-reset"
			data-bs-dismiss="offcanvas"
			aria-label="Close"
		></button>
	</div>
	<div class="offcanvas-body">
		{#await help}
			Loading Help
		{:then he}
			{@html md.render(he)}
		{/await}
	</div>
</div>
