import { env } from '$env/dynamic/private';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
// import { URL, URLSearchParams } from "url";
import { randomUUID } from 'crypto';
import { Octokit } from '@octokit/rest';

const client_id = env.GITHUB_CLIENT_ID;
const client_secret = env.GITHUB_CLIENT_SECRET;

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	const qs = url.searchParams;
	const next = qs.get('next') || '/';
	if (next[0] !== '/') throw error(400, 'invalid redirect url');
	const redirect_uri = new URL('/login?' + new URLSearchParams({ next }), url).toString();

	const code = qs.get('code');
	if (!code) {
		const state = randomUUID();
		cookies.set('gh-login-state', state);
		throw redirect(
			302,
			'https://github.com/login/oauth/authorize?' +
				new URLSearchParams({ client_id, state, redirect_uri }),
		);
	}

	const state = cookies.get('gh-login-state');
	if (!state || state !== qs.get('state')) {
		throw error(400, { message: 'invalid cookie state' });
	}

	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			client_id,
			client_secret,
			code,
			redirect_uri,
		}),
	});
	if (tokenRes.status !== 200) {
		console.log('gagal', await tokenRes.text());
		throw error(400, { message: `invalid authorization status code ${tokenRes.status}` });
	}
	const tokenBody: { access_token: string } = await tokenRes.json();
	const token = 'bearer ' + tokenBody.access_token;

	const octokit = new Octokit({ auth: token });
	const {
		data: { id, login, name },
	} = await octokit.users.getAuthenticated();

	cookies.delete('gh-login-state');
	locals.auth.update({
		gh: {
			token,
			id: id.toString(),
			login,
			name,
		},
	});

	await locals.prisma.user.upsert({
		where: { id: id },
		create: { id, login, name },
		update: { login, name },
	});

	throw redirect(302, next);
};
