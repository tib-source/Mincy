alter table "public"."PipelineRun" drop constraint "PipelineRun_project_id_fkey";

alter table "public"."PipelineRun" drop constraint "PipelineRun_workflow_id_fkey";

alter table "public"."PipelineRun" add constraint "PipelineRun_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Projects"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."PipelineRun" validate constraint "PipelineRun_project_id_fkey";

alter table "public"."PipelineRun" add constraint "PipelineRun_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."PipelineRun" validate constraint "PipelineRun_workflow_id_fkey";


  create policy "Enable delete for users based on user_id"
  on "public"."Projects"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



