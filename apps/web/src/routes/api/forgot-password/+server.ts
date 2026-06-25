import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '$env/static/private';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS
	}
});

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
		success: false,
		message: 'No account found with this email. Please create an account first.'
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

		await transporter.sendMail({
	from: `"Assignment Dashboard" <${EMAIL_USER}>`,
	to: email,
	subject: 'Reset Your Password',
	html: `
		<h2>Password Reset</h2>

		<p>Hello,</p>

		<p>You requested to reset your password.</p>

		<p>
			Click the link below to reset your password:
		</p>

		<p>
			<a href="${resetLink}">
				Reset Password
			</a>
		</p>

		<p>This link expires in <b>15 minutes</b>.</p>

		<p>If you didn't request this, you can safely ignore this email.</p>
	`
});

	return json({
	success: true,
	message:
		'Password reset link sent successfully! Please check your email and click the link to reset your password.'
});

	} catch (error) {
		console.error(error);

		return json({
			success: false,
			message: 'Something went wrong.'
		});
	}
}