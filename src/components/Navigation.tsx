import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useSheet } from '../services/SheetContext';
import { DownloadDocButton } from './DownloadDocButton';

export function Navigation() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { sheetId, subjects, selectedSubject, setSelectedSubject } = useSheet();

  const navItems = [
    { name: '測驗 / Quiz', path: '/' },
    { name: '申論 / Essay', path: '/essay' },
    { name: '讀(測) / Read Q', path: '/read' },
    { name: '讀(申) / Read E', path: '/read-essay' },
    { name: '語音 / Audio', path: '/audio' },
    { name: '出題 / Exam', path: '/exam' },
  ];

  return (
    <>
      <header className="px-6 py-6 md:px-12 md:pb-6 md:pt-10 flex flex-col md:flex-row justify-between md:align-bottom md:items-end border-b border-border-line gap-6 sticky top-0 bg-bg z-40">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-text-main">
              Archive.AI
            </div>
            <DownloadDocButton />
          </div>
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">
            ● Syncing: {sheetId ? 'Custom Sheet' : 'Demo Mode'}
          </div>
          
          {subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-text-dim">Subject:</span>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-bg border-2 border-text-main text-text-main text-sm font-bold uppercase tracking-wider px-2 py-1 outline-none cursor-pointer hover:bg-surface"
              >
                <option value="ALL">ALL / 全部</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex flex-wrap gap-2 border-border-line">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 border-2 text-sm font-bold uppercase cursor-pointer transition-colors ${
                    isActive 
                      ? 'border-text-main bg-text-main text-bg' 
                      : 'border-text-main text-text-main hover:bg-surface'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 border-2 border-text-main text-text-main hover:bg-surface transition flex items-center justify-center my-auto aspect-square h-[40px]"
            title="設定題庫"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
