
import React from 'react';
import { Cloud, Link, CheckCircle2, HardDriveUpload, RefreshCw, Files } from 'lucide-react';
import { ClinicData } from '../../types';

interface SyncSectionProps {
  t: any;
  data: ClinicData;
  isAdmin: boolean;
  isRTL: boolean;
  onLinkDrive: () => void;
  handleBulkSyncToDrive: () => void;
  isBulkSyncing: boolean;
  bulkSyncProgress: string;
  unsyncedCount: number;
}

export const SyncSection: React.FC<SyncSectionProps> = ({
  t, data, isAdmin, isRTL, onLinkDrive, handleBulkSyncToDrive, isBulkSyncing, bulkSyncProgress, unsyncedCount
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
       <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl border-b border-gray-100 dark:border-gray-700 pb-3 uppercase tracking-tight">{t.cloudSync}</h3>
       
       <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-2xl shadow-inner"><Cloud size={24} /></div>
              <div>
                  <h4 className="font-black text-gray-800 dark:text-white text-lg">{t.googleDriveStatus}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">{data.settings.googleDriveLinked ? t.linked : t.notLinked}</p>
              </div>
          </div>
          {!data.settings.googleDriveLinked ? (
              isAdmin && <button onClick={onLinkDrive} className="w-full py-4 bg-white dark:bg-gray-600 border-2 border-primary-200 text-primary-600 font-black rounded-2xl hover:bg-primary-50 transition flex items-center justify-center gap-2 shadow-sm"><Link size={20} />{t.googleDriveConnect}</button>
          ) : (
              <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl border border-green-100 dark:border-green-800"><CheckCircle2 size={20} /><span className="text-sm font-black">{isRTL ? "تم تفعيل التخزين السحابي للعيادة" : "Cloud Storage Active"}</span></div>
              </div>
          )}
       </div>

       {data.settings.googleDriveLinked && (
           <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-800 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md text-orange-600"><HardDriveUpload size={32} /></div>
                      <div>
                          <h4 className="font-black text-orange-900 dark:text-orange-100 text-lg">{t.syncLocalFiles}</h4>
                          <p className="text-xs text-orange-600 font-bold">{isRTL ? `يوجد ${unsyncedCount} صورة ورسم ينتظر الرفع` : `${unsyncedCount} local items waiting for upload`}</p>
                      </div>
                  </div>
                  <button onClick={handleBulkSyncToDrive} disabled={isBulkSyncing || unsyncedCount === 0} className={`px-8 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isBulkSyncing ? 'bg-orange-400 text-white' : 'bg-orange-600 text-white shadow-orange-500/30'}`}>
                      {isBulkSyncing ? <RefreshCw size={20} className="animate-spin" /> : <Cloud size={20} />}
                      <span>{isBulkSyncing ? bulkSyncProgress : t.syncLocalFiles}</span>
                  </button>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-orange-900 group-hover:rotate-12 transition-transform duration-700"><Files size={120} /></div>
           </div>
       )}
    </div>
  );
};
