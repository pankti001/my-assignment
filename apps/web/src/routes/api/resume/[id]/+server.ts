import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function DELETE({ params }) {
	await sql`
		UPDATE resume
		SET status = 'Inactive'
		WHERE id = ${params.id}
	`;

	return json({
		success: true
	});
}

export async function PUT({ params, request }) {
	const data = await request.json();

	await sql`
		UPDATE resume
		SET
			name = ${data.name},
			email = ${data.email},
			phone = ${data.phone},
			education = ${data.education},
			skills = ${data.skills},
			experience = ${data.experience}
		WHERE id = ${params.id}
	`;

	return json({
		success: true
	});
}