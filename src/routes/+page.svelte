<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<ul>
  {#each data.repos as repo}
    <li><a href={`/r/${repo.owner}/${repo.name}`}>{repo.owner}/{repo.name}</a></li>
  {/each}
</ul>
