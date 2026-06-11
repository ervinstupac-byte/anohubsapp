import React, { useState, useEffect, useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer 
} from 'recharts';
import { 
    FileText, Clipboard, Settings, Calendar, User, 
    AlertTriangle, Shield, CheckCircle, Download, ListFilter, Trash2, Activity, Play 
} from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ThresholdResolver } from '../services/ThresholdResolver';
import { supabase } from '../services/supabaseClient';
import { AdversarialSimulator } from '../services/AdversarialSimulator';
import { BlackStartOrchestrator } from '../services/BlackStartOrchestrator';

interface LogbookEntry {
    id: string;
    entry_type: 'Inspekcija' | 'Mjerenje' | 'Incident' | 'Redovno održavanje';
    turbine_id: string;
    turbine_name: string;
    turbine_type: 'FRANCIS' | 'PELTON' | 'KAPLAN';
    timestamp: string;
    shift: 'Jutarnja' | 'Poslijepodnevna' | 'Noćna';
    operator: string;
    measurements: {
        vibration?: number;
        axialPlay?: number;
        bearingTemp?: number;
        oilPressure?: number;
        voltage?: number;
        current?: number;
        windingTemp?: number;
        powerFactor?: number;
        flowRate?: number;
        reservoirLevel?: number;
        pressureDrop?: number;
        cavitationNoise?: number;
        activePower?: number;
        reactivePower?: number;
    };
    notes: string;
    photos: string[];
}

export const DigitalLogbook: React.FC = () => {
    const { assets, selectedAsset } = useAssetContext();
    const { user, isGuest } = useAuth();

    // Form states
    const [entryType, setEntryType] = useState<LogbookEntry['entry_type']>('Mjerenje');
    const [turbineId, setTurbineId] = useState('');
    const [shift, setShift] = useState<LogbookEntry['shift']>('Jutarnja');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Dynamic measurement inputs
    const [vibration, setVibration] = useState('');
    const [axialPlay, setAxialPlay] = useState('');
    const [bearingTemp, setBearingTemp] = useState('');
    const [oilPressure, setOilPressure] = useState('');
    const [voltage, setVoltage] = useState('');
    const [current, setCurrent] = useState('');
    const [windingTemp, setWindingTemp] = useState('');
    const [powerFactor, setPowerFactor] = useState('');
    const [flowRate, setFlowRate] = useState('');
    const [reservoirLevel, setReservoirLevel] = useState('');
    const [pressureDrop, setPressureDrop] = useState('');
    const [cavitationNoise, setCavitationNoise] = useState('');
    const [activePower, setActivePower] = useState('');
    const [reactivePower, setReactivePower] = useState('');

    // Local / Database logs
    const [logs, setLogs] = useState<LogbookEntry[]>([]);
    const [filterTurbine, setFilterTurbine] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

    // Red Team Simulation states
    const [simReport, setSimReport] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Black Start states
    const [blackStartStatus, setBlackStartStatus] = useState<{ active: boolean; step: number }>({ active: false, step: 0 });

    // Active turbine helper
    const activeTurbine = useMemo(() => {
        return assets.find(a => String(a.id) === String(turbineId)) || null;
    }, [turbineId, assets]);

    // Set default turbine based on selection in context
    useEffect(() => {
        if (selectedAsset) {
            setTurbineId(String(selectedAsset.id));
        } else if (assets.length > 0) {
            setTurbineId(String(assets[0].id));
        }
    }, [selectedAsset, assets]);

    // Load logs on mount
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        if (isGuest) {
            console.log('[Logbook] Guest mode active, loading from LocalStorage');
            const localLogs = localStorage.getItem('anohub_local_logbooks');
            if (localLogs) {
                setLogs(JSON.parse(localLogs));
            } else {
                setLogs([]);
            }
            return;
        }

        try {
            // Try Supabase first
            const { data, error } = await supabase
                .from('logbook_entries')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped: LogbookEntry[] = data.map((item: any) => {
                    const match = assets.find(a => String(a.id) === String(item.turbine_id));
                    return {
                        id: item.id,
                        entry_type: item.entry_type,
                        turbine_id: item.turbine_id,
                        turbine_name: match ? match.name : 'Unknown Turbine',
                        turbine_type: match ? (match.turbine_type || 'FRANCIS') as any : 'FRANCIS',
                        timestamp: item.timestamp,
                        shift: item.shift,
                        operator: item.operator,
                        measurements: item.measurements || {},
                        notes: item.notes || '',
                        photos: item.photos || []
                    };
                });
                setLogs(mapped);
            }
        } catch (err) {
            console.debug('[Logbook] Supabase fetch suppressed or failed, loading from LocalStorage');
            const localLogs = localStorage.getItem('anohub_local_logbooks');
            if (localLogs) {
                setLogs(JSON.parse(localLogs));
            } else {
                const seedLogs: LogbookEntry[] = [
                    {
                        id: 'seed-1',
                        entry_type: 'Mjerenje',
                        turbine_id: assets[0]?.id ? String(assets[0].id) : 'mock-id-1',
                        turbine_name: assets[0]?.name || 'Unit-1 (Francis)',
                        turbine_type: 'FRANCIS',
                        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                        shift: 'Jutarnja',
                        operator: 'Ervinstupac',
                        measurements: { vibration: 2.3, bearingTemp: 58.4, activePower: 12.2 },
                        notes: 'Pregled ležajeva obavljen. Parametri stabilni.',
                        photos: []
                    },
                    {
                        id: 'seed-2',
                        entry_type: 'Mjerenje',
                        turbine_id: assets[0]?.id ? String(assets[0].id) : 'mock-id-1',
                        turbine_name: assets[0]?.name || 'Unit-1 (Francis)',
                        turbine_type: 'FRANCIS',
                        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                        shift: 'Noćna',
                        operator: 'Kenan O.',
                        measurements: { vibration: 4.8, bearingTemp: 64.2, activePower: 10.5 },
                        notes: 'Uočena povišena vibracija tokom prelaznog režima rada.',
                        photos: []
                    }
                ];
                setLogs(seedLogs);
                localStorage.setItem('anohub_local_logbooks', JSON.stringify(seedLogs));
            }
        }
    };

    // Auto-detection rules in real time
    const autoDetections = useMemo(() => {
        const detections: string[] = [];
        if (!activeTurbine) return detections;
        const type = String(activeTurbine.turbine_type || activeTurbine.type).toUpperCase();

        // 1. Vibration rules
        if (vibration) {
            const val = parseFloat(vibration);
            // Limit 3.5 for Francis (ISO 10816-5), 4.5 default
            const limit = type === 'FRANCIS' ? 3.5 : 4.5;
            if (val > limit) {
                detections.push(`Vibracija ${val} mm/s — VAN GRANICE za ${type} (max ${limit} mm/s ISO 10816-5)`);
            }
        }

        // 2. Bearings temp rules
        if (bearingTemp) {
            const val = parseFloat(bearingTemp);
            const limit = 60.0; // warning threshold
            if (val > limit) {
                detections.push(`Temperatura ležišta ${val}°C — UPOZORENJE (max ${limit}°C standard)`);
            }
        }

        // 3. Axial Play rules
        if (axialPlay) {
            const val = parseFloat(axialPlay);
            const limit = type === 'KAPLAN' ? 0.08 : 0.05; // roots golden limit
            if (val > limit) {
                detections.push(`Aksijalni pomak ${val} mm — PREKORAČENJE GOLDEN STANDARDA (max ${limit} mm)`);
            }
        }

        return detections;
    }, [vibration, bearingTemp, axialPlay, activeTurbine]);

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turbineId) return;

        const targetTurbine = assets.find(a => String(a.id) === String(turbineId));
        const operatorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'GUEST';

        const payload: Omit<LogbookEntry, 'id'> = {
            entry_type: entryType,
            turbine_id: turbineId,
            turbine_name: targetTurbine ? targetTurbine.name : 'Unknown Turbine',
            turbine_type: targetTurbine ? (targetTurbine.turbine_type || 'FRANCIS') as any : 'FRANCIS',
            timestamp: new Date(date + 'T' + new Date().toTimeString().split(' ')[0]).toISOString(),
            shift,
            operator: operatorName,
            measurements: {
                vibration: vibration ? parseFloat(vibration) : undefined,
                axialPlay: axialPlay ? parseFloat(axialPlay) : undefined,
                bearingTemp: bearingTemp ? parseFloat(bearingTemp) : undefined,
                oilPressure: oilPressure ? parseFloat(oilPressure) : undefined,
                voltage: voltage ? parseFloat(voltage) : undefined,
                current: current ? parseFloat(current) : undefined,
                windingTemp: windingTemp ? parseFloat(windingTemp) : undefined,
                powerFactor: powerFactor ? parseFloat(powerFactor) : undefined,
                flowRate: flowRate ? parseFloat(flowRate) : undefined,
                reservoirLevel: reservoirLevel ? parseFloat(reservoirLevel) : undefined,
                pressureDrop: pressureDrop ? parseFloat(pressureDrop) : undefined,
                cavitationNoise: cavitationNoise ? parseFloat(cavitationNoise) : undefined,
                activePower: activePower ? parseFloat(activePower) : undefined,
                reactivePower: reactivePower ? parseFloat(reactivePower) : undefined,
            },
            notes,
            photos: []
        };

        if (isGuest) {
            const newEntry: LogbookEntry = {
                id: 'local-' + Date.now(),
                ...payload
            };

            const updatedLogs = [newEntry, ...logs];
            setLogs(updatedLogs);
            localStorage.setItem('anohub_local_logbooks', JSON.stringify(updatedLogs));
            setSaveStatus({ type: 'success', msg: 'Zapis sačuvan lokalno (Guest Mode).' });
            
            // Reset inputs
            setNotes('');
            setVibration('');
            setAxialPlay('');
            setBearingTemp('');
            setOilPressure('');
            setVoltage('');
            setCurrent('');
            setWindingTemp('');
            setPowerFactor('');
            setFlowRate('');
            setReservoirLevel('');
            setPressureDrop('');
            setCavitationNoise('');
            setActivePower('');
            setReactivePower('');
            setTimeout(() => setSaveStatus({ type: null, msg: '' }), 5000);
            return;
        }

        try {
            // Attempt Supabase insert
            const { data, error } = await supabase
                .from('logbook_entries')
                .insert([{
                    entry_type: payload.entry_type,
                    turbine_id: payload.turbine_id,
                    timestamp: payload.timestamp,
                    shift: payload.shift,
                    operator: payload.operator,
                    measurements: payload.measurements,
                    notes: payload.notes,
                    photos: payload.photos
                }])
                .select();

            if (error) throw error;

            setSaveStatus({ type: 'success', msg: 'Zapis uspješno spremljen u Supabase bazu.' });
            loadLogs();
        } catch (err: any) {
            // Fallback: Save locally
            console.debug('[Logbook] Supabase write failed, falling back to LocalStorage:', err.message || err);
            
            const newEntry: LogbookEntry = {
                id: 'local-' + Date.now(),
                ...payload
            };

            const updatedLogs = [newEntry, ...logs];
            setLogs(updatedLogs);
            localStorage.setItem('anohub_local_logbooks', JSON.stringify(updatedLogs));
            setSaveStatus({ type: 'success', msg: 'Zapis sačuvan lokalno (Supabase offline fallback).' });
        }

        // Reset inputs
        setNotes('');
        setVibration('');
        setAxialPlay('');
        setBearingTemp('');
        setOilPressure('');
        setVoltage('');
        setCurrent('');
        setWindingTemp('');
        setPowerFactor('');
        setFlowRate('');
        setReservoirLevel('');
        setPressureDrop('');
        setCavitationNoise('');
        setActivePower('');
        setReactivePower('');

        setTimeout(() => setSaveStatus({ type: null, msg: '' }), 5000);
    };

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesTurbine = filterTurbine === 'ALL' || String(log.turbine_id) === String(filterTurbine);
            const matchesType = filterType === 'ALL' || log.entry_type === filterType;
            return matchesTurbine && matchesType;
        });
    }, [logs, filterTurbine, filterType]);

    // Trend chart data (reverse to chronological order for charts)
    const chartData = useMemo(() => {
        return [...filteredLogs]
            .reverse()
            .map(log => ({
                date: new Date(log.timestamp).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit' }),
                vibration: log.measurements.vibration || null,
                temperature: log.measurements.bearingTemp || null,
                activePower: log.measurements.activePower || null,
                name: log.turbine_name
            }))
            .filter(item => item.vibration !== null || item.temperature !== null || item.activePower !== null);
    }, [filteredLogs]);

    // PDF Export function
    const exportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFillColor(11, 15, 25);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("ANOHUB DIGITALNI LOGBOOK REPORT", 14, 18);
        doc.setFontSize(9);
        doc.text(`Generisano: ${new Date().toLocaleString('bs-BA')}`, 14, 25);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text("Istorijski zapis unosa operatera", 14, 42);

        const tableBody = filteredLogs.map(l => [
            new Date(l.timestamp).toLocaleString('bs-BA'),
            l.turbine_name,
            l.entry_type,
            l.operator,
            l.shift,
            `Vib: ${l.measurements.vibration || '-'} mm/s, Temp: ${l.measurements.bearingTemp || '-'}C, Snaga: ${l.measurements.activePower || '-'} MW`,
            l.notes
        ]);

        (doc as any).autoTable({
            startY: 48,
            head: [['Datum/Vrijeme', 'Agregat', 'Tip Unosa', 'Operator', 'Smjena', 'Mjerenja', 'Komentar']],
            body: tableBody,
            headStyles: { fillColor: [6, 182, 212] },
            theme: 'striped',
            styles: { fontSize: 8 },
        });

        doc.save(`anohub_logbook_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Clean local logs helper
    const handleClearLogs = () => {
        if (window.confirm("Jeste li sigurni da želite obrisati sve lokalne logbook unose?")) {
            localStorage.removeItem('anohub_local_logbooks');
            loadLogs();
        }
    };

    // Trigger Red Team Simulation
    const handleRedTeamSim = async () => {
        setIsSimulating(true);
        setSimReport(null);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI think time
        
        // Capture console output of the simulation
        const originalLog = console.log;
        let capturedOutput = '';
        console.log = (msg: string) => {
            capturedOutput += msg + '\n';
        };
        
        AdversarialSimulator.simulateScenario('MARKET_COLLAPSE');
        const report = AdversarialSimulator.generateRedTeamReport();
        
        console.log = originalLog;
        setSimReport(report);
        setIsSimulating(false);
    };

    // Trigger Black Start Sequence
    const handleBlackStart = async () => {
        if (blackStartStatus.active) return;
        setBlackStartStatus({ active: true, step: 0 });
        
        const pollInterval = setInterval(() => {
            const status = BlackStartOrchestrator.getStatus();
            setBlackStartStatus(status);
            if (!status.active && status.step > 0) {
                clearInterval(pollInterval);
            }
        }, 500);

        try {
            await BlackStartOrchestrator.initiateBlackStart();
        } finally {
            clearInterval(pollInterval);
            setBlackStartStatus({ active: false, step: 8 });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                        📋 Moj Digitalni Logbook
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Strukturirani guided unosi telemetry mjerenja, auto-detekcija limita i izvoz izvještaja.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={exportPDF}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Eksportuj PDF
                    </button>
                    <button 
                        onClick={handleClearLogs}
                        className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-all"
                        title="Očisti lokalni log"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {saveStatus.type && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    saveStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200'
                }`}>
                    {saveStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="text-xs font-mono">{saveStatus.msg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* FORM COLUMN (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                            <Clipboard className="w-4 h-4 text-cyan-500" />
                            Unos novog izvještaja
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Entry type */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tip unosa</label>
                                    <select 
                                        value={entryType} 
                                        onChange={(e) => setEntryType(e.target.value as any)}
                                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-2.5 text-xs outline-none"
                                    >
                                        <option value="Mjerenje">Mjerenje parametara</option>
                                        <option value="Inspekcija">Rutinska inspekcija</option>
                                        <option value="Incident">Incident / Kvar</option>
                                        <option value="Redovno održavanje">Redovno održavanje</option>
                                    </select>
                                </div>

                                {/* Turbine select */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Turbinski agregat</label>
                                    <select 
                                        value={turbineId} 
                                        onChange={(e) => setTurbineId(e.target.value)}
                                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-2.5 text-xs outline-none"
                                    >
                                        <option value="">-- Odaberi jedinicu --</option>
                                        {assets.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.turbine_type || a.type})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Shift */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Operativna smjena</label>
                                    <select 
                                        value={shift} 
                                        onChange={(e) => setShift(e.target.value as any)}
                                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-2.5 text-xs outline-none"
                                    >
                                        <option value="Jutarnja">Jutarnja smjena (06:00 - 14:00)</option>
                                        <option value="Poslijepodnevna">Poslijepodnevna smjena (14:00 - 22:00)</option>
                                        <option value="Noćna">Noćna smjena (22:00 - 06:00)</option>
                                    </select>
                                </div>

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Datum unosa</label>
                                    <input 
                                        type="date" 
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-2.5 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            {/* DYNAMIC TELEMETRY SECTION */}
                            {activeTurbine && (
                                <div className="border-t border-white/5 pt-4 space-y-4">
                                    <h3 className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider">
                                        Mjerenja ({activeTurbine.turbine_type || activeTurbine.type} specifikacija)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* MECHANICAL BLOCK */}
                                        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
                                            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Mehanička mjerenja</h4>
                                            
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Vibracije ležišta [mm/s]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={vibration} 
                                                    onChange={(e) => setVibration(e.target.value)}
                                                    placeholder="npr. 2.3"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Aksijalni pomak [mm]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={axialPlay} 
                                                    onChange={(e) => setAxialPlay(e.target.value)}
                                                    placeholder="npr. 0.04"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Temperatura ležišta [°C]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={bearingTemp} 
                                                    onChange={(e) => setBearingTemp(e.target.value)}
                                                    placeholder="npr. 58.4"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* HYDRAULIC BLOCK */}
                                        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
                                            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Hidraulička mjerenja</h4>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Protok vode [m³/s]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={flowRate} 
                                                    onChange={(e) => setFlowRate(e.target.value)}
                                                    placeholder="npr. 9.8"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Nivo akumulacije [m]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={reservoirLevel} 
                                                    onChange={(e) => setReservoirLevel(e.target.value)}
                                                    placeholder="npr. 145.0"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            {/* Turbine specific field */}
                                            {activeTurbine.turbine_type === 'FRANCIS' && (
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-400">Pad pritiska rešetke [bar]</label>
                                                    <input 
                                                        type="number" 
                                                        step="0.01" 
                                                        value={pressureDrop} 
                                                        onChange={(e) => setPressureDrop(e.target.value)}
                                                        placeholder="npr. 0.12"
                                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                    />
                                                </div>
                                            )}

                                            {activeTurbine.turbine_type === 'PELTON' && (
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-400">Kavitacijski šum mlaznice [dB]</label>
                                                    <input 
                                                        type="number" 
                                                        step="0.1" 
                                                        value={cavitationNoise} 
                                                        onChange={(e) => setCavitationNoise(e.target.value)}
                                                        placeholder="npr. 45"
                                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* ELECTRICAL BLOCK */}
                                        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
                                            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Elektrooprema</h4>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Napon generatora [V]</label>
                                                <input 
                                                    type="number" 
                                                    value={voltage} 
                                                    onChange={(e) => setVoltage(e.target.value)}
                                                    placeholder="npr. 10500"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Struja generatora [A]</label>
                                                <input 
                                                    type="number" 
                                                    value={current} 
                                                    onChange={(e) => setCurrent(e.target.value)}
                                                    placeholder="npr. 680"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* PRODUCTION BLOCK */}
                                        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
                                            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Proizvodnja energije</h4>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Aktivna snaga [MW]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={activePower} 
                                                    onChange={(e) => setActivePower(e.target.value)}
                                                    placeholder="npr. 12.5"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400">Reaktivna snaga [MVAR]</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={reactivePower} 
                                                    onChange={(e) => setReactivePower(e.target.value)}
                                                    placeholder="npr. 3.2"
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AUTO DETECTION INLINE WARNINGS */}
                            {autoDetections.length > 0 && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                                    <div className="text-[10px] font-mono font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                                        Auto-Detekcija prekršaja
                                    </div>
                                    <div className="space-y-1">
                                        {autoDetections.map((d, i) => (
                                            <div key={i} className="text-xs text-red-200 font-mono">
                                                ⚠ {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Commentary / Notes */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Operativne bilješke / Komentar</label>
                                <textarea 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Unesite slobodni komentar ili zapažanje..."
                                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-3 text-xs outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider font-mono text-xs rounded-xl shadow-lg transition-all"
                            >
                                Snimi unos u Dnevnik
                            </button>
                        </form>
                    </GlassCard>
                </div>

                {/* HISTORY & CHARTS COLUMN (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Recharts trend graphs */}
                    <GlassCard className="p-5 border-white/5 bg-slate-900/30">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            Trendovi parametara (Iz logova)
                        </h2>
                        
                        {chartData.length > 0 ? (
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                                        <YAxis stroke="#94a3b8" fontSize={9} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                            labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                                            itemStyle={{ color: '#fff', fontSize: 10 }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 10 }} />
                                        <Line type="monotone" dataKey="vibration" name="Vibracije (mm/s)" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} connectNulls />
                                        <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#fbbf24" strokeWidth={2} connectNulls />
                                        <Line type="monotone" dataKey="activePower" name="Snaga (MW)" stroke="#34d399" strokeWidth={2} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-500 text-xs font-mono">
                                Nema dovoljno istorijskih mjerenja za prikaz grafikona.
                            </div>
                        )}
                    </GlassCard>

                    {/* Filtered logs timeline */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                                <ListFilter className="w-3.5 h-3.5 text-amber-500" />
                                Istorija unosa
                            </h2>
                            <div className="flex gap-2">
                                {/* Turbine filter */}
                                <select 
                                    value={filterTurbine} 
                                    onChange={(e) => setFilterTurbine(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[10px] font-mono outline-none"
                                >
                                    <option value="ALL">Sve turbine</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <GlassCard key={log.id} className="p-4 border-white/5 bg-slate-900/40 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                                                        {log.turbine_name}
                                                    </h4>
                                                    <p className="text-[9px] text-slate-500 font-mono">
                                                        {new Date(log.timestamp).toLocaleString('bs-BA')} | {log.shift} smjena
                                                    </p>
                                                </div>
                                                <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                                                    {log.entry_type}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                                                "{log.notes || 'Bez dodatnog komentara.'}"
                                            </p>

                                            {/* Logged telemetry summary */}
                                            {Object.keys(log.measurements).length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                                    {log.measurements.vibration !== undefined && (
                                                        <div className="text-center">
                                                            <div className="text-[8px] text-slate-500 font-mono">VIB</div>
                                                            <div className="text-xs font-mono font-bold text-white">{log.measurements.vibration} mm/s</div>
                                                        </div>
                                                    )}
                                                    {log.measurements.bearingTemp !== undefined && (
                                                        <div className="text-center">
                                                            <div className="text-[8px] text-slate-500 font-mono">TEMP</div>
                                                            <div className="text-xs font-mono font-bold text-white">{log.measurements.bearingTemp}°C</div>
                                                        </div>
                                                    )}
                                                    {log.measurements.activePower !== undefined && (
                                                        <div className="text-center">
                                                            <div className="text-[8px] text-slate-500 font-mono">SNAGA</div>
                                                            <div className="text-xs font-mono font-bold text-white">{log.measurements.activePower} MW</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="text-[9px] text-slate-500 font-mono text-right">
                                                Unio: <span className="text-cyan-400 font-bold">@{log.operator}</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                                    Nema log zapisa koji odgovaraju odabranim filterima.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RED TEAM ADVERSARIAL SIMULATOR PANEL */}
                    <GlassCard className="p-5 border-red-500/20 bg-red-950/10 mt-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-red-400 font-mono mb-4 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            Adversarial Stress Test (Red Team)
                        </h2>
                        <p className="text-[10px] text-slate-400 font-mono mb-4">
                            Simulirajte ekstremne "Black Swan" događaje kako biste testirali anti-fragilnost sistema (npr. Total Market Collapse, Cyber Napad).
                        </p>
                        
                        <button
                            onClick={handleRedTeamSim}
                            disabled={isSimulating}
                            className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 font-bold uppercase tracking-wider font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isSimulating ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                                    Generisanje simulacije...
                                </>
                            ) : (
                                <>
                                    <Play className="w-3.5 h-3.5" />
                                    Pokreni "Market Collapse"
                                </>
                            )}
                        </button>

                        {simReport && (
                            <div className="mt-4 p-3 bg-black/60 border border-red-500/20 rounded-lg text-[9px] text-red-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                                {simReport}
                            </div>
                        )}
                    </GlassCard>

                    {/* BLACK START ORCHESTRATOR PANEL */}
                    <GlassCard className="p-5 border-amber-500/20 bg-amber-950/10 mt-6">
                        <h2 className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" />
                            Emergency Protocols (Black Start)
                        </h2>
                        <p className="text-[10px] text-slate-400 font-mono mb-4">
                            Simulacija autonomnog podizanja sistema iz totalnog mraka (Cold Start) koristeći interne DC baterije i H2 ćelije.
                        </p>
                        
                        <button
                            onClick={handleBlackStart}
                            disabled={blackStartStatus.active}
                            className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {blackStartStatus.active ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                                    Sekvenca U Toku (Korak {blackStartStatus.step}/8)...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Iniciraj Totalni Blackout
                                </>
                            )}
                        </button>

                        {blackStartStatus.step > 0 && (
                            <div className="mt-4 p-4 bg-black/60 border border-amber-500/20 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">Cold Start Sekvenca</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{Math.round((blackStartStatus.step / 8) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 transition-all duration-500" 
                                        style={{ width: `${(blackStartStatus.step / 8) * 100}%` }}
                                    />
                                </div>
                                <div className="mt-3 text-[9px] text-slate-400 font-mono">
                                    {blackStartStatus.step === 1 && '▶ Aktivacija DC baterija (125V)...'}
                                    {blackStartStatus.step === 2 && '▶ Paljenje H2 Fuel Cell agregata...'}
                                    {blackStartStatus.step === 3 && '▶ Pokretanje uljnih pumpi...'}
                                    {blackStartStatus.step === 4 && '▶ Aktivacija rashladnog sistema...'}
                                    {blackStartStatus.step === 5 && '▶ Energizacija pobudnog sistema...'}
                                    {blackStartStatus.step === 6 && '▶ Otvaranje sprovodnog aparata (Wicket Gates)...'}
                                    {blackStartStatus.step === 7 && '▶ Sinhronizacija generatora (50 Hz)...'}
                                    {blackStartStatus.step === 8 && '✅ BLACK START ZAVRŠEN - Jedinica ONLINE'}
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>


            </div>

        </div>
    );
};
