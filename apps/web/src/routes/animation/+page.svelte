<script lang="ts">
	import { Canvas, T, useTask } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { goto } from '$app/navigation';

	async function logout() {
		await fetch('/api/logout', { method: 'POST' });
		goto('/login');
	}

	let autoRotate = $state(true);
	let wireframe   = $state(false);
	let meshColor   = $state('#ff6b35');

	const colorOptions = [
		{ label: 'Ember',  value: '#ff6b35' },
		{ label: 'Indigo', value: '#6366f1' },
		{ label: 'Teal',   value: '#14b8a6' },
		{ label: 'Rose',   value: '#f43f5e' },
		{ label: 'Amber',  value: '#f59e0b' },
	];
</script>

<div class="page">

	<header>
		<div class="header-left">
			<span class="badge">3D</span>
			<h1>Animation Demo</h1>
		</div>

		<nav class="header-right">
			<button class="btn btn-ghost" onclick={() => goto('/dashboard')}>
				← Dashboard
			</button>
			<button class="btn btn-danger" onclick={logout}>
				Logout
			</button>
		</nav>
	</header>

	<main>
		<div class="canvas-wrapper">
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />

				<OrbitControls
					enableDamping
					dampingFactor={0.08}
					autoRotate={autoRotate}
					autoRotateSpeed={1.8}
				/>

				<T.AmbientLight intensity={0.8} />
				<T.DirectionalLight position={[6, 8, 6]}    intensity={2.0} castShadow />
				<T.DirectionalLight position={[-4, -4, -4]} intensity={0.5} color="#b0c4ff" />
				<T.PointLight       position={[0, 4, 2]}    intensity={0.8} color="#ffd580" />

				<T.Mesh castShadow receiveShadow>
					<T.BoxGeometry args={[2, 2, 2]} />
					<T.MeshStandardMaterial
						color={meshColor}
						roughness={0.25}
						metalness={0.55}
						wireframe={wireframe}
					/>
				</T.Mesh>

				<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
					<T.PlaneGeometry args={[12, 12]} />
					<T.MeshStandardMaterial color="#e2e8f0" roughness={1} metalness={0} />
				</T.Mesh>
			</Canvas>
		</div>

		<aside class="controls">
			<section>
				<h2>Rotation</h2>
				<button
					class="btn btn-toggle {autoRotate ? 'active' : ''}"
					onclick={() => (autoRotate = !autoRotate)}
				>
					{autoRotate ? '⏸ Pause' : '▶ Resume'}
				</button>
				<p class="hint">Or drag the canvas to orbit manually.</p>
			</section>

			<section>
				<h2>Material</h2>
				<label class="toggle-row">
					<span>Wireframe</span>
					<input type="checkbox" bind:checked={wireframe} />
					<span class="toggle-track" class:on={wireframe}></span>
				</label>
			</section>

			<section>
				<h2>Color</h2>
				<div class="swatches">
					{#each colorOptions as opt}
						<button
							class="swatch {meshColor === opt.value ? 'selected' : ''}"
							style="background:{opt.value}"
							aria-label={opt.label}
							onclick={() => (meshColor = opt.value)}
						></button>
					{/each}
				</div>
			</section>

			<section class="tips">
				<h2>Tips</h2>
				<ul>
					<li>🖱 Left-drag to orbit</li>
					<li>🖱 Right-drag to pan</li>
					<li>🖱 Scroll to zoom</li>
				</ul>
			</section>
		</aside>
	</main>

</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', system-ui, sans-serif;
		background: #ffffff;
		color: #1e293b;
	}

	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: #ffffff;
		border-bottom: 1px solid #e2e8f0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-left { display: flex; align-items: center; gap: 0.75rem; }

	.badge {
		background: #ff6b35;
		color: #fff;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	h1 { font-size: 1.25rem; font-weight: 600; margin: 0; color: #0f172a; }

	.header-right { display: flex; gap: 0.5rem; }

	.btn {
		cursor: pointer;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		transition: background 0.15s;
	}

	.btn-ghost { background: #f1f5f9; color: #64748b; }
	.btn-ghost:hover { background: #e2e8f0; color: #1e293b; }

	.btn-danger { background: #ef4444; color: #fff; }
	.btn-danger:hover { background: #dc2626; }

	.btn-toggle { width: 100%; background: #f1f5f9; color: #64748b; padding: 0.6rem 1rem; }
	.btn-toggle:hover { background: #e2e8f0; color: #1e293b; }
	.btn-toggle.active { background: #ff6b35; color: #fff; }

	main { flex: 1; display: grid; grid-template-columns: 1fr 220px; }

	.canvas-wrapper { height: calc(100vh - 61px); background: #f8fafc; }

	aside.controls {
		background: #ffffff;
		border-left: 1px solid #e2e8f0;
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		overflow-y: auto;
	}

	aside section h2 {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
		margin: 0 0 0.75rem;
	}

	.hint { font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; line-height: 1.4; }

	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		font-size: 0.875rem;
		color: #475569;
	}
	.toggle-row input[type='checkbox'] { display: none; }

	.toggle-track {
		width: 36px; height: 20px;
		background: #cbd5e1;
		border-radius: 999px;
		position: relative;
		transition: background 0.2s;
		flex-shrink: 0;
	}
	.toggle-track::after {
		content: '';
		position: absolute;
		top: 3px; left: 3px;
		width: 14px; height: 14px;
		background: #fff;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0,0,0,0.15);
		transition: transform 0.2s;
	}
	.toggle-track.on { background: #ff6b35; }
	.toggle-track.on::after { transform: translateX(16px); }

	.swatches { display: flex; gap: 0.5rem; flex-wrap: wrap; }

	.swatch {
		width: 28px; height: 28px;
		border-radius: 6px;
		border: 2px solid transparent;
		cursor: pointer;
		outline: none;
		transition: transform 0.15s, border-color 0.15s;
	}
	.swatch:hover { transform: scale(1.15); }
	.swatch.selected { border-color: #0f172a; transform: scale(1.15); }

	.tips ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
	.tips li { font-size: 0.8rem; color: #94a3b8; }

	@media (max-width: 640px) {
		main { grid-template-columns: 1fr; grid-template-rows: 55vh auto; }
		.canvas-wrapper { height: 55vh; }
		aside.controls {
			border-left: none;
			border-top: 1px solid #e2e8f0;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem;
			padding: 1rem;
		}
		aside section { min-width: 140px; }
	}
</style>
