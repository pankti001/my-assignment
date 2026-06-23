import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function GET() {
	const total = await sql`
		SELECT COUNT(*) AS count
		FROM resume
	`;

	const active = await sql`
		SELECT COUNT(*) AS count
		FROM resume
		WHERE status = 'Active'
	`;

	const inactive = await sql`
		SELECT COUNT(*) AS count
		FROM resume
		WHERE status = 'Inactive'
	`;

	return json({
		total: Number(total[0].count),
		active: Number(active[0].count),
		inactive: Number(inactive[0].count)
	});
}