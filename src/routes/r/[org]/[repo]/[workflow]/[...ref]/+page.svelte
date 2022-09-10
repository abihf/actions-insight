<script lang="ts">
	import type { PageData, RouteParams } from './$types';
	import { page } from '$app/stores';
	import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faCheckCircle,
		faXmarkCircle,
		faExclamationCircle,
		faCircle
	} from '@fortawesome/free-solid-svg-icons';

	export let data: PageData;
	const params = $page.params;
	export const repo = params.org + '/' + params.repo;
	export const ssr = false;
</script>

<div class="text-sm breadcrumbs">
	<ul>
		<li><a href="/">Home</a></li>
		<li><a href={`/r/${repo}`}>{repo}</a></li>
		<li><a href={`/r/${repo}/${params.workflow}`}>{data.workflowName}</a></li>
		<li>{params.ref}</li>
	</ul>
</div>

<table class="table">
	<thead>
		<tr>
			<th width=150>ID</th>
			{#each data.columns as column}
				<th width="50" class="whitespace-pre-wrap w-12 text-center">{column}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each data.runs as run}
			<tr class="group">
				<th class="group-hover:bg-primary-focus ">
					<a href="https://github.com/{repo}/actions/runs/{run.id}" title="{run.conclusion}" target="_blank" class="whitespace-nowrap">
						{#if run.conclusion === 'success'}
									<Fa icon={faCheckCircle} class="text-success flex" />
								{:else if run.conclusion === 'failure'}
									<Fa icon={faXmarkCircle} class="text-error flex" />
								{:else if run.conclusion === 'cancelled'}
									<Fa icon={faExclamationCircle} class="text-warning flex" />
								{:else}
									<Fa icon={faCircle} class="flex" />
								{/if}
						{run.sha.substring(0, 8)}
					</a></th>
				{#each run.jobs as job}
					<td class="text-center group-hover:bg-primary/30">
						{#if job}
							<a
								href="https://github.com/{repo}/runs/{job.id}"
								title="{job.name}: {job.conclusion}" class="w-full text-center flex items-center"
								target="_blank"
							>
								{#if job.conclusion === 'success'}
									<Fa icon={faCheckCircle} class="text-success flex flex-1" />
								{:else if job.conclusion === 'failure'}
									<Fa icon={faXmarkCircle} class="text-error flex flex-1" />
								{:else if job.conclusion === 'cancelled'}
									<Fa icon={faExclamationCircle} class="text-warning flex flex-1" />
								{:else if job.conclusion === 'skipped'}
									<Fa icon={faCircle} class="flex flex-1" />
								{/if}
							</a>
						{:else}-{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
