
import React from 'react';
import { Smartphone, Layout, CheckCircle2 } from 'lucide-react';

interface InstallSectionProps {
  t: any;
  isRTL: boolean;
  deferredPrompt: any;
  handleInstallApp: () => void;
}

export const InstallSection: React.FC<InstallSectionProps> = ({
  t, isRTL, deferredPrompt, handleInstallApp
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner">
                <Smartphone size={24} />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">
                {t.installApp}
            </h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-bold">
            {isRTL 
                ? "قم بتثبيت التطبيق على جهازك للوصول السريع وتحسين الأداء، حتى بدون اتصال مستمر بالإنترنت." 
                : "Install the app on your device for quick access and improved performance, even without a constant internet connection."}
        </p>

        <div className="space-y-4">
            <button 
                onClick={handleInstallApp} 
                className="w-full py-5 bg-primary-600 text-white font-black rounded-[2rem] shadow-xl shadow-primary-500/30 transition-all duration-300 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-1"
            >
                <div className="flex items-center gap-3">
                    <Layout size={24} />
                    <span className="text-lg uppercase tracking-wider">{t.installApp}</span>
                </div>
                {!deferredPrompt && (
                    <span className="text-[10px] opacity-80 font-black uppercase tracking-tighter">
                        {isRTL ? "إرشادات التثبيت اليدوي" : "Manual Install Guide"}
                    </span>
                )}
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-400">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {isRTL ? "يدعم Android, iOS, Windows, macOS" : "Supports Android, iOS, Windows, macOS"}
                </span>
            </div>
        </div>
    </div>
  );
};
