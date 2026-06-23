<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen flex flex-col items-center justify-center gap-6">
	<h1 class="text-5xl font-bold">
		Assignment Dashboard
	</h1>

	<p class="text-muted-foreground">
		SvelteKit + Clerk + NeonDB + Threlte + Svelte Flow
	</p>

	<div class="flex gap-4">
		<Button href="/dashboard">
			Open Dashboard
		</Button>
	</div>
</div>