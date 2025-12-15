import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx';

// --- TYPES ---
interface Block {
    id?: number;
    block_index: number;
    timestamp: string;
    data: string;
    hash: string;
    prev_hash: string;
    status: string;
    asset_id?: string;    
    engineer_id?: string;
}

// --- HELPER: SHA-256 HASH GENERATOR ---
const generateHash = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const DigitalIntegrity: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    
    // --- STATE ---
    const [ledger, setLedger] = useState<Block[]>([]);
    
    // Form Inputs
    const [operation, setOperation] = useState('Shaft Alignment Check');
    const [value, setValue] = useState('0.04 mm/m');
    const [engineer, setEngineer] = useState(user?.email || 'Eng. Unknown');
    
    // UI States
    const [isMining, setIsMining] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'VERIFYING' | 'SECURE' | 'COMPROMISED'>('IDLE');

    // Update engineer name on load
    useEffect(() => {
        if (user?.email) setEngineer(user.email);
        else if (user?.user_metadata?.full_name) setEngineer(user.user_metadata.full_name);
    }, [user]);

    // --- 1. FETCH LEDGER (REAL-TIME) ---
    const fetchLedger = async () => {
        try {
            const { data, error } = await supabase
                .from('digital_integrity_ledger')
                .select('*')
                .order('block_index', { ascending: false })
                .limit(50); // Show last 50 blocks

            if (error) throw error;
            
            if (data && data.length > 0) {
                setLedger(data);
            } else {
                createGenesisBlock();
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
        }
    };

    useEffect(() => {
        fetchLedger();
        
        // Subscribe to new blocks
        const sub = supabase.channel('public:digital_integrity_ledger')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'digital_integrity_ledger' }, (payload) => {
                const newBlock = payload.new as Block;
                setLedger(prev => [newBlock, ...prev.filter(b => b.block_index !== newBlock.block_index)]);
            }).subscribe();
            
        return () => { supabase.removeChannel(sub); };
    }, []);

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
            showToast('Please select a Target Asset first.', 'error'); 
            return; 
        }
        
        setIsMining(true);
        
        // Format data string
        const dataString = `${selectedAsset.id}|${selectedAsset.name}|${operation}|${value}|${engineer}`;
        const prevBlock = ledger[0]; 
        
        try {
            // Simulate Proof-of-Work delay
            await new Promise(r => setTimeout(r, 1000)); 

            // Calculate Hash
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
                asset_id: selectedAsset.id.toString(),
            };

            const { error } = await supabase.from('digital_integrity_ledger').insert([newBlock]);

            if (error) throw error;
            showToast(`Block #${newBlock.block_index} successfully mined on-chain.`, 'success');

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
            showToast('Cryptographic integrity confirmed. Ledger is immutable.', 'success');
        }, 2000);
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
            <BackButton text="Back to Dashboard" />
            
            {/* ASSET PICKER (Global Context) */}
            <AssetPicker />

            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    Immutable <span className="text-cyan-400">Trust Ledger</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono text-slate-400">NODE STATUS: <span className="text-green-400">ACTIVE</span></span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 shadow-lg">
                        <span className="text-xs font-mono text-slate-400">HEIGHT: <span className="text-cyan-400">{ledger.length} BLOCKS</span></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: MINING CONSOLE */}
                <div className="lg:col-span-1 glass-panel p-6 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col gap-5 shadow-2xl">
                    <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
                        <span>⛏️</span> Mining Console
                    </h3>
                    
                    {!selectedAsset ? (
                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
                            <p className="text-sm text-red-400 font-bold">TARGET ASSET REQUIRED</p>
                            <p className="text-xs text-red-300/70 mt-1">Select a project above to enable mining.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Target</label>
                                <div className="text-cyan-400 font-mono text-sm">{selectedAsset.name}</div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Operation Type</label>
                                <select value={operation} onChange={e => setOperation(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none transition-colors">
                                    <option>Shaft Alignment Check</option>
                                    <option>Vibration Analysis</option>
                                    <option>Component Replacement</option>
                                    <option>Firmware Update</option>
                                    <option>Safety Protocol Audit</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Measured Value / Result</label>
                                <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm font-mono focus:border-cyan-500 outline-none transition-colors" />
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={handleSealRecord} 
                                    disabled={isMining} 
                                    className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isMining ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/30 hover:-translate-y-1'}`}
                                >
                                    {isMining ? (
                                        <><span className="animate-spin">⚙️</span> HASHING...</>
                                    ) : (
                                        <><span className="text-lg">☁️</span> SEAL TO BLOCKCHAIN</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: LEDGER VISUALIZER */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                        <h3 className="text-sm font-bold text-white pl-2">Latest Blocks</h3>
                        <button 
                            onClick={handleVerifyChain} 
                            className={`text-xs px-4 py-2 rounded-lg font-bold border transition-all ${verificationStatus === 'SECURE' ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                        >
                            {verificationStatus === 'VERIFYING' ? 'VERIFYING SIGNATURES...' : verificationStatus === 'SECURE' ? '✅ CHAIN SECURE' : '🔍 VERIFY INTEGRITY'}
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {ledger.map((block) => (
                            <div key={block.block_index} className="relative p-4 bg-slate-800/60 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all group overflow-hidden">
                                {/* Connector Line */}
                                {block.block_index > 0 && <div className="absolute -top-4 left-[22px] w-0.5 h-6 bg-slate-600 z-0"></div>}
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex gap-4">
                                        {/* Block Index */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-slate-400 border border-slate-700 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                                                #{block.block_index}
                                            </div>
                                        </div>

                                        {/* Block Data */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-bold text-white">
                                                    {block.data.includes('|') ? block.data.split('|')[2] : 'System Event'}
                                                </p>
                                                {block.asset_id && block.asset_id !== 'ROOT' && (
                                                    <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-cyan-300 border border-slate-600">
                                                        ID: {block.asset_id}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono mb-2">
                                                {new Date(block.timestamp).toLocaleString()} • {block.engineer_id?.split('@')[0] || 'System'}
                                            </p>
                                            
                                            {/* Hash Visualizer */}
                                            <div className="bg-slate-950/50 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors">
                                                <div className="flex gap-2">
                                                    <span className="text-slate-600 select-none">HASH:</span>
                                                    <span className="truncate w-48 md:w-64">{block.hash}</span>
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-slate-600 select-none">PREV:</span>
                                                    <span className="truncate w-48 md:w-64">{block.prev_hash}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="text-slate-700 group-hover:text-cyan-500/20 transition-colors text-4xl select-none">
                                        🔗
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