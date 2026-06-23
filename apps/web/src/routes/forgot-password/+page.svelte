<script lang="ts">
  let email = $state('');
  let loading = $state(false);
  let error = $state('');
  let sent = $state(false);
  let resendCooldown = $state(false);

  function validate(): string {
    if (!email.trim()) return 'Enter your email address.';
    if (!email.includes('@')) return 'That doesn\'t look like a valid email.';
    return '';
  }

  async function requestReset() {
    error = '';
    const validationError = validate();
    if (validationError) { error = validationError; return; }

    loading = true;
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.success) {
        sent = true;
      } else {
        error = result.message ?? 'Something went wrong. Try again.';
      }
    } catch {
      error = 'Something went wrong. Try again.';
    } finally {
      loading = false;
    }
  }

  async function resend() {
    if (resendCooldown) return;
    resendCooldown = true;
    try {
      await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* silent */ }
    setTimeout(() => { resendCooldown = false; }, 30_000);
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
  <div class="bg-white rounded-2xl border border-slate-200 p-10 w-full max-w-sm">

    {#if !sent}

      <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 2H3v16h5l3 3 3-3h7V2z"/>
          <line x1="12" y1="7" x2="12" y2="11"/><line x1="12" y1="15" x2="12.01" y2="15"/>
        </svg>
      </div>

      <h1 class="text-xl font-medium text-slate-900 mb-1">Forgot your password?</h1>
      <p class="text-sm text-slate-500 mb-6">Enter your email and we'll send you a reset link.</p>

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

      <div class="mb-6">
        <label for="email" class="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
        <input
          id="email"
          bind:value={email}
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          onkeydown={(e) => e.key === 'Enter' && requestReset()}
          class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent transition"
        />
      </div>

      <button
        onclick={requestReset}
        disabled={loading}
        class="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
               text-white font-medium text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2 mb-5"
      >
        {#if loading}
          <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Sending…
        {:else}
          Send reset link
        {/if}
      </button>

      <p class="text-center text-xs text-slate-500">
        <a href="/login" class="text-blue-600 hover:underline inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to sign in
        </a>
      </p>

    {:else}

      <div class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-green-600" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h2 class="text-xl font-medium text-slate-900 mb-2 text-center">Check your inbox</h2>
      <p class="text-sm text-slate-500 text-center leading-relaxed mb-6">
        We sent a reset link to <span class="font-medium text-slate-900">{email}</span>.
        It expires in 15 minutes.
      </p>

      <div class="bg-slate-50 rounded-xl px-4 py-3 mb-6 flex gap-3 items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p class="text-xs text-slate-500 leading-relaxed">
          Didn't get it? Check your spam folder, or
          <button
            onclick={resend}
            disabled={resendCooldown}
            class="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendCooldown ? 'email sent' : 'resend the email'}
          </button>.
        </p>
      </div>

      <p class="text-center text-xs text-slate-500">
        <a href="/login" class="text-blue-600 hover:underline inline-flex items-center gap-1 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to sign in
        </a>
      </p>

    {/if}

  </div>
</div>