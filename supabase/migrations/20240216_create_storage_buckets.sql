-- Create a new storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

-- Set up storage policies
create policy "Users can upload their own resumes"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.role() = 'authenticated'
  );

create policy "Users can read their own resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid() = owner
  );

create policy "Users can delete their own resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid() = owner
  ); 