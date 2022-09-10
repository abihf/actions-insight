<script lang="ts">
	import type { PageData, RouteParams } from './$types';
  import { page } from '$app/stores'
	export let data: PageData;
  export let params = $page.params as RouteParams;
</script>
<ul>
  {#each data.workflows as workflow}
    <li><a href={`/r/${params.org}/${params.repo}/${workflow.id}`}>{workflow.name}</a></li>
  {/each}
</ul>
