alter table "public"."Workflow" drop constraint "Workflow_projectId_fkey";
alter table "public"."Workflow" alter column "projectId" set not null;
alter table "public"."Workflow" add constraint "Workflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Projects"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."Workflow" validate constraint "Workflow_projectId_fkey";
create policy "Project owners can acess workflows"
  on "public"."Workflow"
  as permissive
  for all
  to authenticated, service_role
using ((( SELECT auth.uid() AS uid) IN ( SELECT "Projects".user_id
   FROM public."Projects"
  WHERE ("Workflow"."projectId" = "Projects".id))));
