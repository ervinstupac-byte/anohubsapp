// Knowledge Capture Panel - UI Component
// Allows engineers to document their 15+ years of experience

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, Lightbulb, Award, ThumbsUp, Eye } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { InstitutionalKnowledgeService, ExpertKnowledgeEntry, KnowledgeSearchResult } from '../services/InstitutionalKnowledgeService';
import { useAssetContext } from '../contexts/AssetContext';

export const KnowledgeCapturePanel: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const [activeTab, setActiveTab] = useState<'SUBMIT' | 'SEARCH' | 'LEADERBOARD'>('SUBMIT');

    // Submit form state
    const [incidentPattern, setIncidentPattern] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [rootCause, setRootCause] = useState('');
    const [solution, setSolution] = useState('');
    const [warStory, setWarStory] = useState('');
    const [lessonLearned, setLessonLearned] = useState('');
    const [preventiveMeasures, setPreventiveMeasures] = useState('');

    // Search state
    const [searchSymptoms, setSearchSymptoms] = useState('');
    const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAsset) {
            alert('Please select an asset first');
            return;
        }

        const asset = selectedAsset as any;
        await InstitutionalKnowledgeService.submitKnowledge(
            'current-user-id', // In production: get from auth context
            'Current User',
            {
                incidentPattern,
                turbineFamily: asset.turbine_family,
                turbineVariant: asset.turbine_variant,
                symptoms: parseSymptoms(symptoms),
                rootCause,
                solution,
                fieldNotes: warStory,
                lessonLearned,
                preventiveMeasures: preventiveMeasures.split('\n').filter(m => m.trim()),
                relatedForensicRecordings: [],
                relatedInterlockEvents: [],
                tags: extractTags(incidentPattern + ' ' + symptoms)
            }
        );

        // Clear form
        setIncidentPattern('');
        setSymptoms('');
        setRootCause('');
        setSolution('');
        setWarStory('');
        setLessonLearned('');
        setPreventiveMeasures('');

        alert('✅ Knowledge entry submitted! Thank you for preserving your expertise.');
    };

    const handleSearch = async () => {
        const symptomList = searchSymptoms.split(',').map(s => s.trim()).filter(s => s);
        const results = await InstitutionalKnowledgeService.searchBySymptoms(
            symptomList,
            (selectedAsset as any)?.turbine_family
        );
        setSearchResults(results);
    };

    return (
        <GlassCard className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Institutional</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 ml-2">
                        Knowledge Base
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    Your 15+ years of field experience is invaluable. Share it with the next generation.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <TabButton
                    icon={BookOpen}
                    label="Submit Knowledge"
                    active={activeTab === 'SUBMIT'}
                    onClick={() => setActiveTab('SUBMIT')}
                />
                <TabButton
                    icon={Eye}
                    label="Search Knowledge"
                    active={activeTab === 'SEARCH'}
                    onClick={() => setActiveTab('SEARCH')}
                />
                <TabButton
                    icon={Award}
                    label="Leaderboard"
                    active={activeTab === 'LEADERBOARD'}
                    onClick={() => setActiveTab('LEADERBOARD')}
                />
            </div>

            {/* Content */}
            {activeTab === 'SUBMIT' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Incident Pattern"
                        placeholder="e.g., 'Kaplan horizontal hydraulic runaway after pipe replacement'"
                        value={incidentPattern}
                        onChange={setIncidentPattern}
                        required
                    />

                    <FormField
                        label="Symptoms (comma-separated)"
                        placeholder="e.g., 'servo pressure spike, loud bang, hose rupture'"
                        value={symptoms}
                        onChange={setSymptoms}
                        rows={2}
                    />

                    <FormField
                        label="Root Cause"
                        placeholder="What was the ACTUAL problem? (e.g., '12mm hose replaced with 16mm without system validation')"
                        value={rootCause}
                        onChange={setRootCause}
                        rows={3}
                        required
                    />

                    <FormField
                        label="Solution"
                        placeholder="How did you fix it? (step-by-step if possible)"
                        value={solution}
                        onChange={setSolution}
                        rows={4}
                        required
                    />

                    <FormField
                        label="The War Story 📖"
                        placeholder="Tell the story - What happened at 3am? How did you solve it? What would you tell your younger self?"
                        value={warStory}
                        onChange={setWarStory}
                        rows={6}
                        icon={Lightbulb}
                    />

                    <FormField
                        label="Lesson Learned"
                        placeholder="The one thing everyone should remember from this incident"
                        value={lessonLearned}
                        onChange={setLessonLearned}
                        rows={2}
                    />

                    <FormField
                        label="Preventive Measures (one per line)"
                        placeholder="1. Install safety interlock&#10;2. Train technicians on hydraulic physics&#10;3. Stock correct parts"
                        value={preventiveMeasures}
                        onChange={setPreventiveMeasures}
                        rows={4}
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                    >
                        <BookOpen className="w-5 h-5" />
                        Submit to Institutional Memory
                    </motion.button>

                    <p className="text-xs text-slate-500 text-center">
                        Your submission will be verified by the engineering community. High-quality entries earn reputation points!
                    </p>
                </form>
            )}

            {activeTab === 'SEARCH' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchSymptoms}
                            onChange={(e) => setSearchSymptoms(e.target.value)}
                            placeholder="Enter symptoms (comma-separated): pressure spike, loud bang, ..."
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSearch}
                            className="px-6 py-3 bg-amber-500 rounded-lg font-bold text-white"
                        >
                            Search
                        </motion.button>
                    </div>

                    {searchResults.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.map((result, index) => (
                                <KnowledgeCard key={index} result={result} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Enter symptoms to search the knowledge base</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'LEADERBOARD' && (
                <div className="text-center py-12 text-slate-500">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Leaderboard coming soon...</p>
                    <p className="text-xs mt-2">Top contributors will be recognized here</p>
                </div>
            )}
        </GlassCard>
    );
};

// ===== HELPER COMPONENTS =====

interface TabButtonProps {
    icon: React.ComponentType<any>;
    label: string;
    active: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, active, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${active
            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
            : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </motion.button>
);

interface FormFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    required?: boolean;
    icon?: React.ComponentType<any>;
}

const FormField: React.FC<FormFieldProps> = ({ label, placeholder, value, onChange, rows, required, icon: Icon }) => (
    <div>
        <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-amber-400" />}
            {label}
            {required && <span className="text-red-400">*</span>}
        </label>
        {rows ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
        )}
    </div>
);

const KnowledgeCard: React.FC<{ result: KnowledgeSearchResult }> = ({ result }) => {
    const { entry, relevanceScore } = result;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-800/30 border border-amber-500/30 rounded-lg"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{entry.incidentPattern}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                            {entry.turbineFamily.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {entry.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {entry.viewCount}
                        </span>
                        <span>Confidence: {(entry.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-amber-400">{(relevanceScore * 100).toFixed(0)}%</div>
                    <div className="text-xs text-slate-500">Match</div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Root Cause:</p>
                    <p className="text-slate-300">{entry.rootCause}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Solution:</p>
                    <p className="text-slate-300">{entry.solution}</p>
                </div>
                {entry.fieldNotes && (
                    <div className="p-3 bg-amber-950/20 border-l-4 border-amber-500 rounded">
                        <p className="text-xs text-amber-400 uppercase font-bold mb-1 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            War Story
                        </p>
                        <p className="text-sm text-slate-300 italic">{entry.fieldNotes}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ===== HELPER FUNCTIONS =====

function parseSymptoms(symptomsText: string): Record<string, any> {
    const symptoms: Record<string, any> = {};
    symptomsText.split(',').forEach(symptom => {
        const key = symptom.trim().toLowerCase().replace(/\s+/g, '_');
        if (key) symptoms[key] = true;
    });
    return symptoms;
}

function extractTags(text: string): string[] {
    const keywords = ['hydraulic', 'runaway', 'kaplan', 'francis', 'pelton', 'cavitation', 'vortex', 'bearing', 'vibration', 'pressure', 'critical'];
    const tags: string[] = [];

    const lowerText = text.toLowerCase();
    keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            tags.push(keyword);
        }
    });

    return [...new Set(tags)]; // Remove duplicates
}
