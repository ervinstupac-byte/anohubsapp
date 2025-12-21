-- Expert Knowledge Base table
CREATE TABLE IF NOT EXISTS public.expert_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symptom_key TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    severity TEXT DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Experience Ledger (Lessons Learned) table
CREATE TABLE IF NOT EXISTS public.experience_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id),
    symptom_observed TEXT NOT NULL,
    actual_cause TEXT NOT NULL,
    resolution_steps TEXT NOT NULL,
    expert_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed EKB data
INSERT INTO public.expert_knowledge_base (symptom_key, diagnosis, recommended_action, severity) VALUES
('HIGH_FREQ_NOISE_DROP_EFF', 'Potential cavitation on runner blade trailing edges.', 'Verify Draft Tube suction pressure and check for vortex formation.', 'HIGH'),
('BEARING_TEMP_RISE', 'Cooling heat exchanger fouling or circulation pump failure.', 'Check cooling water flow rate and clean filter strainers.', 'MEDIUM'),
('VIBRATION_CENTRAL_DEV', 'Vibration correlated with previously recorded centering deviation.', 'Perform laser alignment check on shaft coupling.', 'HIGH'),
('RUNAWAY_SPEED_RISK', 'Governor failure or guide vane linkage blockage.', 'INITIATE EMERGENCY SHUTDOWN. Engage mechanical brakes.', 'CRITICAL');
