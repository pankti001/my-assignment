<script lang="ts">
  let email = $state('');
  let loading = $state(false);
  let message = $state('');
  let error = $state('');

  function validate(): string {
    if (!email.trim()) return 'Please enter your email address.';
    if (!email.includes('@')) return "That doesn't look like a valid email.";
    return '';
  }

  async function sendResetLink() {
    message = '';
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
        message = result.message;
        email = '';
      } else {
        error = result.message ?? 'Something went wrong.';
      }
    } catch (err) {
      console.error(err);
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
        <rect x="3" y="8" width="18" height="13" rx="2"/>
        <path d="M3 8l9 7 9-7"/>
      </svg>
    </div>

    <h1 class="text-xl font-medium text-slate-900 mb-1">Forgot password?</h1>
    <p class="text-sm text-slate-500 mb-6 leading-relaxed">
      Enter your email and we'll send you a reset link.
    </p>

    <!-- Success banner -->
    {#if message}
      <div class="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {message}
      </div>
    {/if}

    <!-- Error banner -->
    {#if error}
      <div class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {error}
      </div>
    {/if}

    <!-- Field -->
    <div class="mb-5">
      <label for="email" class="block text-xs font-medium text-slate-600 mb-1.5">
        Email address
      </label>
      <input
        id="email"
        bind:value={email}
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        onkeydown={(e) => e.key === 'Enter' && sendResetLink()}
        class="w-full h-10 border border-slate-200 rounded-xl px-3.5 text-sm text-slate-900
               placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent transition"
      />
    </div>

    <!-- Submit -->
    <button
      type="button"
      onclick={sendResetLink}
      disabled={loading}
      class="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
             text-white font-medium text-sm py-2.5 rounded-xl transition"
    >
      {loading ? 'Sending…' : 'Send reset link'}
    </button>

    <div class="border-t border-slate-100 mt-6 pt-5">
      <p class="text-center text-xs text-slate-500">
        <a href="/login" class="text-blue-600 hover:underline">← Back to sign in</a>
      </p>
    </div>

  </div>
</div>