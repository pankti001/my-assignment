<script lang="ts">
  import { goto } from '$app/navigation';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let error = $state('');
  let success = $state(false);

  type Strength = { label: string; color: string; width: string } | null;

  let strength = $derived<Strength>(() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
      { label: 'Very weak',   color: '#E24B4A', width: '20%'  },
      { label: 'Weak',        color: '#E24B4A', width: '40%'  },
      { label: 'Fair',        color: '#EF9F27', width: '60%'  },
      { label: 'Strong',      color: '#1D9E75', width: '80%'  },
      { label: 'Very strong', color: '#0F6E56', width: '100%' },
    ];
    return map[Math.max(0, score - 1)];
  });

  function validate(): string {
    if (!name.trim()) return 'Enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Enter a valid email address.';
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  async function signup() {
    error = '';
    const validationError = validate();
    if (validationError) { error = validationError; return; }

    loading = true;
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (result.success) {
        success = true;
        // Brief pause so the user sees the success banner, then redirect to login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        goto('/login');
      } else {
        error = result.message ?? 'Something went wrong. Try again.';
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

    <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    </div>

    <h1 class="text-xl font-medium text-slate-900 mb-1">Create an account</h1>
    <p class="text-sm text-slate-500 mb-6">Get started for free today</p>

    {#if error}
      <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {error}
      </div>
    {/if}

    {#if success}
      <div class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Account created! Redirecting to login…
      </div>
    {/if}

    <div class="space-y-4 mb-6">
      <div>
        <label for="name" class="block text-xs font-medium text-slate-600 mb-1.5">Full name</label>
        <input
          id="name"
          bind:value={name}
          type="text"
          placeholder="Jane Smith"
          autocomplete="name"
          class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent transition"
        />
      </div>

      <div>
        <label for="email" class="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
        <input
          id="email"
          bind:value={email}
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent transition"
        />
      </div>

      <div>
        <label for="password" class="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
        <div class="relative">
          <input
            id="password"
            bind:value={password}
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            autocomplete="new-password"
            onkeydown={(e) => e.key === 'Enter' && signup()}
            class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-11 text-sm text-slate-900
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

        {#if strength}
          <div class="mt-2 h-0.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-200"
              style="width: {strength.width}; background: {strength.color};"
            ></div>
          </div>
          <p class="text-xs mt-1" style="color: {strength.color};">{strength.label}</p>
        {/if}
      </div>
    </div>

    <button
      onclick={signup}
      disabled={loading || success}
      class="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
             text-white font-medium text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
    >
      {#if loading}
        <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Creating account…
      {:else if success}
        Redirecting…
      {:else}
        Create account
      {/if}
    </button>

    <p class="text-center text-xs text-slate-500 mt-5">
      Already have an account? <a href="/login" class="text-blue-600 hover:underline">Sign in</a>
    </p>

  </div>
</div>
