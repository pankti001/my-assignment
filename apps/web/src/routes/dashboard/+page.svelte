<script lang="ts">
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';

  let mobileNavOpen = $state(false);

  function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    user.set(null);
    goto('/login');
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="app-shell h-dvh w-full flex overflow-hidden">

  <!-- Mobile backdrop -->
  {#if mobileNavOpen}
    <button
      class="fixed inset-0 z-30 bg-black/30 md:hidden"
      onclick={() => (mobileNavOpen = false)}
      aria-label="Close menu"
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside
    class="fixed md:static inset-y-0 left-0 z-40 w-64 h-full shrink-0 bg-white border-r border-[var(--hairline)]
           flex flex-col transition-transform duration-200 ease-out
           {mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0"
  >
    <!-- Brand -->
    <div class="flex items-center justify-between h-16 px-5 border-b border-[var(--hairline)] shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#EEECFC;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
            stroke="#4338CA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>
        <span class="font-display text-[15px] font-semibold tracking-tight text-[var(--ink)]">Workbench</span>
      </div>
      <button
        aria-label="Close menu"
        onclick={() => (mobileNavOpen = false)}
        class="md:hidden w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <p class="font-mono-label px-3 mb-2 text-[10px] tracking-[0.12em] text-[var(--ink-muted)] uppercase">
        Workspace
      </p>

      <a href="/"
        class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold bg-slate-50 text-[var(--ink)]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <span class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:#EEECFC;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
            stroke="#4338CA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </span>
        Dashboard
      </a>

      <a href="/animation"
        class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600
               hover:bg-slate-50 hover:text-slate-900 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <span class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:#EEEDFE;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
            stroke="#534AB7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
          </svg>
        </span>
        Animation
      </a>

      <a href="/resume"
        class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600
               hover:bg-slate-50 hover:text-slate-900 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <span class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:#E1F5EE;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
            stroke="#0F6E56" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </span>
        Resume builder
      </a>

      <a href="/graph"
        class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600
               hover:bg-slate-50 hover:text-slate-900 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <span class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:#FAEEDA;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
            stroke="#854F0B" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </span>
        Graph editor
      </a>
    </nav>

    <!-- Account -->
    <div class="border-t border-[var(--hairline)] p-3 shrink-0">
      {#if $user}
        <div class="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center
                      text-xs font-semibold text-[#4338CA] shrink-0">
            {initials($user.name)}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--ink)] truncate">{$user.name}</p>
            <p class="text-xs text-[var(--ink-muted)] truncate">{$user.email}</p>
          </div>
        </div>
      {/if}
      <button
        onclick={logout}
        class="w-full mt-1 flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500
               hover:bg-red-50 hover:text-red-600 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  </aside>

  <!-- Main column -->
  <div class="flex-1 flex flex-col h-full min-w-0">

    <!-- Topbar -->
    <header class="h-16 shrink-0 flex items-center px-4 md:px-7 border-b border-[var(--hairline)] bg-white">
      <button
        aria-label="Open menu"
        onclick={() => (mobileNavOpen = true)}
        class="md:hidden w-9 h-9 rounded-lg border border-[var(--hairline)] flex items-center justify-center
               text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </button>

      <div class="flex items-center gap-3 ml-auto">
        <button aria-label="Notifications"
          class="w-9 h-9 rounded-full border border-[var(--hairline)] flex items-center justify-center
                 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {#if $user}
          <div class="hidden sm:flex items-center gap-2 bg-slate-50 border border-[var(--hairline)] rounded-full
                      pl-1.5 pr-3 py-1 text-sm text-[var(--ink)]">
            <div class="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center
                        text-[11px] font-semibold text-[#4338CA]">
              {initials($user.name)}
            </div>
            {$user.name}
          </div>
        {/if}
      </div>
    </header>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto canvas-grid">
      <div class="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">

        <div class="mb-8">
          <h1 class="font-display text-2xl font-semibold text-[var(--ink)] mb-1">
            {greeting()}{$user ? `, ${$user.name.split(' ')[0]}` : ''}
          </h1>
          <p class="text-sm text-[var(--ink-muted)]">Here's what you can build today.</p>
        </div>

        <!-- Tool cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <a href="/animation"
            class="group block bg-white border border-[var(--hairline)] rounded-xl p-5 no-underline
                   transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style="background:#EEEDFE;">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
                fill="none" stroke="#534AB7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[var(--ink)] mb-0.5">Animation</p>
            <p class="text-xs text-[var(--ink-muted)] mb-3">Build motion sequences</p>
            <span class="text-xs font-medium text-[#534AB7] opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </a>

          <a href="/resume"
            class="group block bg-white border border-[var(--hairline)] rounded-xl p-5 no-underline
                   transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style="background:#E1F5EE;">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
                fill="none" stroke="#0F6E56" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[var(--ink)] mb-0.5">Resume builder</p>
            <p class="text-xs text-[var(--ink-muted)] mb-3">Create your CV</p>
            <span class="text-xs font-medium text-[#0F6E56] opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </a>

          <a href="/graph"
            class="group block bg-white border border-[var(--hairline)] rounded-xl p-5 no-underline
                   transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style="background:#FAEEDA;">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
                fill="none" stroke="#854F0B" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[var(--ink)] mb-0.5">Graph editor</p>
            <p class="text-xs text-[var(--ink-muted)] mb-3">Visualize your data</p>
            <span class="text-xs font-medium text-[#854F0B] opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </a>

        </div>

        <!-- Last session -->
        <div class="bg-white border border-[var(--hairline)] rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:#E1F5EE;">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
                fill="none" stroke="#0F6E56" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p class="font-mono-label text-[10px] tracking-[0.1em] text-[var(--ink-muted)] uppercase mb-0.5">
                Last session
              </p>
              <p class="text-sm text-[var(--ink)]">Resume Builder · 2 hours ago</p>
            </div>
          </div>
          <a href="/resume"
            class="text-xs font-medium text-[#0F6E56] hover:underline shrink-0
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] rounded">
            Continue →
          </a>
        </div>

      </div>
    </div>
  </div>
</div>

<style>
  .app-shell {
    --canvas: #f5f5f2;
    --ink: #16181c;
    --ink-muted: #6e7178;
    --hairline: #e4e4e0;
    --signal: #4338ca;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    background: var(--canvas);
    color: var(--ink);
  }

  .font-display {
    font-family: 'Sora', ui-sans-serif, system-ui, sans-serif;
  }

  .font-mono-label {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
  }

  .canvas-grid {
    background-image: radial-gradient(circle, var(--hairline) 1px, transparent 1px);
    background-size: 22px 22px;
  }

  @media (prefers-reduced-motion: reduce) {
    .app-shell * {
      transition-duration: 0.001ms !important;
      animation-duration: 0.001ms !important;
    }
  }
</style>