import React from 'react';

export default function ConfirmModal({ title, message, open, onConfirm, onCancel }: { title: string; message: string; open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700 rounded p-6 w-full max-w-md text-slate-200">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-3 text-sm text-slate-300">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-1 bg-transparent border border-slate-700 rounded text-slate-300">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white">Confirm Backfill</button>
        </div>
      </div>
    </div>
  );
}
