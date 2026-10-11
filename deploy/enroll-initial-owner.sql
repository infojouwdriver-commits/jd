BEGIN;
CREATE OR REPLACE FUNCTION public.security_enroll_initial_owner(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('jouw-driver-initial-owner'));
  IF p_password IS NULL OR p_password !~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$' THEN
    RAISE EXCEPTION 'Invalid password hash' USING ERRCODE='22023';
  END IF;
  IF EXISTS(SELECT 1 FROM public.users) THEN
    RAISE EXCEPTION 'Existing installation; owner enrollment refused' USING ERRCODE='23505';
  END IF;
  INSERT INTO public.users(id,email,password,display_name,role,user_type)
    VALUES(1,'jouw2023@gmail.com',p_password,'Jalal Ezetdin','jouw_app_user','admin');
  PERFORM setval(pg_get_serial_sequence('public.users','id'),1,true);
  RETURN jsonb_build_object('id',1,'email','jouw2023@gmail.com');
END;
$$;
REVOKE ALL ON FUNCTION public.security_enroll_initial_owner(text) FROM PUBLIC,jouw_app_user,jouw_gateway;
GRANT EXECUTE ON FUNCTION public.security_enroll_initial_owner(text) TO jouw_service;
GRANT UPDATE ON SEQUENCE public.users_id_seq TO jouw_service;
NOTIFY pgrst,'reload schema';
COMMIT;
