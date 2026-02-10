import fs from 'fs';
import path from 'path';

const SCHEMAS = {
    "dynamic_sensor_data": {
        "description": "Primary telemetry ingestion table for high-frequency sensor data.",
        "type": "SQL Table",
        "columns": {
            "id": "uuid (PK)",
            "asset_id": "text (FK)",
            "timestamp": "timestamptz",
            "output_power": "numeric",
            "francis_data": "jsonb (Detailed sensor readings)",
            "source_script": "text (Lineage)",
            "ingest_timestamp": "timestamptz (Lineage)",
            "workflow_run_id": "text (Lineage)"
        }
    },
    "sovereign_audit_log": {
        "description": "Immutable log of all Sovereign Executive decisions.",
        "type": "SQL Table",
        "columns": {
            "id": "uuid (PK)",
            "event_type": "text (EXECUTIVE_DECISION | PROTOCOL_9)",
            "reason": "text",
            "metric_value": "text",
            "metric_unit": "text",
            "active_protection": "text",
            "details": "jsonb (Snapshot of state)",
            "created_at": "timestamptz"
        }
    },
    "TelemetryStore": {
        "description": "Global Zustand store for real-time application state.",
        "type": "TypeScript Interface",
        "properties": {
            "hydraulic": "{ flow: number, head: number, efficiency: number }",
            "mechanical": "{ rpm: number, vibrationX: number, bearingTemp: number }",
            "physics": "{ powerMW: number, netHead: number }",
            "identity": "{ assetId: string, turbineType: string }",
            "activeAlarms": "Array<{ id: string, severity: string, message: string }>",
            "executiveResult": "ExecutiveState (from Sovereign_Executive_Engine)",
            "sovereignPulse": "{ index: number, globalStatus: string }",
            "educationMode": "boolean"
        }
    }
};

const outputPath = path.join(process.cwd(), 'docs', 'DATA_SCHEMAS.json');
fs.writeFileSync(outputPath, JSON.stringify(SCHEMAS, null, 2));

console.log(`✅ Schemas generated at ${outputPath}`);
