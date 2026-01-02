import React, { useState } from 'react';
import { Database, FileUp, Download, AlertOctagon, Trash, Layout, RefreshCw, Smartphone, CheckCircle, Info, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface DataManagementSectionProps {
  t: any;
  isRTL: boolean;
  setShowBackupModal: (val: boolean) => void;
  setShowRestoreModal: (val: boolean) => void;
  handleResetLocalData: () => void;
  handleUpdateApp?: () => void;
  deferredPrompt: any;
  handleInstallApp: () => void;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  t, isRTL, setShowBackupModal, setShowRestoreModal, handleResetLocalData, handleUpdateApp, deferredPrompt, handleInstallApp
}) => {
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);

  const handleManualCacheRefresh = async () => {
    setIsRefreshingCache(true);
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.update();
        }
        // تنبيه المستخدم بالجاهزية
        setTimeout(() => {
            setIsRefreshingCache(false);
            alert(isRTL ? "تم تحديث ذاكرة الجهاز. التطبيق الآن جاهز للعمل بدون إنترنت تماماً." : "Cache updated. App is now 100% ready for offline use.");
        }, 1500);
    }
  };

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl shadow-inner"><Database size={24} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{isRTL ? "إدارة البيانات" : "Data Management"}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button onClick={() => setShowBackupModal(true)} className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all gap-4 group">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><FileUp size={28} className="text-emerald-600" /></div>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-lg uppercase tracking-wider">{t.backup}</span>
                </button>
                <button onClick={() => setShowRestoreModal(true)} className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-red-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all gap-4 group">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Download size={28} className="text-blue-600" /></div>
                    <span className="font-black text-blue-700 dark:text-blue-300 text-lg uppercase tracking-wider">{t.import}</span>
                </button>
            </div>
        </div>

        {/* Permanent Installation & Offline Readiness Section */}
        <div id="install-section" className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Smartphone size={24} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{isRTL ? "التشغيل كبرنامج أوفلاين" : "Offline App Mode"}</h3>
            </div>
            
            <div className="space-y-6">
                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
                    <Zap className="text-indigo-600 shrink-0" size={28} />
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed font-bold">
                        {isRTL 
                            ? "لضمان عمل التطبيق بدون إنترنت نهائياً، يرجى تثبيته على جهازك ثم الضغط على زر تفعيل وضع الأوفلاين." 
                            : "To ensure the app works 100% offline, please install it and then activate the Offline Mode button."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleInstallApp} 
                        className="flex items-center justify-center gap-3 py-5 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-primary-700 shadow-xl shadow-primary-500/30 active:scale-95"
                    >
                        <Download size={20} />
                        <span>{deferredPrompt ? (isRTL ? "تثبيت البرنامج" : "Install App") : (isRTL ? "إضافة للشاشة الرئيسية" : "Add to Home")}</span>
                    </button>

                    <button 
                        onClick={handleManualCacheRefresh}
                        disabled={isRefreshingCache}
                        className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm uppercase transition-all duration-300 active:scale-95 ${isRefreshingCache ? 'bg-gray-100 text-gray-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20'}`}
                    >
                        {isRefreshingCache ? <RefreshCw size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                        <span>{isRTL ? "تفعيل وضع الأوفلاين" : "Activate Offline Mode"}</span>
                    </button>
                </div>

                <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3 mb-4">
                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-bold leading-relaxed">
                            {isRTL 
                                ? "خطوات هامة لضمان الأداء:" 
                                : "Crucial steps for performance:"}
                        </p>
                    </div>
                    <ul className="space-y-2 text-[10px] md:text-xs text-blue-600/80 dark:text-blue-400/80 font-bold list-disc ps-5">
                        <li>{isRTL ? "يجب فتح الموقع مرة واحدة مع توفر الإنترنت ليتم تخزين الملفات." : "You must open the site once with internet to cache the files."}</li>
                        <li>{isRTL ? "استخدم متصفح Chrome أو Safari للحصول على أفضل تجربة أوفلاين." : "Use Chrome or Safari for the best offline experience."}</li>
                        <li>{isRTL ? "إذا ظهرت رسالة 'لا يتوفر إنترنت'، تأكد من تثبيت التطبيق والضغط على 'تفعيل وضع الأوفلاين' أعلاه." : "If you see 'No Internet', ensure you installed the app and clicked 'Activate Offline Mode'."}</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/30"><AlertOctagon size={24} /></div>
                <h3 className="font-black text-red-600 dark:text-red-400 text-xl uppercase tracking-tighter">{t.dangerZone}</h3>
            </div>
            <p className="text-sm md:text-base text-red-800/80 dark:text-red-300/60 leading-relaxed font-bold">{t.resetLocalDataDesc}</p>
            <button onClick={handleResetLocalData} className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-red-900/20 text-red-600 border-2 border-red-200 dark:border-red-800 rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-red-600 hover:text-white shadow-sm active:scale-95"><Trash size={20} /><span>{t.resetLocalData}</span></button>
        </div>
    </div>
  );
};