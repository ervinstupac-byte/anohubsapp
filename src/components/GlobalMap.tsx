import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BackButton } from './BackButton.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import type { Asset } from '../types.ts';
import L from 'leaflet';

// Fix za Leaflet ikone
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- SUB-COMPONENT: MAP CLICK HANDLER ---
// Omogućuje zumiranje na novododane točke
const MapRecenter: React.FC<{ lat: number, lng: number }> = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

export const GlobalMap: React.FC = () => {
    const { showToast } = useToast();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newAsset, setNewAsset] = useState({
        name: '',
        power_output: '',
        lat: '',
        lng: '',
        type: 'Francis',
        status: 'Operational'
    });

    // --- FETCH ASSETS ---
    const fetchAssets = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('assets').select('*');
        if (error) {
            console.error('Error loading assets:', error);
            showToast('Failed to load global assets.', 'error');
        } else {
            setAssets(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    // --- ADD ASSET ---
    const handleAddAsset = async () => {
        if (!newAsset.name || !newAsset.lat || !newAsset.lng) {
            showToast('Please fill in Name and Coordinates.', 'warning');
            return;
        }

        const payload = {
            ...newAsset,
            lat: parseFloat(newAsset.lat),
            lng: parseFloat(newAsset.lng)
        };

        const { error } = await supabase.from('assets').insert([payload]);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('New Asset commissioned successfully.', 'success');
            setIsAddModalOpen(false);
            setNewAsset({ name: '', power_output: '', lat: '', lng: '', type: 'Francis', status: 'Operational' }); // Reset
            fetchAssets(); // Refresh map
        }
    };

    // Calculate Stats
    const stats = {
        total: assets.length,
        critical: assets.filter(a => a.status === 'Critical').length,
        power: assets.reduce((acc, curr) => acc + (parseInt(curr.power_output) || 0), 0)
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
            
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-4">
                    <BackButton text="Hub" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Global Asset Map</h2>
                        <p className="text-xs text-slate-400"> fleet status: <span className="text-green-400 font-mono">LIVE</span></p>
                    </div>
                </div>

                <div className="flex gap-4 text-xs font-mono text-slate-300">
                    <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                        PLANTS: <span className="text-white font-bold">{stats.total}</span>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                        CRITICAL: <span className="text-red-400 font-bold animate-pulse">{stats.critical}</span>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 hidden sm:block">
                        TOTAL MW: <span className="text-cyan-400 font-bold">{stats.power.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Add Asset
                </button>
            </div>

            {/* MAP CONTAINER */}
            <div className="flex-grow rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center">
                        <div className="text-cyan-400 font-mono animate-pulse">Establishing Satellite Uplink...</div>
                    </div>
                )}
                
                <MapContainer 
                    center={[20, 0]} 
                    zoom={2} 
                    scrollWheelZoom={true} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {assets.map(asset => (
                        <Marker key={asset.id} position={[asset.lat, asset.lng]}>
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-800 text-sm">{asset.name}</h3>
                                        <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600">{asset.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mt-1">Output: {asset.power_output}</p>
                                    
                                    <div className={`text-xs font-bold mt-2 px-2 py-1 rounded text-white text-center uppercase ${
                                        asset.status === 'Critical' ? 'bg-red-500' :
                                        asset.status === 'Warning' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}>
                                        {asset.status}
                                    </div>
                                    
                                    <button className="mt-2 w-full bg-slate-800 text-white text-[10px] py-1.5 rounded hover:bg-slate-700 transition-colors">
                                        Open Dashboard
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* ADD ASSET MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] animate-fade-in p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-600 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>📍</span> Commission New Asset
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plant Name</label>
                                <input type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="e.g. HPP Iron Gate II" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Latitude</label>
                                    <input type="number" value={newAsset.lat} onChange={e => setNewAsset({...newAsset, lat: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="44.67" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Longitude</label>
                                    <input type="number" value={newAsset.lng} onChange={e => setNewAsset({...newAsset, lng: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="22.53" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Power Output</label>
                                    <input type="text" value={newAsset.power_output} onChange={e => setNewAsset({...newAsset, power_output: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="120 MW" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Turbine Type</label>
                                    <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                                        <option>Francis</option>
                                        <option>Kaplan</option>
                                        <option>Pelton</option>
                                        <option>Pumped Storage</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Initial Status</label>
                                <select value={newAsset.status} onChange={e => setNewAsset({...newAsset, status: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                                    <option value="Operational">Operational (Green)</option>
                                    <option value="Warning">Warning (Yellow)</option>
                                    <option value="Critical">Critical (Red)</option>
                                    <option value="Offline">Offline (Grey)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-700 pt-4">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleAddAsset} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1">
                                Confirm & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};