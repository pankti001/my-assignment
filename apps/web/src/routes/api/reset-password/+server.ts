import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
	try {
		const { token, password } = await request.json();

		if (!token || !password) {
			return json({
				success: false,
				message: 'Missing required fields.'
			});
		}

		const users = await sql`
			SELECT *
			FROM users
			WHERE reset_token = ${token}
		`;

		if (users.length === 0) {
			return json({
				success: false,
				message: 'Invalid reset link.'
			});
		}

		const user = users[0];

		if (
			!user.reset_token_expiry ||
			new Date(user.reset_token_expiry) < new Date()
		) {
			return json({
				success: false,
				message: 'Reset link has expired.'
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await sql`
			UPDATE users
			SET
				password = ${hashedPassword},
				reset_token = NULL,
				reset_token_expiry = NULL
			WHERE id = ${user.id}
		`;

		return json({
			success: true,
			message: 'Password reset successfully.'
		});
	} catch (error) {
		console.error(error);

		return json({
			success: false,
			message: 'Server error.'
		});
	}
}