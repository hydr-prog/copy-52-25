
import React from 'react';
import { Building2, Edit2, X, Stethoscope, Check, Phone, ShieldCheck, Lock } from 'lucide-react';
import { ClinicData } from '../../types';

interface IdentitySectionProps {
  t: any;
  data: ClinicData;
  isRTL: boolean;
  isEditingClinic: boolean;
  setIsEditingClinic: (val: boolean) => void;
  tempClinicName: string;
  setTempClinicName: (val: string) => void;
  saveClinicName: () => void;
  isEditingPhone: boolean;
  setIsEditingPhone: (val: boolean) => void;
  tempClinicPhone: string;
  setTempClinicPhone: (val: string) => void;
  saveClinicPhone: () => void;
  setShowVerificationModal: (val: boolean) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  t, data, isRTL, isEditingClinic, setIsEditingClinic, tempClinicName, setTempClinicName, saveClinicName,
  isEditingPhone, setIsEditingPhone, tempClinicPhone, setTempClinicPhone, saveClinicPhone, setShowVerificationModal
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30"><Building2 size={24} /></div>
            <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.clinicIdentity}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Name Card */}
            <div className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${isEditingClinic ? 'border-primary-500 bg-primary-50/10 shadow-inner' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary-100 dark:hover:border-primary-900'}`}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.clinicName}</span>
                    {!isEditingClinic ? (
                        <button onClick={() => { setTempClinicName(data.clinicName); setIsEditingClinic(true); }} className="p-2.5 bg-white dark:bg-gray-700 text-primary-600 rounded-full shadow-md hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                    ) : (
                        <button onClick={() => setIsEditingClinic(false)} className="p-2.5 bg-red-50 text-red-600 rounded-full"><X size={16} /></button>
                    )}
                </div>
                {isEditingClinic ? (
                    <div className="space-y-3 animate-fade-in">
                        <div className="relative">
                            <Stethoscope size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-primary-400" />
                            <input type="text" autoFocus value={tempClinicName} onChange={(e) => setTempClinicName(e.target.value)} className="w-full ps-12 pe-4 py-4 bg-white dark:bg-gray-700 border-none rounded-2xl dark:text-white outline-none font-bold text-lg shadow-sm" />
                        </div>
                        <button onClick={saveClinicName} className="w-full bg-primary-600 text-white py-3 rounded-2xl font-black shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 hover:bg-primary-700 transition"><Check size={20} /> {t.save}</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 py-1">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><Stethoscope size={24} /></div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white break-words flex-1 leading-tight">{data.clinicName}</div>
                    </div>
                )}
            </div>

            {/* Phone Card */}
            <div className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${isEditingPhone ? 'border-primary-500 bg-primary-50/10 shadow-inner' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary-100 dark:hover:border-primary-900'}`}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.clinicPhone}</span>
                    {!isEditingPhone ? (
                        <button onClick={() => { setTempClinicPhone(data.settings.clinicPhone || ''); setIsEditingPhone(true); }} className="p-2.5 bg-white dark:bg-gray-700 text-green-600 rounded-full shadow-md hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                    ) : (
                        <button onClick={() => setIsEditingPhone(false)} className="p-2.5 bg-red-50 text-red-600 rounded-full"><X size={16} /></button>
                    )}
                </div>
                {isEditingPhone ? (
                    <div className="space-y-3 animate-fade-in">
                        <div className="relative">
                            <Phone size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-green-500" />
                            <input type="tel" autoFocus value={tempClinicPhone} onChange={(e) => setTempClinicPhone(e.target.value)} className="w-full ps-12 pe-4 py-4 bg-white dark:bg-gray-700 border-none rounded-2xl dark:text-white outline-none font-bold text-lg shadow-sm" dir="ltr" />
                        </div>
                        <button onClick={saveClinicPhone} className="w-full bg-primary-600 text-white py-3 rounded-2xl font-black shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 hover:bg-primary-700 transition"><Check size={20} /> {t.save}</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 py-1">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><Phone size={24} /></div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white leading-tight font-mono tracking-tight" dir="ltr">{data.settings.clinicPhone || '---'}</div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl shadow-sm"><ShieldCheck size={20} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight">{t.security}</h3>
            </div>
            <button onClick={() => setShowVerificationModal(true)} className="w-full flex items-center justify-between p-6 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-[2rem] group border-2 border-red-100/50 dark:border-red-900/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-red-600 group-hover:rotate-12 transition-transform"><Lock size={22} /></div>
                    <div className="text-start">
                        <div className="font-black text-gray-800 dark:text-white text-lg">{t.changeAdminPass}</div>
                        <div className="text-xs text-red-600/70 font-bold">{isRTL ? 'تأمين الحساب الرئيسي وحماية البيانات' : 'Secure main account and data'}</div>
                    </div>
                </div>
                <div className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} className="text-gray-400" /></div>
            </button>
        </div>
    </div>
  );
};
