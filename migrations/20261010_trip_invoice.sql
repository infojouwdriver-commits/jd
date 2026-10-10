-- One durable receipt per completed trip. Existing historical rows remain intact.
BEGIN;
ALTER TABLE :"schema".invoices ADD COLUMN IF NOT EXISTS receipt_snapshot jsonb;
CREATE OR REPLACE FUNCTION :"schema".security_create_trip_invoice(p_trip_id bigint,p_user_id bigint,p_invoice jsonb,p_receipt jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE t trips; i invoices; n bigint; digits text; checkdigits text;
BEGIN
 SELECT * INTO t FROM trips WHERE id=p_trip_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Trip not found' USING ERRCODE='P0002'; END IF;
 IF t.user_id IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Trip ownership mismatch' USING ERRCODE='42501'; END IF;
 IF t.status IS DISTINCT FROM 'completed' OR t.end_time IS NULL THEN RAISE EXCEPTION 'Trip must be completed' USING ERRCODE='22023'; END IF;
 IF NOT EXISTS(SELECT FROM drivers WHERE id=t.driver_id AND user_id=t.user_id AND company_id=t.company_id)
 OR NOT EXISTS(SELECT FROM companies WHERE id=t.company_id)
 OR (t.vehicle_id IS NOT NULL AND NOT EXISTS(SELECT FROM vehicles WHERE id=t.vehicle_id AND company_id=t.company_id))
 THEN RAISE EXCEPTION 'Trip records mismatch' USING ERRCODE='22023'; END IF;
 SELECT * INTO i FROM invoices WHERE trip_id=t.id ORDER BY id LIMIT 1;
 IF FOUND THEN RETURN to_jsonb(i); END IF;
 IF jsonb_typeof(p_invoice) IS DISTINCT FROM 'object' OR jsonb_typeof(p_receipt) IS DISTINCT FROM 'object'
 OR EXISTS(SELECT FROM jsonb_object_keys(p_invoice) k WHERE k NOT IN ('client_name','client_address','items','bank_account','bic_code','trip_datetime','trip_time','vehicle_plate_number','dienstnummer','identificatiecode','toegepast_tarief','meterbedrag','ritnummer'))
 OR t.price IS NULL OR t.price<0 THEN RAISE EXCEPTION 'Invalid receipt payload' USING ERRCODE='22023'; END IF;
 n=nextval(pg_get_serial_sequence('invoices','id'));
 IF n>9999999999 THEN RAISE EXCEPTION 'Structured reference sequence exhausted' USING ERRCODE='22023'; END IF;
 digits=lpad(n::text,10,'0');checkdigits=lpad((CASE WHEN n%97=0 THEN 97 ELSE n%97 END)::text,2,'0');
 i=jsonb_populate_record(NULL::invoices,p_invoice);
 INSERT INTO invoices(id,user_id,company_id,issuer_company_id,trip_id,invoice_number,client_name,client_address,total_htva,vat_rate,total_tvac,invoice_date,status,payment_status,invoice_type,invoice_category,invoice_language,items,structured_reference,bank_account,bic_code,trip_datetime,trip_time,vehicle_plate_number,dienstnummer,identificatiecode,toegepast_tarief,meterbedrag,ritnummer,receipt_snapshot)
 VALUES(n,t.user_id,t.company_id,t.company_id,t.id,'TRIP-'||t.id,i.client_name,i.client_address,round(t.price/1.06,2),6,round(t.price,2),t.end_time::date,'issued','pending','one_time','trip','nl',i.items,'+++'||substr(digits,1,3)||'/'||substr(digits,4,4)||'/'||substr(digits,8,3)||checkdigits||'+++',i.bank_account,i.bic_code,i.trip_datetime,i.trip_time,i.vehicle_plate_number,i.dienstnummer,i.identificatiecode,i.toegepast_tarief,i.meterbedrag,i.ritnummer,p_receipt||jsonb_build_object('document_number','TRIP-'||t.id)) RETURNING * INTO i;
 RETURN to_jsonb(i);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_create_trip_invoice(bigint,bigint,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_create_trip_invoice(bigint,bigint,jsonb,jsonb) TO :"admin_role";
COMMIT;
