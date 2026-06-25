<script lang="ts">
	import { page } from '$app/state';

	let password = $state('');
	let confirmPassword = $state('');

	let loading = $state(false);
	let success = $state('');
	let error = $state('');

	const token = page.url.searchParams.get('token');

	async function resetPassword() {
		success = '';
		error = '';

		if (!token) {
			error = 'Invalid reset link.';
			return;
		}

		if (!password.trim()) {
			error = 'Please enter a new password.';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token,
					password
				})
			});

			const result = await response.json();

			if (result.success) {
				success = result.message;

				setTimeout(() => {
					window.location.href = '/login';
				}, 2000);
			} else {
				error = result.message;
			}
		} catch (err) {
			console.error(err);
			error = 'Network error.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
	<div class="bg-white rounded-2xl border border-slate-200 p-10 w-full max-w-sm">

		<h1 class="text-2xl font-semibold mb-2">
			Reset Password
		</h1>

		<p class="text-slate-500 text-sm mb-6">
			Enter your new password.
		</p>

		{#if success}
			<div class="mb-4 rounded-lg bg-green-100 text-green-700 p-3">
				{success}
			</div>
		{/if}

		{#if error}
			<div class="mb-4 rounded-lg bg-red-100 text-red-700 p-3">
				{error}
			</div>
		{/if}

		<div class="mb-4">
			<label class="block text-sm mb-2">
				New Password
			</label>

			<input
				type="password"
				bind:value={password}
				class="w-full border rounded-lg px-3 py-2"
				placeholder="Enter new password"
			/>
		</div>

		<div class="mb-6">
			<label class="block text-sm mb-2">
				Confirm Password
			</label>

			<input
				type="password"
				bind:value={confirmPassword}
				class="w-full border rounded-lg px-3 py-2"
				placeholder="Confirm password"
			/>
		</div>

		<button
			type="button"
			onclick={resetPassword}
			disabled={loading}
			class="w-full bg-slate-900 text-white rounded-lg py-3 hover:bg-slate-800 disabled:opacity-50"
		>
			{#if loading}
				Resetting...
			{:else}
				Reset Password
			{/if}
		</button>

	</div>
</div>