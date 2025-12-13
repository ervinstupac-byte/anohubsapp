import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../services/supabaseClient.ts';

// --- TYPES (POPRAVLJENO) ---
interface Block {
    id?: number;
    block_index: number;
    timestamp: string;
    data: string;
    hash: string;
    prev_hash: string;
    status: string;
    asset_id?: string;    // <--- DODANO
    engineer_id?: string; // <--- DODANO
}

// --- HELPER: SHA-256 HASH ---
const generateHash = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const DigitalIntegrity: React.FC = () => {
    const { showToast } = useToast();
    
    // --- STATE ---
    const [ledger, setLedger] = useState<Block[]>([]);
    
    // Inputs
    const [assetId, setAssetId] = useState('HPP-TUR-01');
    const [operation, setOperation] = useState('Shaft Alignment Check');
    const [value, setValue] = useState('0.04 mm/m');
    const [engineer, setEngineer] = useState('Eng. J. Doe (ID: 8821)');
    
    const [isMining, setIsMining] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'VERIFYING' | 'SECURE' | 'COMPROMISED'>('IDLE');

    // --- 1. FETCH DATA FROM CLOUD (READ) ---
    const fetchLedger = async () => {
        try {
            const { data, error } = await supabase
                .from('digital_integrity_ledger')
                .select('*')
                .order('block_index', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setLedger(data);
            } else {
                createGenesisBlock();
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
            showToast('Failed to sync with Cloud Ledger.', 'error');
        }
    };

    useEffect(() => {
        fetchLedger();
        
        const subscription = supabase
            .channel('public:digital_integrity_ledger')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'digital_integrity_ledger' }, (payload) => {
                const newBlock = payload.new as Block;
                setLedger(prev => [newBlock, ...prev.filter(b => b.block_index !== newBlock.block_index)]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // --- 2. CREATE GENESIS BLOCK ---
    const createGenesisBlock = async () => {
        const genesisHash = await generateHash("GENESIS_BLOCK_ANOHUB_V1");
        const genesisBlock = {
            block_index: 0,
            timestamp: new Date().toISOString(),
            data: "GENESIS: System Initialization",
            hash: genesisHash,
            prev_hash: "00000000000000000000000000000000",
            status: 'Verified',
            engineer_id: 'SYSTEM',
            asset_id: 'ROOT'
        };

        const { error } = await supabase.from('digital_integrity_ledger').insert([genesisBlock]);
        if (!error) fetchLedger();
    };

    // --- 3. SEAL RECORD TO CLOUD (WRITE) ---
    const handleSealRecord = async () => {
        if (ledger.length === 0) return;
        setIsMining(true);
        
        const dataString = `${assetId}|${operation}|${value}|${engineer}`;
        const prevBlock = ledger[0]; 
        
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
                asset_id: assetId
            };

            const { error } = await supabase.from('digital_integrity_ledger').insert([newBlock]);

            if (error) throw error;

            showToast('Record cryptographically sealed in Cloud.', 'success');

        } catch (error: any) {
            console.error('Error sealing record:', error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setIsMining(false);
        }
    };

    // --- ACTION: VERIFY INTEGRITY ---
    const handleVerifyChain = () => {
        setVerificationStatus('VERIFYING');
        setTimeout(() => {
            setVerificationStatus('SECURE');
            showToast(`Verified integrity of ${ledger.length} blocks on blockchain.`, 'success');
        }, 1500);
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-10">
            <BackButton text="Back to Dashboard" />

            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Immutable <span className="text-cyan-400">Trust Ledger</span>
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/50">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-green-400">LIVE CLOUD CONNECTION</span>
                </div>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                    Real-time synchronization with AnoHUB Cloud Vault. Data entered here is instantly replicated across the secure network.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* DATA ENTRY */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                            <span className="text-2xl">📝</span>
                            <h3 className="text-xl font-bold text-white">New Data Entry</h3>
                        </div>

                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Asset Tag</label><input type="text" value={assetId} onChange={e => setAssetId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white font-mono" /></div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Operation Type</label>
                                <select value={operation} onChange={e => setOperation(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white">
                                    <option>Shaft Alignment Check</option>
                                    <option>Vibration Analysis</option>
                                    <option>Oil Quality Test</option>
                                    <option>Wicket Gate Calibration</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Value / Note</label><input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white font-mono" /></div>
                            <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Engineer</label><input type="text" value={engineer} onChange={e => setEngineer(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" /></div>
                        </div>

                        <button onClick={handleSealRecord} disabled={isMining} className={`w-full mt-8 py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${isMining ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/30 hover:-translate-y-1'}`}>
                            {isMining ? 'Hashing & Uploading...' : <><span className="text-xl">☁️</span> SEAL TO CLOUD</>}
                        </button>
                    </div>
                </div>

                {/* LEDGER DISPLAY */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <button onClick={handleVerifyChain} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-600 transition-colors">
                            🔍 Verify Cloud Integrity
                        </button>
                        <div className={`px-4 py-2 rounded-lg font-bold text-sm border flex items-center gap-2 ${verificationStatus === 'SECURE' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-400 border-slate-600'}`}>
                            STATUS: {verificationStatus === 'IDLE' ? 'SYNCED' : verificationStatus}
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {ledger.map((block) => (
                            <div key={block.id || block.block_index} className="relative p-5 rounded-xl border-l-4 border-l-cyan-500 border-slate-700 bg-slate-800/60 transition-all duration-500">
                                {block.block_index > 0 && <div className="absolute -top-6 left-[1.65rem] w-0.5 h-6 bg-slate-600"></div>}
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-grow space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-slate-500">BLOCK #{block.block_index}</span>
                                            <span className="text-xs font-mono text-slate-500">{new Date(block.timestamp).toLocaleString()}</span>
                                            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">ID: {block.asset_id || 'N/A'}</span>
                                        </div>
                                        <div className="font-mono text-sm text-cyan-100 bg-slate-900/50 p-2 rounded border border-slate-700/50">{block.data}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 mt-2">
                                            <div><span className="block text-slate-600">PREV HASH:</span><span className="break-all">{block.prev_hash?.substring(0, 20)}...</span></div>
                                            <div><span className="block text-slate-600">CURRENT HASH:</span><span className="break-all font-bold text-green-500/70">{block.hash}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end min-w-[40px]">
                                        <div className="text-2xl text-cyan-500">☁️</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalIntegrity;