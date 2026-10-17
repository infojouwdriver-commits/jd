BEGIN;
CREATE OR REPLACE FUNCTION :"schema".security_operations_centre(p_scope text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE result jsonb;
BEGIN
 IF p_scope NOT IN('live','test','all') THEN RAISE EXCEPTION 'Invalid account scope' USING ERRCODE='22023';END IF;
 WITH selected AS(SELECT id,name FROM companies WHERE archived_at IS NULL AND (p_scope='all' OR is_test=(p_scope='test'))),
 overdue AS(SELECT d.id,d.company_id,d.document_number,d.due_date,security_subscription_document_balance(d.id) balance_cents FROM subscription_documents d JOIN selected c ON c.id=d.company_id WHERE d.state='issued' AND d.kind='invoice' AND (p_scope='all' OR d.is_test=(p_scope='test')) AND d.due_date<(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date AND security_subscription_document_balance(d.id)>0),
 incomplete AS(SELECT t.id,t.company_id,t.start_time,t.status,t.chiron_sync_state FROM trips t JOIN selected c ON c.id=t.company_id WHERE t.end_time IS NULL AND t.start_time<clock_timestamp()-interval '12 hours' AND (p_scope='all' OR t.is_test=(p_scope='test'))),
 chiron AS(SELECT t.id,t.company_id,t.start_time,t.chiron_sync_state FROM trips t JOIN selected c ON c.id=t.company_id WHERE t.chiron_sync_state IN('FAILED','START_FAILED','ARRIVAL_FAILED','ARRIVAL_UNCERTAIN','START_UNCERTAIN','START_SENT','ARRIVAL_SENT') AND (p_scope='all' OR t.is_test=(p_scope='test'))),
 not_ready AS(SELECT c.id,c.name FROM selected c JOIN subscription_billing_profiles p ON p.company_id=c.id AND p.enabled WHERE NOT EXISTS(SELECT FROM subscription_billing_settings s WHERE s.id=1 AND s.issuer_company_id IS NOT NULL AND s.exchange_mode='external_structured'))
 SELECT jsonb_build_object('counts',jsonb_build_object(
 'pending_registrations',(SELECT count(*) FROM company_registrations r JOIN selected c ON c.id=r.company_id WHERE r.status='pending'),
 'overdue',(SELECT count(*) FROM overdue),'incomplete',(SELECT count(*) FROM incomplete),'chiron',(SELECT count(*) FROM chiron),
 'prepared',(SELECT count(*) FROM subscription_documents d WHERE d.state='prepared' AND (p_scope='all' OR d.is_test=(p_scope='test'))),
 'not_ready',(SELECT count(*) FROM not_ready),
 'mail_attention',(SELECT count(*) FROM subscription_mail_queue q JOIN subscription_documents d ON d.id=q.document_id WHERE q.status IN('uncertain','failed','not_configured') AND (p_scope='all' OR d.is_test=(p_scope='test')))),
 'overdue',coalesce((SELECT jsonb_agg(to_jsonb(p)) FROM (SELECT o.*,c.name company_name FROM overdue o JOIN selected c ON c.id=o.company_id ORDER BY o.due_date,o.id LIMIT 50)p),'[]'),
 'incomplete',coalesce((SELECT jsonb_agg(to_jsonb(p)) FROM (SELECT i.*,c.name company_name FROM incomplete i JOIN selected c ON c.id=i.company_id ORDER BY i.start_time,i.id LIMIT 50)p),'[]'),
 'chiron',coalesce((SELECT jsonb_agg(to_jsonb(p)) FROM (SELECT ch.*,c.name company_name FROM chiron ch JOIN selected c ON c.id=ch.company_id ORDER BY ch.start_time,ch.id LIMIT 50)p),'[]'),
 'scheduler',(SELECT to_jsonb(s) FROM subscription_scheduler_state s WHERE id=1),'generated_at',clock_timestamp()) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_operations_centre(text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_operations_centre(text) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_driver_billing_notice(p_user bigint)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
 SELECT jsonb_build_object('notice_key','billing:'||c.id||':'||(( (clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date-d.due_date-1)/d.reminder_days)::text,'company_id',c.id)
 FROM subscription_documents d JOIN companies c ON c.id=d.company_id
 WHERE d.state='issued' AND d.kind='invoice' AND NOT d.is_test AND NOT c.is_test AND c.archived_at IS NULL AND d.due_date<(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date AND security_subscription_document_balance(d.id)>0
 AND EXISTS(SELECT FROM drivers dr WHERE dr.user_id=p_user AND dr.company_id=c.id AND dr.status='active' AND dr.archived_at IS NULL)
 ORDER BY d.due_date,d.id LIMIT 1
$$;
REVOKE ALL ON FUNCTION :"schema".security_driver_billing_notice(bigint) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_driver_billing_notice(bigint) TO :"admin_role";
COMMIT;
