<script lang="ts">
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let error = $state('');

  function validate(): string {
    if (!email.trim()) return 'Enter your email address.';
    if (!email.includes('@')) return "That doesn't look like a valid email.";
    if (!password) return 'Enter your password.';
    return '';
  }

  async function login() {
    error = '';
    const validationError = validate();
    if (validationError) { error = validationError; return; }

    loading = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        error = result.message ?? 'Incorrect email or password.';
      }
    } catch {
      error = 'Something went wrong. Try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
  <div class="bg-white rounded-2xl border border-slate-200 p-10 w-full max-w-sm">

    <!-- Icon -->
    <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>

    <h1 class="text-xl font-medium text-slate-900 mb-1">Welcome back</h1>
    <p class="text-sm text-slate-500 mb-6">Sign in to your account</p>

    <!-- Error banner -->
    {#if error}
      <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {error}
      </div>
    {/if}

    <!-- Fields -->
    <div class="flex flex-col gap-3.5 mb-5">

      <!-- Email -->
      <div>
        <label for="email" class="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
        <input
          id="email"
          bind:value={email}
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          class="w-full h-10 border border-slate-200 rounded-xl px-3.5 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent transition"
        />
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label for="password" class="text-xs font-medium text-slate-600">Password</label>
          <a href="/forgot-password" class="text-xs text-blue-600 hover:underline">Forgot password?</a>
        </div>
        <div class="relative">
          <input
            id="password"
            bind:value={password}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autocomplete="current-password"
            onkeydown={(e) => e.key === 'Enter' && login()}
            class="w-full h-10 border border-slate-200 rounded-xl px-3.5 pr-11 text-sm text-slate-900
                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent transition"
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>

    </div>

    <!-- Submit -->
    <button
      onclick={login}
      disabled={loading}
      class="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
             text-white font-medium text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
    >
      {#if loading}
        <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Signing in…
      {:else}
        Sign in
      {/if}
    </button>

    <div class="border-t border-slate-100 mt-6 pt-5">
      <p class="text-center text-xs text-slate-500">
        No account? <a href="/signup" class="text-blue-600 hover:underline">Create one</a>
      </p>
    </div>

  </div>
</div>