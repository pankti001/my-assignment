import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	const session = await locals.auth();

	if (!session?.user) {
		return json({
			user: null
		});
	}

	return json({
		user: {
			name: session.user.name,
			email: session.user.email
		}
	});
}