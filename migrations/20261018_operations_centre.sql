BEGIN;
CREATE OR REPLACE FUNCTION :"schema".security_operations_centre(p_scope text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE result jsonb;
BEGIN
 IF p_scope NOT IN('live','test','all') THEN RAISE EXCEPTION 'Invalid account scope' USING ERRCODE='22023';END IF;
 WITH selected AS(SELECT id,name,is_test FROM companies WHERE archived_at IS NULL),
 overdue AS(SELECT d.id,d.company_id,d.document_number,d.due_date,security_subscription_document_balance(d.id) balance_cents FROM subscription_documents d JOIN selected c ON c.id=d.company_id WHERE d.state='issued' AND d.kind='invoice' AND (p_scope='all' OR d.is_test=(p_scope='test')) AND d.due_date<(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date AND security_subscription_document_balance(d.id)>0),
 incomplete AS(SELECT t.id,t.company_id,t.start_time,t.status,t.chiron_sync_state FROM trips t JOIN selected c ON c.id=t.company_id WHERE t.end_time IS NULL AND t.start_time<clock_timestamp()-interval '12 hours' AND (p_scope='all' OR t.is_test=(p_scope='test'))),
 chiron AS(SELECT t.id,t.company_id,t.start_time,t.chiron_sync_state FROM trips t JOIN selected c ON c.id=t.company_id WHERE t.chiron_sync_state IN('FAILED','START_FAILED','ARRIVAL_FAILED','ARRIVAL_UNCERTAIN','START_UNCERTAIN','START_SENT','ARRIVAL_SENT') AND (p_scope='all' OR t.is_test=(p_scope='test'))),
 not_ready AS(SELECT c.id,c.name FROM selected c JOIN subscription_billing_profiles p ON p.company_id=c.id AND p.enabled WHERE (p_scope='all' OR c.id IN(SELECT id FROM companies WHERE is_test=(p_scope='test'))) AND NOT EXISTS(SELECT FROM subscription_billing_settings s WHERE s.id=1 AND s.issuer_company_id IS NOT NULL AND s.exchange_mode='external_structured'))
 SELECT jsonb_build_object('counts',jsonb_build_object(
 'pending_registrations',(SELECT count(*) FROM company_registrations r JOIN selected c ON c.id=r.company_id WHERE r.status='pending' AND (p_scope='all' OR c.is_test=(p_scope='test'))),
 'overdue',(SELECT count(*) FROM overdue),'incomplete',(SELECT count(*) FROM incomplete),'chiron',(SELECT count(*) FROM chiron),
 'prepared',(SELECT count(*) FROM subscription_documents d WHERE d.state='prepared' AND (p_scope='all' OR d.is_test=(p_scope='test'))),
 'not_ready',(SELECT count(*) FROM not_ready),
 'mail_attention',(SELECT count(*) FROM subscription_mail_queue q JOIN subscription_documents d ON d.id=q.document_id LEFT JOIN mail_deliveries md ON md.id=q.mail_delivery_id WHERE (q.status IN('uncertain','failed','not_configured') OR md.status IN('failed','bounced','complained','delayed','uncertain')) AND (p_scope='all' OR d.is_test=(p_scope='test')))),
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
ALTER TABLE :"schema".invoices ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION :"schema".security_invoice_test_classification()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF TG_OP='UPDATE' THEN IF NEW.is_test IS DISTINCT FROM OLD.is_test THEN RAISE EXCEPTION 'Invoice classification is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END IF;
 SELECT coalesce(t.is_test,c.is_test,false) INTO NEW.is_test FROM companies c LEFT JOIN trips t ON t.id=NEW.trip_id WHERE c.id=NEW.company_id;
 NEW.is_test=coalesce(NEW.is_test,false);RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_test_classification ON :"schema".invoices;
CREATE TRIGGER invoice_test_classification BEFORE INSERT OR UPDATE OF is_test ON :"schema".invoices FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_test_classification();
REVOKE ALL ON FUNCTION :"schema".security_invoice_test_classification() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_test_classification() TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_live_statistics()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
 SELECT jsonb_build_object(
 'companies',(SELECT count(*) FROM companies WHERE archived_at IS NULL AND NOT is_test),
 'activeDrivers',(SELECT count(*) FROM drivers d JOIN companies c ON c.id=d.company_id WHERE d.status='active' AND d.archived_at IS NULL AND c.archived_at IS NULL AND NOT c.is_test),
 'completedTrips',(SELECT count(*) FROM trips WHERE status='completed' AND NOT is_test),
 'sentInvoices',(SELECT count(*) FROM invoices WHERE status='sent' AND NOT is_test)+(SELECT count(*) FROM subscription_documents WHERE state='issued' AND NOT is_test),
 'invoicesCount',(SELECT count(*) FROM invoices WHERE NOT is_test)+(SELECT count(*) FROM subscription_documents WHERE state='issued' AND NOT is_test),
 'totalRevenue',coalesce((SELECT sum(total_tvac) FROM invoices WHERE NOT is_test AND coalesce(status,'') NOT IN('draft','cancelled')),0)+coalesce((SELECT sum(CASE WHEN kind='credit' THEN -gross_cents ELSE gross_cents END)::numeric/100 FROM subscription_documents WHERE state='issued' AND NOT is_test),0),
 'paidInvoices',(SELECT count(*) FROM invoices WHERE payment_status='paid' AND NOT is_test)+(SELECT count(*) FROM subscription_documents d WHERE kind='invoice' AND state='issued' AND NOT is_test AND security_subscription_document_balance(id)<=0),
 'airportTrips',(SELECT count(*) FROM trips WHERE status='completed' AND NOT is_test AND is_airport_trip=true),
 'nightTrips',(SELECT count(*) FROM trips WHERE status='completed' AND NOT is_test AND is_night_trip=true),
 'satisfactionRate',NULL)
$$;
REVOKE ALL ON FUNCTION :"schema".security_live_statistics() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_live_statistics() TO :"admin_role";

COMMIT;
