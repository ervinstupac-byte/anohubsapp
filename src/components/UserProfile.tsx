import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const UserProfile: React.FC = () => {
    const { user, isGuest } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Fetch Profile
    useEffect(() => {
        const getProfile = async () => {
            try {
                if (!user) return;

                // Use user_metadata for guest mode
                if (isGuest) {
                    setFullName(user.user_metadata?.full_name || 'Guest Engineer');
                    setRole('Guest');
                    setCompany('Demo Mode');
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    setFullName(data.full_name || '');
                    setRole(data.role || '');
                    setCompany(data.company || '');
                    setAvatarUrl(data.avatar_url || '');
                }
            } catch (error: any) {
                console.error('Error loading profile:', error.message);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [user, isGuest]);

    // Update Profile
    const updateProfile = async () => {
        try {
            setSaving(true);
            if (!user) throw new Error(t('profile.noUser'));

            // Don't save if guest mode
            if (isGuest) {
                showToast(t('profile.guestSaveWarning'), 'warning');
                return;
            }

            const updates = {
                id: user.id,
                full_name: fullName,
                role,
                company,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            showToast(t('profile.updateSuccess'), 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Avatar Upload Handler
    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setSaving(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(t('profile.uploadError'));
            }

            if (isGuest) {
                showToast(t('profile.guestSaveWarning'), 'warning');
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);

            const { error: updateError } = await supabase.from('profiles').upsert({
                id: user?.id,
                avatar_url: data.publicUrl,
                updated_at: new Date().toISOString()
            });

            if (updateError) throw updateError;

            showToast(t('profile.avatarSuccess'), 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin text-4xl text-cyan-500">⚙️</div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-12 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center pt-6">
                <BackButton text={t('profile.back')} />
                <div className="flex gap-2">
                    {isGuest && (
                        <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-900/30 text-amber-400 border border-amber-500/20">
                            👤 GUEST MODE
                        </span>
                    )}
                    <div className="text-xs font-mono text-slate-500 border border-slate-800 px-3 py-1 rounded-full">
                        ID: {user?.id?.slice(0, 8)}...
                    </div>
                </div>
            </div>

            <div className="text-center space-y-2 mb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                    {t('profile.title', 'Engineer Profile').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('profile.title', 'Engineer Profile').split(' ')[1]}</span>
                </h2>
                <p className="text-slate-400 font-medium">{t('profile.subtitle', 'Manage your identity and access levels.')}</p>
            </div>

            <GlassCard className="p-0 overflow-hidden border-t-4 border-t-cyan-500">
                <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-10 items-start">

                        {/* LEFT COLUMN: AVATAR */}
                        <div className="flex flex-col items-center gap-6 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0 md:pr-8">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 ring-1 ring-white/10 relative">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
                                            👷
                                        </div>
                                    )}
                                </div>

                                {/* Upload Button Overlay */}
                                <label className="absolute bottom-2 right-2 p-3 rounded-full bg-cyan-600 text-white shadow-lg cursor-pointer hover:bg-cyan-500 transition-all hover:scale-110 active:scale-95 border border-cyan-400/50 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={saving || isGuest} />
                                </label>
                            </div>

                            <div className="text-center w-full">
                                <p className="text-xs text-slate-500 font-mono mb-2 truncate max-w-[200px] mx-auto bg-slate-950/50 py-1 px-2 rounded">{user?.email}</p>
                                <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full border ${role ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                    {role || t('profile.unassignedRole', 'Unassigned Role')}
                                </span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FORM */}
                        <div className="flex-grow w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ModernInput
                                    label={t('profile.fullName', 'Full Name')}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={t('profile.fullNamePlaceholder', 'e.g. John Doe')}
                                    fullWidth
                                />

                                <ModernInput
                                    label={t('profile.role', 'Position / Role')}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder={t('profile.rolePlaceholder', 'e.g. Lead Engineer')}
                                    fullWidth
                                />

                                <div className="md:col-span-2">
                                    <ModernInput
                                        label={t('profile.company', 'Organization')}
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder={t('profile.companyPlaceholder', 'e.g. Global Hydropower Inc.')}
                                        fullWidth
                                        icon={<span>🏢</span>}
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex justify-end">
                                <ModernButton
                                    onClick={updateProfile}
                                    isLoading={saving}
                                    variant="primary"
                                    className="px-8 shadow-cyan-500/20"
                                    icon={<span>💾</span>}
                                >
                                    {t('profile.saveButton', 'Save Changes')}
                                </ModernButton>
                            </div>
                        </div>
                    </div>

                    {/* Developer/Admin Tools Section */}
                    <div className="mt-8 p-6 border-t border-white/5 bg-slate-950/30">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span>⚙️</span> {t('profile.developerTools')}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            {t('profile.resetDataDesc')}
                        </p>
                        <button
                            onClick={() => {
                                if (confirm(t('profile.resetDataConfirm'))) {
                                    const { resetDemoData } = require('../utils/demoSeeder');
                                    resetDemoData();
                                    window.location.reload();
                                }
                            }}
                            className="px-4 py-2 bg-amber-500/20 border-2 border-amber-500/50 rounded-lg text-amber-400 hover:bg-amber-500/30 hover:border-amber-500/70 transition-all text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-900/20"
                        >
                            <span>🔄</span> {t('profile.resetData')}
                        </button>
                    </div>
                </div>
            </GlassCard >
        </div >
    );
};
// Uklonjen dupli eksport na dnu fajla.