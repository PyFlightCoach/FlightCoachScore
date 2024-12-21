<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import { base } from '$app/paths';
	import { user } from '$lib/stores/user';
	import { dbServer } from '$lib/api';
	import { goto } from '$app/navigation';

</script>

<NavMenu tooltip="User Menu">
	<span slot="icon"><i class="bi bi-person"></i></span>
	{#if $user}
		<a class="dropdown-item" href="{base}/user/profile">Profile</a>
		<button
			class="btn dropdown-item"
			onclick={() => {
        dbServer.post('auth/jwt/logout', {});
    	$user =undefined;
		goto(base + '/')
      }}>Logout
    </button>
	{:else}
		<a class="dropdown-item" href="{base}/user/login">Login</a>
		<a class="dropdown-item" href="{base}/user/register">Sign Up</a>
	{/if}
</NavMenu>

