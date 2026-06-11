-- =============================================================================
-- MIGRATION #4: JWT Role Hook — inject profile role into JWT claims
-- profiles.role already exists with values: admin|consultant|engineer|operator|finance
-- This function is used as a Supabase Auth Hook (Custom JWT Claims).
--
-- After running this SQL:
--   Dashboard → Authentication → Hooks → Custom Access Token Hook
--   → Set function to: public.custom_access_token_hook
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims   jsonb;
  user_role text;
BEGIN
  -- Fetch the user's role from profiles
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  -- Inject role into the JWT claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{role}', '"operator"');
  END IF;

  -- Return the modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execute permission to the supabase_auth_admin role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;

-- ============================================================
-- MANUAL STEP (Dashboard only — cannot be done via SQL):
-- Go to: Authentication → Hooks → "Customize Access Token (JWT) Claims"
-- Enable the hook and select: public.custom_access_token_hook
-- ============================================================
