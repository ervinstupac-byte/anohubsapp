import React, { useState } from 'react';
import { useMaintenance, MaintenanceTask } from '../contexts/MaintenanceContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Camera, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MaintenanceLogbook: React.FC = () => {
    const { tasks, createLogEntry, validateEntry } = useMaintenance();
    const { t } = useTranslation();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    // Synapse Integration: Handle incoming observations from SOPs
    const location = useLocation();

    // Ad-Hoc Mode State
    const [isAdHoc, setIsAdHoc] = useState(false);
    const [adHocSource, setAdHocSource] = useState('');

    React.useEffect(() => {
        if (location.state && location.state.source) {
            setIsAdHoc(true);
            setAdHocSource(location.state.source);
            setFormState(prev => ({
                ...prev,
                commentBS: location.state.reason ? `[${location.state.reason}] ` : ''
            }));
        }
    }, [location.state]);

    // Form State
    const [formState, setFormState] = useState({
        measuredValue: '',
        commentBS: '',
        technician: 'Amir H.'
    });
    const [validationError, setValidationError] = useState<string | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);

    const activeTask = tasks.find(t => t.id === selectedTask);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setProofImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const validateLive = (val: string) => {
        if (!activeTask) return;
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return;

        const result = validateEntry(activeTask.id, numVal);
        setValidationError(result.valid ? null : result.message);
    };

    const handleSubmit = () => {
        if (!activeTask || !proofImage) {
            alert("Proof of Work (Photo) is required!");
            return;
        }
        if (validationError) {
            alert("Cannot submit: Value out of tolerance.");
            return;
        }

        createLogEntry(activeTask.id, {
            taskId: activeTask.id,
            commentBS: formState.commentBS,
            technician: formState.technician,
            measuredValue: parseFloat(formState.measuredValue),
            proofImage: {
                id: 'IMG-' + Date.now(),
                componentId: activeTask.componentId,
                src: proofImage,
                description: formState.commentBS,
                aiTags: ['Maintenance', 'Repair'],
                metadata: { timestamp: new Date().toISOString(), gps: 'N/A' }
            }
        });

        setProofImage(null);
    };

    const handleAdHocSubmit = () => {
        if (!proofImage) {
            alert("Proof of Work (Photo) is required for ad-hoc logs!");
            return;
        }

        // For Ad-Hoc, we create a generic entry
        // In a real app, we might use a specific 'AD-HOC' task ID or a different create method
        // Here we simulate it by using a placeholder componentId

        createLogEntry('ADHOC-' + Date.now(), {
            taskId: 'ADHOC',
            commentBS: `[${adHocSource}] ${formState.commentBS}`,
            technician: formState.technician,
            measuredValue: parseFloat(formState.measuredValue) || 0,
            proofImage: {
                id: 'IMG-' + Date.now(),
                componentId: adHocSource, // Use the source as component ID
                src: proofImage,
                description: formState.commentBS,
                aiTags: ['Observation', 'Ad-Hoc'],
                metadata: { timestamp: new Date().toISOString(), gps: 'N/A' }
            }
        });

        setIsAdHoc(false);
        setAdHocSource('');
        setFormState({ measuredValue: '', commentBS: '', technician: 'Amir H.' });
        setProofImage(null);
    };

    return (
        <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#2dd4bf]" /> Maintenance Logbook
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

                {/* TASK LIST */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pending Tasks</h3>
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            onClick={() => task.status !== 'COMPLETED' && setSelectedTask(task.id)}
                            whileHover={{ scale: 1.01 }}
                            className={`p-4 rounded border cursor-pointer transition-colors ${task.status === 'COMPLETED'
                                ? 'bg-[#111] border-emerald-900/30 opacity-60'
                                : selectedTask === task.id
                                    ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]'
                                    : 'bg-[#121212] border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${task.priority === 'HIGH' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                                            }`}>{task.priority}</span>
                                        <span className="text-xs font-mono text-slate-500">{task.componentId}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white">{task.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                                </div>
                                {task.status === 'COMPLETED' ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-slate-500" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ACTION PANEL */}
                <div className="bg-[#121212] border border-white/5 rounded-lg p-6 h-fit sticky top-6">
                    <AnimatePresence mode="wait">
                        {isAdHoc ? (
                            <motion.div
                                key="adhoc-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="border-b border-amber-500/30 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-lg font-bold text-white">Log Observation</h3>
                                    </div>
                                    <p className="text-xs text-amber-500/80 font-mono">Source: {adHocSource}</p>
                                </div>

                                {/* Technician & Comment Only for Ad-Hoc (Simplified) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Description (Observation)</label>
                                    <textarea
                                        value={formState.commentBS}
                                        onChange={(e) => setFormState({ ...formState, commentBS: e.target.value })}
                                        className="w-full bg-[#050505] border border-white/10 rounded p-3 text-white h-32 text-sm focus:border-amber-500 transition-colors"
                                        placeholder="Describe the issue or observation..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Measured Value (Optional)</label>
                                    <input
                                        type="number"
                                        value={formState.measuredValue}
                                        onChange={(e) => setFormState({ ...formState, measuredValue: e.target.value })}
                                        className="w-full bg-[#050505] border border-white/10 rounded p-3 text-white font-mono"
                                        placeholder="e.g. 85.5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Proof of Work</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded border border-white/5 transition-colors">
                                            <Camera className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-bold text-white">Attach Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                        {proofImage && <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready</span>}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsAdHoc(false)}
                                        className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdHocSubmit}
                                        className="flex-[2] py-4 bg-amber-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-amber-500 transition-colors rounded"
                                    >
                                        Log Observation
                                    </button>
                                </div>
                            </motion.div>
                        ) : activeTask ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="border-b border-white/5 pb-4">
                                    <h3 className="text-lg font-bold text-white mb-1">Log Entry: {activeTask.id}</h3>
                                    <p className="text-xs text-slate-500">Enter field data to close this task.</p>
                                </div>

                                {/* Validation Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Measured Value ({activeTask.unit})</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formState.measuredValue}
                                            onChange={(e) => {
                                                setFormState({ ...formState, measuredValue: e.target.value });
                                                validateLive(e.target.value);
                                            }}
                                            className={`w-full bg-[#050505] border rounded p-3 text-white font-mono ${validationError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#2dd4bf]'
                                                }`}
                                            placeholder={`Max: ${activeTask.recommendedSpec}`}
                                        />
                                        {validationError && (
                                            <div className="absolute right-3 top-3 text-red-500">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    {validationError && (
                                        <p className="text-xs text-red-400 font-bold">{validationError}</p>
                                    )}
                                </div>

                                {/* Comment (Bosnian) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Technician Notes (BS)</label>
                                    <textarea
                                        value={formState.commentBS}
                                        onChange={(e) => setFormState({ ...formState, commentBS: e.target.value })}
                                        className="w-full bg-[#050505] border border-white/10 rounded p-3 text-white h-24 text-sm"
                                        placeholder="Opis izvršenih radova..."
                                    />
                                </div>

                                {/* Proof of Work */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Proof of Work</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded border border-white/5 transition-colors">
                                            <Camera className="w-4 h-4 text-[#2dd4bf]" />
                                            <span className="text-xs font-bold text-white">Take Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                        {proofImage && <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Image Loaded</span>}
                                    </div>
                                    {proofImage && (
                                        <div className="mt-2 rounded overflow-hidden border border-white/10 h-32 w-full bg-black relative">
                                            <img src={proofImage} alt="Proof" className="h-full w-full object-cover opacity-50" />
                                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[9px] text-white font-mono">
                                                GPS: 44.12N, 18.05E
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-[#2dd4bf] text-black font-bold text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors rounded"
                                >
                                    Submit & Close Task
                                </button>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full py-20 text-slate-600"
                            >
                                <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">Select a task to begin</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};
