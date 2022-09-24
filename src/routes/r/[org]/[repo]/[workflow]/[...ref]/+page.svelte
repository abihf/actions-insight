<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Fa from 'svelte-fa';
	import {
		faCheckCircle,
		faXmarkCircle,
		faExclamationCircle,
		faCircle
	} from '@fortawesome/free-solid-svg-icons';

	export let data: PageData;
	const params = $page.params;
	export const repo = params.org + '/' + params.repo;
	const columnMap = new Map<string, number>();
	for (const run of data.runs) {
		run.jobs.forEach((job, i) => job.name && job.conclusion !== 'skipped' && columnMap.set(job.name, i + (columnMap.get(job.name) || 0)))
	}
	const columns = [...columnMap].sort(([aName, aPrio], [bName, bPrio]) => aPrio - bPrio).map(([name]) => name)
	// const jobs = new Map(data.runs.map(run => [run.id, new Map(run.jobs.map(job => [job.name!, job]))]))
	const runs = data.runs.map(({jobs: origJobs, ...run}) => {
		const jobMap = new Map(origJobs.map(job => [job.name, job]))
		const jobs = columns.map(col => jobMap.get(col)!)
		return {...run, jobs}
	})
</script>

<div class="mx-3 my-1">
	<div class="breadcrumbs ">
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href={`/r/${repo}`}>{repo}</a></li>
			<li><a href={`/r/${repo}/${params.workflow}`}>{data.workflowName}</a></li>
			<li>{params.ref}</li>
		</ul>
	</div>
</div>

<div class="mx-3 my-1">
	<table class="table">
		<thead>
			<tr>
				<th width="150">ID</th>
				{#each columns as column}
					<th width="50" class="whitespace-pre-wrap w-12 text-center">{column}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each runs as run}
				<tr class="group">
					<th class="group-hover:bg-primary-focus ">
						<a
							href="https://github.com/{repo}/actions/runs/{run.id}"
							title={run.conclusion}
							target="_blank"
							class="whitespace-nowrap"
						>
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
						</a></th
					>
					{#each run.jobs as job}
						<td class="text-center group-hover:bg-primary/30">
							{#if job}
								<a
									href="https://github.com/{repo}/runs/{job.id}"
									title="{job.name}: {job.conclusion}"
									class="w-full text-center flex items-center"
									target="_blank"
								>
									{#if job.conclusion === 'success'}
										<Fa icon={faCheckCircle} class="text-success flex flex-1" />
									{:else if job.conclusion === 'failure'}
										<Fa icon={faXmarkCircle} class="text-error flex flex-1" />
									{:else if job.conclusion === 'cancelled'}
										<Fa icon={faExclamationCircle} class="text-warning flex flex-1" />
									{:else}
										<Fa icon={faCircle} class="text-base-200 flex flex-1" />
									{/if}
								</a>
							{:else}-{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
