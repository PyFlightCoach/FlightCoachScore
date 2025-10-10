<script lang="ts">
	import NavMenu from './NavMenu.svelte';
	import { resolve } from '$app/paths';
	import { user, logoutUser } from '$lib/stores/user';

</script>

<NavMenu tooltip="User Menu">
	<span slot="icon"><i class="bi {$user ? 'bi-person-fill' : 'bi-person'}"></i></span>
	{#if $user}
    <div class="dropdown-item-text">
      <strong>{$user.first_name} {$user.last_name}</strong>
    </div>
		<a class="dropdown-item" href="{resolve('/user/profile')}">Profile</a>
		<button
			class="btn dropdown-item"
			onclick={logoutUser}
    >Logout
    </button>
	{:else}
		<a class="dropdown-item" href="{resolve('/user/login')}">Login</a>
		<a class="dropdown-item" href="{resolve('/user/register')}">Sign Up</a>
	{/if}
</NavMenu>

