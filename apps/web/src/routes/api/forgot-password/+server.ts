import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function POST({ request, url }) {
	try {
		const { email } = await request.json();

		const users = await sql`
			SELECT *
			FROM users
			WHERE email = ${email}
			AND status = 'Active'
		`;

		// Don't reveal whether the email exists
		if (users.length === 0) {
	return json({
		success: true,
		message:
			'If an account with that email exists, a password reset link has been sent.'
	});
}

		const token = randomUUID();

		const expiry = new Date(
			Date.now() + 15 * 60 * 1000
		); // 15 minutes

		await sql`
			UPDATE users
			SET
				reset_token = ${token},
				reset_token_expiry = ${expiry}
			WHERE email = ${email}
		`;

		const resetLink = `${url.origin}/reset-password?token=${token}`;

		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: email,
			subject: 'Reset Your Password',
			html: `
				<h2>Password Reset</h2>

				<p>Hello,</p>

				<p>You requested to reset your password.</p>

				<p>
					<a href="${resetLink}">
						Click here to reset your password
					</a>
				</p>

				<p>This link expires in 15 minutes.</p>

				<p>If you didn't request this, please ignore this email.</p>
			`
		});

		return json({
	success: true,
	message:
		'If an account with that email exists, a password reset link has been sent.'
});

	} catch (error) {
		console.error(error);

		return json({
			success: false,
			message: 'Something went wrong.'
		});
	}
}