
import React from 'react';
import { FileText, Settings, Printer } from 'lucide-react';
import { Patient, ClinicData } from '../../types';

interface DocumentsSectionProps {
  t: any;
  data: ClinicData;
  openDocSettings: (type: 'consent' | 'instructions') => void;
  handleQuickPrint: (type: 'consent' | 'instructions') => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ t, data, openDocSettings, handleQuickPrint }) => {
  return (
    <div className="animate-fade-in space-y-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> <FileText className="text-primary-500" /> {t.documents} </h3>
        
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 md:p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-bl-2xl">{t.paperSizeA4}</div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="flex items-center gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-600 group-hover:rotate-6 transition-transform"><FileText size={32} /></div>
                      <div>
                          <h4 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{t.consentForm}</h4>
                          <p className="text-xs text-gray-400 font-medium uppercase mt-1 tracking-wider">A4 Standard Format</p>
                      </div>
                 </div>
                 <div className="flex gap-3">
                     <button onClick={() => openDocSettings('consent')} className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-50 transition shadow-sm"><Settings size={18} /><span>{t.settings}</span></button>
                     <button onClick={() => handleQuickPrint('consent')} className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition transform hover:-translate-y-0.5 active:scale-95"><Printer size={20} /><span>{t.print}</span></button>
                 </div>
             </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 md:p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-bl-2xl">{t.paperSizeA5}</div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="flex items-center gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-purple-600 group-hover:rotate-6 transition-transform"><FileText size={32} /></div>
                      <div>
                          <h4 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{t.patientInstructions}</h4>
                          <p className="text-xs text-gray-400 font-medium uppercase mt-1 tracking-wider">A5 Small Format</p>
                      </div>
                 </div>
                 <div className="flex gap-3">
                     <button onClick={() => openDocSettings('instructions')} className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-50 transition shadow-sm"><Settings size={18} /><span>{t.settings}</span></button>
                     <button onClick={() => handleQuickPrint('instructions')} className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition transform hover:-translate-y-0.5 active:scale-95"><Printer size={20} /><span>{t.print}</span></button>
                 </div>
             </div>
        </div>
    </div>
  );
};
