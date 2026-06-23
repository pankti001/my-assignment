import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export async function POST({ request, cookies }) {
	try {
		const { email, password } = await request.json();

		const users = await sql`
			SELECT *
			FROM users
			WHERE email = ${email}
			AND status = 'Active'
		`;

		if (users.length === 0) {
			return json({
				success: false,
				message: 'Invalid Email'
			});
		}

		const user = users[0];

		const isValid = await bcrypt.compare(
			password,
			user.password
		);

		if (!isValid) {
			return json({
				success: false,
				message: 'Invalid Password'
			});
		}

		cookies.set('session', String(user.id), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24
		});

		return json({
			success: true
		});

	} catch (error) {
		console.error(error);

		return json({
			success: false,
			message: 'Server Error'
		});
	}
}