<script lang="ts">
  import {page} from '$app/stores';
	import { onMount } from 'svelte';
  import MarkdownIt from "markdown-it";
  import {help} from '$lib/stores/shared';
  import {getHelp} from '$lib/help';
  //import md from './flight/create/data/help.md?raw';

      
  const md = new MarkdownIt();
</script>

<div class="nav-item dropdown">
	<button
		class="nav-link dropdown-toggle ms-2"
		id="navbarDropdown"
		data-bs-toggle="dropdown"
		aria-expanded="false"
		title="help"
		aria-label="Help Menu"
	>
		<span><i class="bi bi-question"></i></span>
	</button>
	<div class="dropdown-menu container bg-secondary">
    {@html md.render(getHelp($page.url.pathname))}
</div>
</div>
