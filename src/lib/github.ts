import { env } from '$env/dynamic/private';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export const ghAuth = createAppAuth({
	appId: env.GITHUB_APP_ID!,
	privateKey: env.GITHUB_APP_KEY!,
	clientId: env.GITHUB_CLIENT_ID!,
	clientSecret: env.GITHUB_CLIENT_SECRET!,
});

export function ghClient(installationId: number, auth = ghAuth) {
	return auth({
		type: 'installation',
		installationId,
		factory: (auth) => new Octokit({ authStrategy: createAppAuth, auth }),
	});
}

export function ghAuthUrl(redirect_uri: string, state: string) {
	return (
		'https://github.com/login/oauth/authorize?' +
		new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID!, state, redirect_uri })
	);
}
