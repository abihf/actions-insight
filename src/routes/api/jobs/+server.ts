import type { RequestHandler } from "@sveltejs/kit";
import WorkflowJob from "src/lib/models/WorkflowJob";

export const get: RequestHandler = async ({ locals, url }) => {
  url.searchParams.get('ref')
  locals.dataSource.manager.find(WorkflowJob, {where: {}})
  return new Response(null)
}
