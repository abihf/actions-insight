import { env } from '$env/dynamic/private';
import { ghClient } from '$lib/github';
import { Webhooks } from '@octokit/webhooks';
import type { WebhookEventMap, WebhookEventName } from '@octokit/webhooks-types';
import type { Prisma } from '@prisma/client';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import assert from 'assert';
import logger from 'samwell';

const webhooks = new Webhooks({ secret: env.GITHUB_WEBHOOK_SECRET! });

export const POST = async <Name extends WebhookEventName>(event: RequestEvent) => {
	const { request } = event;
	const name = request.headers.get('x-github-event');
	const signature = request.headers.get('x-hub-signature-256');
	const id = request.headers.get('x-github-delivery');
	assert(id, 'invalid id');
	assert(signature, 'invalid signature');
	assert(name, 'invalid name');
	const body = await request.text();
	if (!(await webhooks.verify(body, signature))) {
		throw error(400, 'invalid webhook');
	}
	const handler = handlerMap[name as Name];
	if (handler) {
		await handler(JSON.parse(body), event);
	}
	return json({ id });
};

type HandlerMap = {
	[Key in WebhookEventName]?: (payload: WebhookEventMap[Key], event: RequestEvent) => Promise<void>;
};

const handlerMap: HandlerMap = {
	ping() {
		return Promise.resolve();
	},

	async workflow_job(payload, { locals }) {
		const { id, name, started_at, completed_at, conclusion, status, run_id, ...rest } =
			payload.workflow_job;
		const data = rest as unknown as Prisma.InputJsonValue;
		await locals.prisma.job.upsert({
			where: { id },
			create: { id, name, started_at, completed_at, conclusion, status, run_id, data },
			update: { completed_at, status, conclusion, data },
		});
	},

	async workflow_run(payload, { locals: { prisma } }) {
		async function getPrRef() {
			const commit_sha = payload.workflow_run.head_sha;
			const repo = { owner: payload.repository.owner.login, repo: payload.repository.name };
			try {
				const installationId = payload.installation?.id;
				assert(installationId, 'unknown installation id');
				const client = await ghClient(installationId);
				const pr = await client.repos.listPullRequestsAssociatedWithCommit({ commit_sha, ...repo });
				if (pr.data.length > 0) {
					return 'pr/' + pr.data[0].number;
				}
			} catch (err) {
				logger.warn('can not get pull request number', { err, repo, commit_sha });
			}
			return 'pr/unknown';
		}

		const ref =
			payload.workflow_run.event === 'pull_request'
				? await getPrRef()
				: 'head/' + payload.workflow_run.head_branch;

		function upsertRepo() {
			const {
				id,
				owner: { login: owner },
				name,
			} = payload.repository;
			return prisma.repo.upsert({
				where: { id },
				create: { id, owner, name, installation_id: payload.installation?.id },
				update: {},
			});
		}

		function upsertWorkflow() {
			const { id, name, path } = payload.workflow;
			return prisma.workflow.upsert({
				where: { id },
				create: { id, name, path, repo_id: payload.repository.id },
				update: {},
			});
		}

		function upsertUser() {
			const { id, login, name } = payload.workflow_run.actor;
			return prisma.user.upsert({ where: { id }, create: { id, login, name }, update: { name } });
		}

		function upsertRun() {
			const {
				id,
				run_number,
				run_attempt,
				head_sha: sha,
				actor: { id: actor_id },
				conclusion,
				status,
				run_started_at: started_at,
				workflow_id,
				...data
			} = payload.workflow_run;

			return prisma.run.upsert({
				where: {},
				create: {
					id,
					run_number,
					run_attempt,
					ref,
					sha,
					started_at,
					status,
					conclusion,
					actor_id,
					workflow_id,
					data: data as unknown as Prisma.InputJsonObject,
				},
				update: {},
			});
		}
		await prisma.$transaction([upsertRepo(), upsertWorkflow(), upsertUser(), upsertRun()]);
	},
};
