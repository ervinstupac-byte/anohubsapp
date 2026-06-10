import { persistAuditRecord as supabasePersistAuditRecord } from '../../lib/supabaseAuditAdapter';

export async function persistAuditRecord(record: any) {
    try {
        return await supabasePersistAuditRecord(record);
    } catch (err) {
        console.error('DiagnosticPersister.persistAuditRecord failed', err);
        return { inserted: false, error: err };
    }
}

export default { persistAuditRecord };
