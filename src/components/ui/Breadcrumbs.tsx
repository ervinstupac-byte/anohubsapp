import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-cyan-400 transition-colors">HUB</Link>
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return (
                    <React.Fragment key={to}>
                        <span className="opacity-30">/</span>
                        {last ? (
                            <span className="text-cyan-500">{value.replace(/-/g, ' ')}</span>
                        ) : (
                            <Link to={to} className="hover:text-cyan-400 transition-colors">
                                {value.replace(/-/g, ' ')}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
