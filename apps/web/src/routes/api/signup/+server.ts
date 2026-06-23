import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
	try {
		const { name, email, password } = await request.json();

		const existingUser = await sql`
			SELECT * FROM users
			WHERE email = ${email}
		`;

		if (existingUser.length > 0) {
			return json({
				success: false,
				message: 'Email already exists'
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await sql`
			INSERT INTO users
			(name, email, password)
			VALUES
			(
				${name},
				${email},
				${hashedPassword}
			)
		`;

		return json({
			success: true,
			message: 'User created successfully'
		});

	} catch (error) {
		console.error(error);

		return json({
			success: false,
			message: 'Server error'
		});
	}
}