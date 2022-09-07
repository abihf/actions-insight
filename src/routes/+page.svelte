<script lang=ts>
   import type { Load } from '@sveltejs/kit';
   
   export const load: Load = async ({ fetch }) => {
     const res = await fetch(`/fetch/`);
   
     if (res.ok) {
       return {
         status: res.status,
         props: {
            propName: await res.json()
         }
       };
     }
   
     return {
       status: res.status,
       error: new Error(`Could not load url`)
     };
   }
</script>

<style>

</style>
