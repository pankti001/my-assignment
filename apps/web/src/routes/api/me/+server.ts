import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function GET({ cookies }) {
	try {
		const session = cookies.get('session');

		if (!session) {
			return json(
				{ user: null },
				{ status: 401 }
			);
		}

		const users = await sql`
			SELECT
				id,
				name,
				email,
				role
			FROM users
			WHERE id = ${Number(session)}
		`;

		if (users.length === 0) {
			return json(
				{ user: null },
				{ status: 401 }
			);
		}

		return json({
			user: users[0]
		});

	} catch (error) {
		console.error(error);

		return json(
			{ user: null },
			{ status: 500 }
		);
	}
}