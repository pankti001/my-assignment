import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function POST({ request }) {
	const data = await request.json();

	await sql`
		INSERT INTO resume
		(name, email, phone, education, skills, experience)
		VALUES
		(
			${data.name},
			${data.email},
			${data.phone},
			${data.education},
			${data.skills},
			${data.experience}
		)
	`;

	return json({
		success: true
	});
}
export async function GET() {
	const resumes = await sql`
		SELECT *
FROM resume
WHERE status = 'Active'
ORDER BY id DESC
	`;

	return json(resumes);
}