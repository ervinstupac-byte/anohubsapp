import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // <--- IMPORT
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { BackButton } from './BackButton.tsx';

export const UserProfile: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation(); // <--- HOOK
    
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
    }, [user]);

    // Update Profile
    const updateProfile = async () => {
        try {
            setSaving(true);
            if (!user) throw new Error(t('profile.noUser'));

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
                avatar_url: data.publicUrl
            });

            if (updateError) throw updateError;

            showToast(t('profile.avatarSuccess'), 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">{t('profile.loading')}</div>;

    return (
        <div className="animate-fade-in pb-12 max-w-4xl mx-auto space-y-8">
            <BackButton text={t('profile.back')} />

            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {t('profile.title').split(' ')[0]} <span className="text-cyan-400">{t('profile.title').split(' ')[1]}</span>
                </h2>
                <p className="text-slate-400">{t('profile.subtitle')}</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* AVATAR SECTION */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-900 shadow-xl">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">👷</div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-xs font-bold text-white">
                                {t('profile.changePhoto')}
                                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={saving} />
                            </label>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-slate-500 font-mono">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-cyan-900/30 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/30">
                                {role || t('profile.unassignedRole')}
                            </span>
                        </div>
                    </div>

                    {/* DETAILS FORM */}
                    <div className="flex-grow w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('profile.fullName')}</label>
                                <input 
                                    type="text" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('profile.role')}</label>
                                <input 
                                    type="text" 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" 
                                    placeholder={t('profile.rolePlaceholder')}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('profile.company')}</label>
                                <input 
                                    type="text" 
                                    value={company} 
                                    onChange={(e) => setCompany(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" 
                                    placeholder={t('profile.companyPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-700/50 flex justify-end">
                            <button 
                                onClick={updateProfile} 
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                            >
                                {saving ? t('profile.saving') : t('profile.saveButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};