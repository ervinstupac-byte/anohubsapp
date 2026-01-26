import React, { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PlantMapProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map, center]);
    return null;
};

export const PlantMap: React.FC<PlantMapProps> = ({ lat, lng, onLocationChange }) => {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const position = marker.getLatLng();
                    onLocationChange(position.lat, position.lng);
                }
            },
        }),
        [onLocationChange]
    );

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
            <MapContainer
                center={[lat, lng]}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#020617' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapController center={[lat, lng]} />
                <Marker
                    draggable={true}
                    eventHandlers={eventHandlers}
                    position={[lat, lng]}
                    ref={markerRef}
                />
            </MapContainer>

            {/* Tactical Overlay */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
                <span className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[9px] font-black text-cyan-400 px-2 py-1 rounded-sm uppercase tracking-widest shadow-neon">
                    Tactical Site Overwatch
                </span>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none bg-slate-950/80 backdrop-blur-md border border-white/10 p-2 rounded-lg">
                <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Live Coordinates</p>
                <div className="flex gap-3">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-slate-600 uppercase">Latitude</span>
                        <span className="text-[10px] text-white font-mono">{lat.toFixed(6)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[7px] text-slate-600 uppercase">Longitude</span>
                        <span className="text-[10px] text-white font-mono">{lng.toFixed(6)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
