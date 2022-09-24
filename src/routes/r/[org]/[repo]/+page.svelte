<script lang="ts">
	import type { PageData, RouteParams } from './$types';
  import { page } from '$app/stores'
	export let data: PageData;
  export let params = $page.params as RouteParams;
</script>
<div class="mx-3 my-1">
	<div class="breadcrumbs ">
		<ul>
			<li><a href="/">Home</a></li>
			<li>{params.org}/{params.repo}</li>
		</ul>
	</div>
</div>

<ul>
  {#each data.workflows as workflow}
    <li><a href={`/r/${params.org}/${params.repo}/${workflow.id}`}>{workflow.name}</a></li>
  {/each}
</ul>
