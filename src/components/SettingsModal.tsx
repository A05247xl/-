import React, { useState } from 'react';
import { useSheet } from '../services/SheetContext';
import { Settings } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sheetId, setSheetId } = useSheet();
  const [inputId, setInputId] = useState(sheetId);

  if (!isOpen) return null;

  const handleSave = () => {
    setSheetId(inputId.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg border-4 border-text-main w-full max-w-md overflow-hidden p-8 shadow-[8px_8px_0px_0px_rgba(225,255,0,1)]">
        <div className="flex items-center gap-4 mb-6 border-b-2 border-border-line pb-4">
          <Settings className="w-8 h-8 text-accent" />
          <h2 className="text-2xl font-black uppercase tracking-widest text-text-main">DB Config</h2>
        </div>
        
        <div className="space-y-6">
          <p className="text-text-dim text-sm font-mono leading-relaxed">
            INPUT GOOGLE SHEETS ID BELOW. DATASOURCE MUST BE PROVISIONED AS "ANYONE WITH LINK CAN VIEW".
            LEAVE BLANK FOR DEMO_MODE.
          </p>
          
          <div>
            <label htmlFor="sheetId" className="block text-sm font-bold uppercase tracking-widest text-text-main mb-2">
              &gt; SHEET_ID
            </label>
            <input
              type="text"
              id="sheetId"
              className="w-full px-4 py-3 bg-surface border-2 border-border-line text-text-main font-mono focus:border-accent focus:outline-none transition-colors"
              placeholder="1BxiMVs..."
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-4 pt-4 border-t-2 border-border-line">
          <button 
            onClick={onClose}
            className="px-6 py-3 border-2 border-text-main text-text-main uppercase font-bold text-sm hover:bg-surface transition"
          >
            Abort
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-accent text-bg border-2 border-accent uppercase font-bold text-sm hover:opacity-80 transition"
          >
            Commit
          </button>
        </div>
      </div>
    </div>
  );
}
