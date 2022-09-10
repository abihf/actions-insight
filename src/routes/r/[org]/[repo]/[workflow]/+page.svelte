<script lang="ts">
	import type { PageData, RouteParams } from './$types';
  import { page } from '$app/stores'
	export let data: PageData;
  export let params = $page.params as RouteParams;
</script>
<ul>
  {#each data.refs as ref}
    <li><a href={`/r/${params.org}/${params.repo}/${params.workflow}/${ref}`}>{ref}</a></li>
  {/each}
</ul>
