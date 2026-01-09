
import React from 'react';
import { Layout, Minus, Plus, Moon, Sun, Globe, Palette, CheckCircle, BrainCircuit, Sparkles, CloudCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { THEMES } from '../../constants';
import { ClinicData, Language } from '../../types';

interface PreferencesSectionProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  deviceScale: number;
  setDeviceScale: (val: number) => void;
  adjustScale: (delta: number) => void;
  currentTheme: 'light' | 'dark';
  setLocalTheme: (theme: 'light' | 'dark') => void;
  currentLang: Language;
  setDeviceLang: (lang: Language) => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  isRTL: boolean;
  onUpdateSettings: (settings: Partial<ClinicData['settings']>) => Promise<void>;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  t, deviceScale, setDeviceScale, adjustScale, currentTheme, setLocalTheme, currentLang, setDeviceLang, activeThemeId, setActiveThemeId, isRTL
}) => {
  const toggleThemeMode = () => {
    setLocalTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="space-y-8 relative">
       {/* 1. App Preferences Section */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl border-b border-gray-100 dark:border-gray-700 pb-3 uppercase tracking-tight">{t.preferences}</h3>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Layout size={20} /></div>
                  <span className="font-black text-gray-800 dark:text-white text-lg">{t.appScale}</span>
                  <span className="ms-auto font-mono text-primary-600 font-black text-xl">{deviceScale}%</span>
              </div>
              <div className="flex items-center gap-6">
                  <button onClick={() => adjustScale(-5)} className="p-4 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-red-50 text-gray-600 dark:text-white transition active:scale-90"><Minus size={24} /></button>
                  <input type="range" min="80" max="150" step="5" value={deviceScale} onChange={(e) => setDeviceScale(parseInt(e.target.value))} className="flex-1 accent-primary-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                  <button onClick={() => adjustScale(5)} className="p-4 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-green-50 text-gray-600 dark:text-white transition active:scale-90"><Plus size={24} /></button>
              </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shadow-inner"><Moon size={20} /></div>
                      <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.darkMode}</span>
                  </div>
                  <button onClick={toggleThemeMode} className={`w-16 h-10 rounded-full p-1.5 transition-all duration-500 flex items-center ${currentTheme === 'dark' ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start shadow-inner'}`}><div className="w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700 transform transition-transform duration-500">{currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</div></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-gray-600 pt-6 gap-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner"><Globe size={20} /></div>
                      <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.language}</span>
                  </div>
                  <div className="flex bg-white dark:bg-gray-700 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-600 shadow-inner">{(['en', 'ar', 'ku'] as const).map(lang => (<button key={lang} onClick={() => setDeviceLang(lang)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${currentLang === lang ? 'bg-primary-600 shadow-lg text-white' : 'text-gray-500 hover:text-gray-900'}`}>{lang.toUpperCase()}</button>))}</div>
              </div>
          </div>
       </div>

       {/* AI Section Anchor */}
       <div id="ai-section-anchor" className="scroll-mt-20"></div>

       {/* 2. AI Status Section - Cleaned up to only show "Active" status */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-8 relative overflow-hidden">
          <Sparkles className="absolute top-8 end-8 text-indigo-100 dark:text-indigo-900 opacity-50" size={80} />
          
          <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg"><BrainCircuit size={28} /></div>
              <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.aiAssistant}</h3>
          </div>

          <div className="space-y-6">
              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-800 flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-inner">
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-xl shrink-0 group hover:rotate-6 transition-transform">
                      <ShieldCheck size={42} className="text-indigo-600" />
                  </div>
                  <div className="text-center md:text-start flex-1">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">{isRTL ? "مفعل" : "Active"}</span>
                        <h4 className="font-black text-indigo-900 dark:text-indigo-100 text-xl">{isRTL ? "الذكاء الاصطناعي مفعل" : "AI Intelligence Enabled"}</h4>
                      </div>
                      <p className="text-sm text-indigo-600/80 dark:text-indigo-300 font-bold leading-relaxed max-w-md">
                        {isRTL 
                          ? "تم تفعيل نظام Dentro AI الخاص بك وتأمينه بالكامل. يمكنك الآن استخدامه مباشرة من ملفات المرضى للحصول على رؤى سريرية ذكية." 
                          : "Your Dentro AI system is fully activated and secured. You can now access it directly from patient files for smart clinical insights."}
                      </p>
                  </div>
                  <div className="hidden lg:block p-4">
                      <CloudCheck size={48} className="text-indigo-200 dark:text-indigo-800" />
                  </div>
              </div>
          </div>
       </div>

       {/* 3. Themes Grid Section */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Palette size={20} /></div>
              <h3 className="font-black text-gray-800 dark:text-white text-lg uppercase tracking-tight">{t.appTheme}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {THEMES.map(theme => (
                  <button key={theme.id} onClick={() => setActiveThemeId(theme.id)} className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeThemeId === theme.id ? 'border-primary-500 bg-white dark:bg-gray-600 shadow-xl scale-105' : 'border-transparent bg-gray-100/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'}`}>
                      <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primary }}></div>
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.secondary }}></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-none">
                          {isRTL ? (currentLang === 'ku' ? theme.nameKu : theme.nameAr) : theme.nameEn}
                      </span>
                      {activeThemeId === theme.id && <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800"><CheckCircle size={14} /></div>}
                  </button>
              ))}
          </div>
       </div>
    </div>
  );
};
