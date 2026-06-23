<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let nodes = $state([
		{ id: 1, name: 'Login' },
		{ id: 2, name: 'Resume Builder' },
		{ id: 3, name: 'Neon Database' }
	]);

	let nodeName = $state('');

	function addNode() {
		if (!nodeName.trim()) return;
		nodes.push({ id: Date.now(), name: nodeName });
		nodeName = '';
	}

	function deleteNode(id: number) {
		nodes = nodes.filter((n) => n.id !== id);
	}

	async function logout() {
		await fetch('/api/logout', { method: 'POST' });
		goto('/login');
	}

	function pad(i: number) {
		return String(i + 1).padStart(3, '0');
	}
	async function saveGraph() {

	const response = await fetch('/api/graph', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			nodes
		})
	});

	const result = await response.json();

	if (result.success) {
		alert('Graph Saved Successfully');
	}
}
async function loadGraph() {
	const response = await fetch('/api/graph');

	const result = await response.json();

	if (
		result.success &&
		result.graph?.graph_data
	) {
		nodes = result.graph.graph_data;
	}
}
onMount(() => {
	loadGraph();
});
</script>

<div class="wge">

	<!-- Toolbar -->
	<div class="toolbar">
		<div class="brand">
			<span class="brand-dot"></span>
			workflow.graph
		</div>

		<div class="toolbar-actions">
			<button class="btn btn-ghost" onclick={() => goto('/dashboard')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
				Dashboard
			</button>
			<button class="btn btn-danger" onclick={logout}>
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
				Logout
			</button>
		</div>
	</div>

	<!-- Workspace -->
	<div class="workspace">

		<!-- Add node row -->
		<div class="add-row">
			<input
				bind:value={nodeName}
				placeholder="Node name…"
				class="node-input"
				onkeydown={(e) => e.key === 'Enter' && addNode()}
			/>
			<button class="btn-add" onclick={addNode}>
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				Add node
			</button>
			<button
	class="btn btn-save"
	onclick={saveGraph}
>
	Save Graph
</button>
		</div>

		<!-- Node grid -->
		{#if nodes.length === 0}
			<div class="empty">
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
				<p class="empty-text">No nodes yet — add one above to start building your graph.</p>
			</div>
		{:else}
			<div class="grid">
				{#each nodes as node, i}
					<div class="node-card">
						<div class="node-header">
							<span class="node-id">#{pad(i)}</span>
							<button class="btn-del" onclick={() => deleteNode(node.id)} aria-label="Delete {node.name}">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
							</button>
						</div>
						<div class="node-name">{node.name}</div>
						<div class="node-footer">
							<span class="node-type">task.node</span>
							<span class="node-dot"></span>
						</div>
					</div>
				{/each}
			</div>
		{/if}

	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.wge {
		font-family: 'Inter', sans-serif;
		background: #f8fafc;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* ── Toolbar ── */
	.toolbar {
		background: #ffffff;
		border-bottom: 1px solid #e2e8f0;
		padding: 12px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		font-weight: 500;
		color: #0891b2;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.brand-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #0891b2;
		flex-shrink: 0;
	}

	.toolbar-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		font-family: 'Inter', sans-serif;
		font-size: 12px;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid transparent;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: background 0.15s, border-color 0.15s;
	}

	.btn-ghost {
		background: #f1f5f9;
		color: #475569;
		border-color: #e2e8f0;
	}

	.btn-ghost:hover {
		background: #e2e8f0;
	}

	.btn-danger {
		background: #fff1f2;
		color: #e11d48;
		border-color: #fecdd3;
	}

	.btn-danger:hover {
		background: #ffe4e6;
	}

	/* ── Workspace ── */
	.workspace {
		flex: 1;
		padding: 24px;
	}

	.add-row {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
	}

	.node-input {
		flex: 1;
		max-width: 320px;
		background: #ffffff;
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		padding: 9px 14px;
		font-family: 'Inter', sans-serif;
		font-size: 13px;
		color: #0f172a;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.node-input::placeholder { color: #94a3b8; }

	.node-input:focus {
		border-color: #0891b2;
		box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
	}

	.btn-add {
		background: #0891b2;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 13px;
		border: none;
		border-radius: 8px;
		padding: 9px 16px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.btn-add:hover { background: #0e7490; }
	.btn-add:active { background: #155e75; }

	/* ── Grid ── */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 12px;
	}

	/* ── Node card ── */
	.node-card {
		background: #ffffff;
		border-radius: 10px;
		border: 1px solid #e2e8f0;
		border-left: 3px solid #0891b2;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.node-card:hover {
		border-color: #bae6fd;
		border-left-color: #0891b2;
		box-shadow: 0 2px 8px rgba(8, 145, 178, 0.08);
	}

	.node-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.node-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		color: #0891b2;
		letter-spacing: 0.08em;
	}

	.btn-del {
		background: none;
		border: none;
		cursor: pointer;
		color: #cbd5e1;
		padding: 2px;
		display: flex;
		align-items: center;
		transition: color 0.15s;
	}

	.btn-del:hover { color: #e11d48; }

	.node-name {
		font-size: 13px;
		font-weight: 500;
		color: #0f172a;
		line-height: 1.4;
		word-break: break-word;
	}

	.node-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.node-type {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		color: #94a3b8;
	}

	.node-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #0891b2;
		opacity: 0.4;
	}

	/* ── Empty state ── */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 24px;
		gap: 12px;
	}

	.empty-icon { color: #cbd5e1; }

	.empty-text {
		font-size: 13px;
		color: #94a3b8;
		text-align: center;
		max-width: 260px;
		line-height: 1.6;
	}
	.btn-save {
	background: rgba(34,197,94,0.15);
	color: #4ade80;
}
</style> 