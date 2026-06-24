<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, loadUser } from '$lib/stores/auth';

  let { children } = $props();

  const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

  let checked = $state(false);

  onMount(async () => {
    await loadUser();
    checked = true;
  });

  $effect(() => {
    if (!checked) return;
    const isPublic = PUBLIC_ROUTES.includes($page.url.pathname);
    if ($user === null && !isPublic) {
      goto('/login');
    } else if ($user !== null && isPublic) {
      goto('/dashboard');
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if !checked}
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <svg class="w-5 h-5 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  </div>
{:else}
  {@render children()}
{/if}