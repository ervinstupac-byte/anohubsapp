-- =============================================================================
-- MIGRATION #5: Storage Bucket RLS Policies
-- Covers: avatars (public bucket) and reports (private bucket)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- AVATARS bucket — each user can only read/write inside their own folder
-- Folder pattern: {user_id}/filename
-- ---------------------------------------------------------------------------

-- Allow any authenticated user to VIEW any avatar (public profile photos)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'avatars_select_authenticated',
  'avatars',
  'SELECT',
  '(auth.role() = ''authenticated'')'
)
ON CONFLICT DO NOTHING;

-- Allow users to UPLOAD only to their own subfolder
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'avatars_insert_own_folder',
  'avatars',
  'INSERT',
  '(auth.role() = ''authenticated'' AND (storage.foldername(name))[1] = auth.uid()::text)'
)
ON CONFLICT DO NOTHING;

-- Allow users to UPDATE/DELETE only their own files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'avatars_update_own',
  'avatars',
  'UPDATE',
  '(auth.uid()::text = (storage.foldername(name))[1])'
)
ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'avatars_delete_own',
  'avatars',
  'DELETE',
  '(auth.uid()::text = (storage.foldername(name))[1])'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- REPORTS bucket — authenticated read, admin/consultant write
-- ---------------------------------------------------------------------------

-- Any authenticated user can download reports
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'reports_select_authenticated',
  'reports',
  'SELECT',
  '(auth.role() = ''authenticated'')'
)
ON CONFLICT DO NOTHING;

-- Only admin/consultant can upload reports
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'reports_insert_admin_consultant',
  'reports',
  'INSERT',
  '(auth.role() = ''authenticated'' AND ((auth.jwt() ->> ''role'') IN (''admin'', ''consultant'')))'
)
ON CONFLICT DO NOTHING;

-- Only admin can delete reports
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'reports_delete_admin',
  'reports',
  'DELETE',
  '((auth.jwt() ->> ''role'') = ''admin'')'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTE: If the INSERT INTO storage.policies approach fails
-- (older Supabase versions use a different schema),
-- use the Dashboard instead:
--   Storage → avatars → New Policy → (paste the definitions above)
--   Storage → reports  → New Policy → (paste the definitions above)
-- ============================================================
