-- Safety Interlock & Black Box Forensics Database Schema
-- Supports immutable audit trail and forensic data storage

-- =====================================================
-- 1. SAFETY INTERLOCK LEDGER (Blockchain-style)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.safety_interlock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_id TEXT NOT NULL UNIQUE,
    asset_id UUID REFERENCES assets(id),
    change_type TEXT NOT NULL, -- 'PIPE_DIAMETER', 'ACCUMULATOR_SIZE', etc.
    
    -- Proposed change details
    current_value REAL,
    proposed_value REAL,
    justification TEXT,
    requested_by UUID, -- User ID
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Simulation results
    simulation_passed BOOLEAN,
    max_pressure_spike REAL, -- bar
    max_pressure_rate REAL, -- bar/s
    max_hose_tension REAL, -- kN
    risks JSONB, -- Array of risk messages
    warnings JSONB, -- Array of warning messages
    recommendation TEXT, -- 'APPROVE', 'REJECT', 'APPROVE_WITH_MODIFICATIONS'
    
    -- Approval workflow
    consultant_approval JSONB, -- {approvedBy, timestamp, digitalSignature, comments}
    manager_approval JSONB, -- For emergency overrides
    
    -- Execution status
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'OVERRIDDEN'
    scada_lock_status TEXT DEFAULT 'UNLOCKED', -- 'LOCKED', 'UNLOCKED'
    executed_at TIMESTAMPTZ,
    
    -- Legal liability
    legal_liability TEXT DEFAULT 'ENGINEER', -- 'ENGINEER', 'CONSULTANT', 'COMPANY'
    cannot_override BOOLEAN DEFAULT FALSE,
    
    -- Blockchain hash (for immutability verification)
    previous_hash TEXT,
    current_hash TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_interlock_asset ON public.safety_interlock_ledger(asset_id, created_at DESC);
CREATE INDEX idx_interlock_status ON public.safety_interlock_ledger(status);

-- Function to calculate blockchain hash
CREATE OR REPLACE FUNCTION calculate_interlock_hash(ledger_id UUID)
RETURNS TEXT AS $$
DECLARE
    record_data TEXT;
    prev_hash TEXT;
BEGIN
    -- Get previous record's hash
    SELECT current_hash INTO prev_hash
    FROM safety_interlock_ledger
    WHERE created_at < (SELECT created_at FROM safety_interlock_ledger WHERE id = ledger_id)
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Concatenate all fields
    SELECT CONCAT(
        id::TEXT, change_id, asset_id::TEXT, change_type,
        current_value::TEXT, proposed_value::TEXT,
        simulation_passed::TEXT, COALESCE(prev_hash, 'GENESIS')
    ) INTO record_data
    FROM safety_interlock_ledger WHERE id = ledger_id;
    
    -- Return SHA256 hash
    RETURN encode(digest(record_data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate hash on insert
CREATE OR REPLACE FUNCTION trigger_calculate_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_hash := calculate_interlock_hash(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_hash
BEFORE INSERT ON safety_interlock_ledger
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_hash();

-- =====================================================
-- 2. BLACK BOX FORENSIC RECORDINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.forensic_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id),
    
    -- Trigger information
    triggered_at TIMESTAMPTZ NOT NULL,
    trigger_reason TEXT NOT NULL, -- 'Vibration spike: 7.2 mm/s', etc.
    trigger_type TEXT, -- 'VIBRATION', 'PRESSURE_SPIKE', 'COMMAND', 'TEMPERATURE'
    
    -- Recording metadata
    sampling_rate INTEGER, -- Hz (100 for high frequency, 1 for normal)
    duration_seconds INTEGER, -- Total duration of recording
    data_point_count INTEGER, -- Number of data points
    
    -- Storage
    data_blob BYTEA, -- Binary storage of ForensicDataPoint[] (compressed)
    csv_export TEXT, -- CSV format for easy analysis
    
    -- Associated events
    associated_interlock_id UUID REFERENCES safety_interlock_ledger(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forensic_asset ON public.forensic_recordings(asset_id, triggered_at DESC);
CREATE INDEX idx_forensic_trigger_type ON public.forensic_recordings(trigger_type);

-- =====================================================
-- 3. EXPERT KNOWLEDGE BASE (Institutional Memory)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.expert_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Pattern identification
    incident_pattern TEXT NOT NULL, -- 'Kaplan horizontal hydraulic runaway'
    turbine_family turbine_family_enum,
    turbine_variant turbine_variant_enum,
    
    -- Detailed information
    symptoms JSONB NOT NULL, -- {"servo_pressure_spike": true, "hose_rupture": true, "noise": "loud bang"}
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    
    -- Storytelling (the "war story")
    field_notes TEXT, -- "Happened at 3am during winter startup..."
    lesson_learned TEXT,
    preventive_measures TEXT[],
    
    -- Attribution
    reported_by UUID, -- Engineer who witnessed/documented
    verified_by UUID[], -- Other engineers who confirm
    confidence_score REAL DEFAULT 0.5, -- 0-1, increases with verifications
    
    -- Community engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- References
    related_forensic_recordings UUID[] DEFAULT '{}',
    related_interlock_events UUID[] DEFAULT '{}',
    
    -- Tags for searchability
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_family ON public.expert_knowledge(turbine_family);
CREATE INDEX idx_knowledge_pattern ON public.expert_knowledge(incident_pattern);
CREATE INDEX idx_knowledge_tags ON public.expert_knowledge USING GIN(tags);

-- =====================================================
-- 4. ENGINEER FIELD NOTES (Quick Tips)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.engineer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id),
    engineer_id UUID, -- References users table
    
    note_type TEXT DEFAULT 'OBSERVATION', -- 'OBSERVATION', 'TIP', 'WARNING', 'SUCCESS_STORY'
    title TEXT,
    content TEXT NOT NULL,
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE, -- Curated by admins
    
    -- Media attachments
    photo_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_asset ON public.engineer_notes(asset_id, created_at DESC);
CREATE INDEX idx_notes_type ON public.engineer_notes(note_type);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE public.safety_interlock_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.safety_interlock_ledger FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.safety_interlock_ledger FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for consultants" ON public.safety_interlock_ledger FOR UPDATE TO authenticated 
    USING (auth.jwt() ->> 'role' = 'CONSULTANT');

ALTER TABLE public.forensic_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.forensic_recordings FOR SELECT USING (true);
CREATE POLICY "Enable insert for system" ON public.forensic_recordings FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.expert_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.expert_knowledge FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.expert_knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for author" ON public.expert_knowledge FOR UPDATE TO authenticated 
    USING (reported_by = auth.uid());

ALTER TABLE public.engineer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.engineer_notes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.engineer_notes FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Get all pending approvals for a consultant
CREATE OR REPLACE FUNCTION get_pending_approvals(consultant_id UUID)
RETURNS SETOF safety_interlock_ledger AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM safety_interlock_ledger
    WHERE status = 'PENDING'
    AND (
        recommendation = 'APPROVE_WITH_MODIFICATIONS'
        OR (simulation_passed = true AND current_value != proposed_value)
    )
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Search expert knowledge by symptoms
CREATE OR REPLACE FUNCTION search_knowledge_by_symptoms(symptom_keywords TEXT[])
RETURNS SETOF expert_knowledge AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM expert_knowledge
    WHERE symptoms ?| symptom_keywords -- JSONB contains any of the keywords
    ORDER BY confidence_score DESC, upvotes DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE safety_interlock_ledger IS 'Immutable blockchain-style ledger for all Safety Interlock decisions';
COMMENT ON TABLE forensic_recordings IS 'High-frequency (100Hz) recordings of transient events for forensic analysis';
COMMENT ON TABLE expert_knowledge IS 'Institutional memory - preserves 15+ years of field experience';
COMMENT ON TABLE engineer_notes IS 'Quick field tips and observations from experienced engineers';
