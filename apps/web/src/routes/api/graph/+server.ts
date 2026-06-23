// src/routes/api/graph/+server.ts

import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function POST({ request, cookies }) {
	const { nodes } = await request.json();

	const userId = cookies.get('session');

	await sql`
		INSERT INTO graphs (
			user_id,
			graph_data
		)
		VALUES (
			${userId},
			${JSON.stringify(nodes)}
		)
	`;

	return json({
		success: true
	});
}

export async function GET({ cookies }) {
	const userId = cookies.get('session');

	const graphs = await sql`
		SELECT *
		FROM graphs
		WHERE user_id = ${userId}
		ORDER BY created_at DESC
		LIMIT 1
	`;

	if (graphs.length === 0) {
		return json({
			success: false,
			graph: null
		});
	}

	return json({
		success: true,
		graph: graphs[0]
	});
}