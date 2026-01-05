import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Parse Inbound IoT Bundle
        // Format: { asset_id: UUID, vibration: number, temp: number, ... }
        const payload = await req.json()
        const { asset_id, ...metrics } = payload

        if (!asset_id) throw new Error("Missing asset_id in IoT payload")

        // 3. SECURE INTERLOCK: Check if this data triggers any SentinelKernel rules
        // (In production, we'd import the SentinelKernel logic here or call a separate service)
        let status = 'OPTIMAL'
        if (metrics.vibration > 4.5 || metrics.temperature > 75) {
            status = 'CRITICAL'
        }

        // 4. PERSIST TO DB (Main Status)
        const { error: upsertError } = await supabaseClient
            .from('hpp_status')
            .upsert({
                asset_id,
                ...metrics,
                status,
                last_updated: new Date().toISOString()
            }, { onConflict: 'asset_id' })

        if (upsertError) throw upsertError

        // 5. APPEND TO TIME-SERIES LOGS
        const { error: logError } = await supabaseClient
            .from('dynamic_sensor_data')
            .insert({
                asset_id,
                vibration: metrics.vibration,
                temperature: metrics.temperature,
                output_power: metrics.output,
                status,
                timestamp: new Date().toISOString()
            })

        if (logError) throw logError

        return new Response(JSON.stringify({ success: true, status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
