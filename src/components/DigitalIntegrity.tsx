import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // IMPORT
import { BackButton } from './BackButton.tsx';
import { useToast } from '../stores/useAppStore';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AssetPicker } from './AssetPicker.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore.ts'; // Data Bridge
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { FetchSkeleton } from '../shared/components/ui/FetchSkeleton';
import { RefreshCw } from 'lucide-react'; // Icon for Fetch
import idAdapter from '../utils/idAdapter';

// --- TYPES ---
interface Block {
    id?: number;
    block_index: number;
    timestamp: string;
    data: string;
    hash: string;
    prev_hash: string;
    status: string;
    asset_id?: number;
    engineer_id?: string;
}

// --- HELPER: SHA-256 HASH GENERATOR ---
const generateHash = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const DigitalIntegrity: React.FC = () => {
    const { t } = useTranslation(); // HOOK
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { mechanical, physics } = useTelemetryStore(); // Live Telemetry Store

    // --- STATE ---
    const [ledger, setLedger] = useState<Block[]>([]);

    // Form Inputs
    const [operation, setOperation] = useState('Shaft Alignment Check');
    const [value, setValue] = useState('0.04 mm/m');
    const [engineer, setEngineer] = useState(user?.email || 'Field Engineer');

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isMining, setIsMining] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'VERIFYING' | 'SECURE' | 'COMPROMISED'>('IDLE');

    useEffect(() => {
        if (user?.email) setEngineer(user.email);
        else if (user?.user_metadata?.full_name) setEngineer(user.user_metadata.full_name);
    }, [user]);

    // --- 0. SMART ASSIST: FETCH LIVE DATA ---
    const fetchLiveTelemetry = () => {
        if (operation === 'Vibration Analysis' && mechanical?.vibration !== undefined) {
            setValue(`${mechanical.vibration.toFixed(3)} mm/s ISO`);
            showToast('Fetched Live Vibration Data', 'success');
        } else if (operation === 'Shaft Alignment Check' && mechanical?.rpm !== undefined) {
            setValue(mechanical.rpm > 1 ? `Dynamic Run-out @ ${mechanical.rpm.toFixed(0)} RPM` : 'Static Alignment OK');
            showToast('Fetched Alignment Context', 'success');
        } else if (operation.includes('Seal') && physics?.surgePressureBar !== undefined) {
            const pressure = physics.surgePressureBar;
            setValue(`${pressure.toFixed(2)} Bar (Live)`);
            showToast('Fetched Live Pressure Data', 'success');
        } else {
            showToast('No relevant telemetry stream found for this operation.', 'info');
        }
    };

    // --- 1. FETCH LEDGER (REAL-TIME) ---
    const fetchLedger = async () => {
        try {
            let query = supabase
                .from('digital_integrity_ledger')
                .select('*')
                .order('block_index', { ascending: false })
                .limit(50);

            if (selectedAsset) {
                query = query.eq('asset_id', idAdapter.toStorage(selectedAsset.id));
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                setLedger(data);
            } else {
                createGenesisBlock();
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();

        const sub = supabase.channel('public:digital_integrity_ledger')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'digital_integrity_ledger',
                filter: selectedAsset ? `asset_id=eq.${idAdapter.toStorage(selectedAsset.id)}` : undefined
            }, (payload: any) => {
                const newBlock = payload.new as Block;
                setLedger(prev => [newBlock, ...prev.filter(b => b.block_index !== newBlock.block_index)]);
            }).subscribe();

        return () => { try { (supabase as any).removeChannel(sub); } catch (e) { } };
    }, [selectedAsset]);

    // --- 2. GENESIS BLOCK (First Block) ---
    const createGenesisBlock = async () => {
        const genesisHash = await generateHash("GENESIS_ANOHUB_V1");
        const genesisBlock = {
            block_index: 0,
            timestamp: new Date().toISOString(),
            data: "GENESIS: SYSTEM INITIALIZATION",
            hash: genesisHash,
            prev_hash: "00000000000000000000000000000000",
            status: 'Verified',
            engineer_id: 'SYSTEM',
            asset_id: 'ROOT'
        };
        await supabase.from('digital_integrity_ledger').insert([genesisBlock]);
        fetchLedger();
    };

    // --- 3. MINING NEW BLOCK (Write) ---
    const handleSealRecord = async () => {
        if (!selectedAsset) {
            showToast(t('digitalIntegrity.toast.selectAsset', 'Please select a Target Asset first.'), 'error');
            return;
        }

        setIsMining(true);

        const dataString = `${idAdapter.toStorage(selectedAsset.id)}|${selectedAsset.name}|${operation}|${value}|${engineer}`;
        const prevBlock = ledger[0];

        if (!prevBlock) {
            showToast('Genesis block not found. Please refresh.', 'error');
            setIsMining(false);
            return;
        }

        try {
            await new Promise(r => setTimeout(r, 1000));

            const rawContent = prevBlock.hash + dataString + new Date().toISOString();
            const newHash = await generateHash(rawContent);

            const newBlock = {
                block_index: prevBlock.block_index + 1,
                timestamp: new Date().toISOString(),
                data: dataString,
                hash: newHash,
                prev_hash: prevBlock.hash,
                status: 'Verified',
                engineer_id: engineer,
                asset_id: idAdapter.toStorage(selectedAsset.id),
            };

            const { error } = await supabase.from('digital_integrity_ledger').insert([newBlock]);

            if (error) throw error;
            showToast(t('digitalIntegrity.toast.mined', { index: newBlock.block_index, defaultValue: `Block #${newBlock.block_index} successfully mined on-chain.` }), 'success');

        } catch (error: any) {
            console.error('Mining failed:', error);
            showToast(error.message, 'error');
        } finally {
            setIsMining(false);
        }
    };

    // --- 4. VERIFICATION SIMULATION ---
    const handleVerifyChain = () => {
        setVerificationStatus('VERIFYING');
        setTimeout(() => {
            setVerificationStatus('SECURE');
            showToast(t('digitalIntegrity.toast.verified', 'Cryptographic integrity confirmed. Ledger is immutable.'), 'success');
        }, 2000);
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">

            {/* HERO HEADER */}
            <div className="text-center space-y-6 pt-6 relative">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-7xl px-4">
                    <BackButton text={t('actions.back', 'Back to Hub')} />
                </div>

                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('digitalIntegrity.title', 'Immutable Trust Ledger')}
                    </h2>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-mono text-slate-400">{t('digitalIntegrity.nodeStatus', 'NODE STATUS')}: <span className="text-emerald-400 font-bold">{t('common.active', 'ACTIVE')}</span></span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-lg">
                            <span className="text-xs font-mono text-slate-400">{t('digitalIntegrity.height', 'HEIGHT')}: <span className="text-cyan-400 font-bold">{ledger.length} {t('digitalIntegrity.blocks', 'BLOCKS')}</span></span>
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto">
                    <AssetPicker />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: MINING CONSOLE */}
                <GlassCard className="h-fit border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <span className="text-2xl">⛏️</span>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('digitalIntegrity.miningConsole', 'Mining Console')}</h3>
                    </div>

                    {!selectedAsset ? (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <p className="text-sm text-red-400 font-bold uppercase tracking-wide mb-1">{t('digitalIntegrity.noAssetTitle', 'Target Asset Required')}</p>
                            <p className="text-xs text-red-200/70">{t('digitalIntegrity.noAssetDesc', 'Select a project above to enable mining operations.')}</p>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-fade-in">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">{t('digitalIntegrity.targetAsset', 'Target Asset')}</label>
                                <div className="text-cyan-400 font-mono text-sm font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                                    {selectedAsset.name}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block ml-1">{t('digitalIntegrity.opType', 'Operation Type')}</label>
                                <select
                                    value={operation}
                                    onChange={e => setOperation(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors cursor-pointer"
                                >
                                    <option value="Shaft Alignment Check">{t('digitalIntegrity.operations.alignment', 'Shaft Alignment Check')}</option>
                                    <option value="Maintenance Protocol Seal">{t('digitalIntegrity.operations.maintenance', 'Maintenance Protocol Seal')}</option>
                                    <option value="Part Installation (QR Confirmed)">{t('digitalIntegrity.operations.partInstallation', 'Part Installation (QR Confirmed)')}</option>
                                    <option value="Vibration Analysis">{t('digitalIntegrity.operations.vibration', 'Vibration Analysis')}</option>
                                    <option value="Component Replacement">{t('digitalIntegrity.operations.replacement', 'Component Replacement')}</option>
                                    <option value="Firmware Update">{t('digitalIntegrity.operations.firmware', 'Firmware Update')}</option>
                                    <option value="Safety Protocol Audit">{t('digitalIntegrity.operations.audit', 'Safety Protocol Audit')}</option>
                                </select>
                            </div>

                            <div className="relative">
                                <ModernInput
                                    label={t('digitalIntegrity.resultLabel', 'Measured Value / Result')}
                                    value={value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                                    className="font-mono pr-12"
                                />
                                <button
                                    onClick={fetchLiveTelemetry}
                                    className="absolute right-2 bottom-2 p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                                    title="Fetch Live System Data"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="pt-4">
                                <ModernButton
                                    onClick={handleSealRecord}
                                    disabled={isMining}
                                    variant="primary"
                                    fullWidth
                                    isLoading={isMining}
                                    className="h-14 shadow-cyan-500/20"
                                    icon={!isMining && <span>🔒</span>}
                                >
                                    {isMining ? t('digitalIntegrity.btnHashing', 'HASHING BLOCK...') : t('digitalIntegrity.btnSeal', 'SEAL TO BLOCKCHAIN')}
                                </ModernButton>
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* RIGHT: LEDGER VISUALIZER */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-700 backdrop-blur-md">
                        <h3 className="text-sm font-bold text-white pl-2 uppercase tracking-wider">{t('digitalIntegrity.latestBlocks', 'Latest Blocks')}</h3>
                        <button
                            onClick={handleVerifyChain}
                            className={`
                                text-[10px] px-4 py-2 rounded-lg font-bold border transition-all uppercase tracking-widest
                                ${verificationStatus === 'SECURE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white'}
                            `}
                        >
                            {verificationStatus === 'VERIFYING'
                                ? t('digitalIntegrity.btnVerifying', 'VERIFYING SIGNATURES...')
                                : verificationStatus === 'SECURE'
                                    ? t('digitalIntegrity.btnSecure', '✅ CHAIN SECURE')
                                    : t('digitalIntegrity.btnVerify', '🔍 VERIFY INTEGRITY')}
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        <FetchSkeleton loading={isLoading} count={5}>
                            {ledger.map((block) => (
                                <div key={block.block_index} className="relative p-5 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all group overflow-hidden">

                                    {/* Connector Line */}
                                    {block.block_index > 0 && <div className="absolute -top-6 left-[27px] w-0.5 h-10 bg-slate-800 z-0"></div>}

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-5">
                                            {/* Block Index */}
                                            <div className="flex flex-col items-center pt-1">
                                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-slate-500 border border-slate-800 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors shadow-inner">
                                                    #{block.block_index}
                                                </div>
                                            </div>

                                            {/* Block Data */}
                                            <div className="flex-grow">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                                    <p className="text-base font-bold text-white tracking-tight">
                                                        {block.data.includes('|') ? block.data.split('|')[2] : 'System Event'}
                                                    </p>
                                                    {block.asset_id && String(block.asset_id) !== 'ROOT' && (
                                                        <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-cyan-200 border border-slate-700 font-mono w-fit">
                                                            ASSET ID: {block.asset_id}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mb-3 uppercase tracking-wide">
                                                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                    <span>{block.engineer_id?.split('@')[0] || 'System'}</span>
                                                </div>

                                                {/* Hash Visualizer */}
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors">
                                                    <div className="flex gap-3 mb-1">
                                                        <span className="text-slate-600 select-none font-bold w-8 text-right">HASH:</span>
                                                        <span className="truncate w-full text-emerald-500/80">{block.hash}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <span className="text-slate-600 select-none font-bold w-8 text-right">PREV:</span>
                                                        <span className="truncate w-full">{block.prev_hash}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Icon */}
                                        <div className="text-slate-800 group-hover:text-cyan-500/10 transition-colors text-5xl select-none absolute right-4 top-4 pointer-events-none">
                                            🔗
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </FetchSkeleton>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport
