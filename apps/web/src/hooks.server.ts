export const handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');

	const protectedRoutes = [
		'/dashboard',
		'/resume',
		'/graph'
	];

	const isProtected = protectedRoutes.some((route) =>
		event.url.pathname.startsWith(route)
	);

	if (isProtected && !session) {
		return new Response(null, {
			status: 302,
			headers: {
				location: '/login'
			}
		});
	}

	return resolve(event);
};