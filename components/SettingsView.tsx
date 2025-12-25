
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Edit2, Phone, Trash2, Plus, Moon, Sun, X, Upload, Cloud, Download, Instagram, AlertTriangle, Palette, CheckCircle2, User, Lock, ShieldCheck, Contact, Database, PlusCircle, UserMinus, Users, Eye, EyeOff, Save, Stethoscope, Maximize, Minus, Layout, Link, RefreshCw, Key, FileUp, Files, UserCircle, UserCheck, CheckCircle, Globe, AlertOctagon, Trash, Building2, HardDriveUpload, UserX, FolderX } from 'lucide-react';
import { CURRENCY_LIST, THEMES } from '../constants';
import { storageService } from '../services/storage';
import { googleDriveService } from '../services/googleDrive';
import { ClinicData, Language, Doctor, Secretary, Patient } from '../types';

interface SettingsViewProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  handleAddDoctor: (name: string, username?: string, password?: string) => void;
  handleUpdateDoctor: (id: string, updates: Partial<Doctor>) => void;
  handleDeleteDoctor: (id: string, deletePatients?: boolean) => void;
  handleAddSecretary: (name: string, username: string, password?: string) => void;
  handleDeleteSecretary: (id: string) => void;
  handleRxFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportData: (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => void;
  syncStatus: string;
  deferredPrompt: any;
  handleInstallApp: () => void;
  openConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  currentLang: Language;
  setDeviceLang: (lang: Language) => void;
  currentTheme: 'light' | 'dark';
  setLocalTheme: (theme: 'light' | 'dark') => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeDoctorId?: string | null;
  activeSecretaryId?: string | null;
  deviceScale: number;
  setDeviceScale: (scale: number) => void;
  onLinkDrive: () => void;
}

const BackupModal = ({ show, onClose, t, data, isRTL, fontClass }: any) => {
    if (!show) return null;
    const handleDoctorBackup = (docId: string) => {
        const filteredData = {
            ...data,
            doctors: data.doctors.filter((d: any) => d.id === docId),
            patients: data.patients.filter((p: any) => p.doctorId === docId),
            secretaries: [],
            labOrders: data.labOrders?.filter((o: any) => data.patients.find((p: any) => p.id === o.patientId && p.doctorId === docId))
        };
        storageService.exportBackup(filteredData, `doctor_${docId}`);
        onClose();
    };
    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileUp className="text-emerald-500" />
                        {t.backupOptions}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <button onClick={() => { storageService.exportBackup(data); onClose(); }} className="w-full flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl hover:bg-emerald-100 transition group">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <div className="text-start">
                            <div className="font-bold text-emerald-900 dark:text-emerald-100">{t.fullBackup}</div>
                            <div className="text-xs text-emerald-600/60 dark:text-emerald-400/60">{isRTL ? "تصدير كافة بيانات العيادة في ملف واحد" : "Export all clinic data in one file"}</div>
                        </div>
                    </button>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.doctorBackup}</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {data.doctors.map((doc: any) => (
                                <button key={doc.id} onClick={() => handleDoctorBackup(doc.id)} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-2xl border border-transparent hover:border-gray-200 transition shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <UserCircle size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{doc.name}</span>
                                    </div>
                                    <FileUp size={16} className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const RestoreModal = ({ show, onClose, t, onImport, isRTL, fontClass }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'merge' | 'replace' | null>(null);
    if (!show) return null;
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (mode) {
            onImport(e, mode);
            onClose();
            setMode(null);
        }
    };
    const triggerImport = (selectedMode: 'merge' | 'replace') => {
        setMode(selectedMode);
        setTimeout(() => fileInputRef.current?.click(), 100);
    };
    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Download className="text-blue-500" />
                        {t.restoreOptions}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileSelect} />
                <div className="space-y-4">
                    <button onClick={() => triggerImport('merge')} className="w-full flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-3xl hover:bg-blue-100 transition group text-start">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-blue-900 dark:text-blue-100">{t.restoreMerge}</div>
                            <div className="text-xs text-blue-600/60 dark:text-blue-400/60">{t.mergeDesc}</div>
                        </div>
                    </button>
                    <button onClick={() => triggerImport('replace')} className="w-full flex items-center gap-4 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800 rounded-3xl hover:bg-red-100 transition group text-start">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-red-600 group-hover:scale-110 transition-transform">
                            <RefreshCw size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-red-900 dark:text-red-100">{t.restoreReplace}</div>
                                <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                            </div>
                            <div className="text-xs text-red-600/60 dark:text-red-400/60">{t.replaceDesc}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const VerificationModal = ({ show, onClose, t, onVerify, error, isRTL, fontClass }: any) => {
    const [pass, setPass] = useState('');
    
    // تأمين مسح كلمة المرور عند فتح أو غلق النافذة لمنع الحفظ التلقائي أو الاستخدام المتكرر
    useEffect(() => {
        if (show) setPass('');
    }, [show]);

    if (!show) return null;
    
    return createPortal(
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{t.adminAccessOnly}</h3>
                    <p className="text-sm text-gray-500 mt-1">{isRTL ? "يرجى تأكيد الهوية للمتابعة" : "Verify identity to continue"}</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onVerify(pass); }} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            autoFocus 
                            placeholder={t.adminPassword} 
                            value={pass}
                            autoComplete="new-password"
                            onChange={e => setPass(e.target.value)}
                            className="w-full ps-10 pe-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold transition hover:bg-gray-200">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition transform active:scale-95">{t.login}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

const ChangeAdminPasswordModal = ({ show, onClose, t, isRTL, fontClass, onSave }: any) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 4) {
            setError(isRTL ? "يجب أن تكون كلمة المرور 4 رموز على الأقل" : "Password must be at least 4 characters");
            return;
        }
        if (newPass !== confirmPass) {
            setError(t.passwordsMismatch);
            return;
        }
        onSave(newPass);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Key size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{t.changeAdminPass}</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.newPassword}</label>
                        <input 
                            type="password" 
                            required 
                            autoFocus
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.confirmNewPassword}</label>
                        <input 
                            type="password" 
                            required 
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                            className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold transition">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

const DoctorDeleteChoiceModal = ({ show, onClose, t, onChoice, doctorName, isRTL, fontClass }: any) => {
    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <AlertOctagon size={40} />
                    </div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-2">{isRTL ? `حذف الطبيب: ${doctorName}` : `Delete Doctor: ${doctorName}`}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{isRTL ? "يرجى اختيار نوع الحذف المفضل لديك" : "Please choose your preferred deletion method"}</p>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => onChoice(false)}
                        className="w-full flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 border-2 border-transparent hover:border-blue-500 transition-all rounded-[2rem] group text-start shadow-sm"
                    >
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <UserX size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-gray-800 dark:text-white text-lg">{isRTL ? "حذف البروفايل فقط" : "Delete Profile Only"}</div>
                            <div className="text-xs text-gray-400 font-bold">{isRTL ? "سيتم حذف حساب الطبيب مع الإبقاء على بيانات المرضى" : "Remove account but keep patient data"}</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => onChoice(true)}
                        className="w-full flex items-center gap-4 p-5 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-transparent hover:border-red-500 transition-all rounded-[2rem] group text-start shadow-sm"
                    >
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <FolderX size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-red-700 dark:text-red-400 text-lg">{isRTL ? "حذف كامل (شامل للمرضى)" : "Full Delete (Including Patients)"}</div>
                            <div className="text-xs text-red-600/60 font-bold">{isRTL ? "سيتم حذف الطبيب وكل المرضى التابعين له نهائياً" : "Wipe doctor and all associated patient records"}</div>
                        </div>
                    </button>
                </div>

                <button onClick={onClose} className="w-full mt-6 py-4 text-gray-400 hover:text-gray-600 font-black text-sm uppercase tracking-widest">{t.cancel}</button>
            </div>
        </div>,
        document.body
    );
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  t, data, setData, handleAddDoctor, handleUpdateDoctor, handleDeleteDoctor, handleAddSecretary, handleDeleteSecretary, handleRxFileUpload, handleImportData, syncStatus, deferredPrompt, handleInstallApp, openConfirm, currentLang, setDeviceLang, currentTheme, setLocalTheme, activeThemeId, setActiveThemeId, activeDoctorId, activeSecretaryId, deviceScale, setDeviceScale, onLinkDrive
}) => {
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempClinicName, setTempClinicName] = useState(data.clinicName);
  const [tempClinicPhone, setTempClinicPhone] = useState(data.settings.clinicPhone || '');
  
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [showAddSecretaryModal, setShowAddSecretaryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isVerifyingDrive, setIsVerifyingDrive] = useState(false);
  const [isDriveVerifiedOnDevice, setIsDriveVerifiedOnDevice] = useState(googleDriveService.hasActiveToken());
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showChangeAdminPassModal, setShowChangeAdminPassModal] = useState(false);
  const [showDoctorDeleteChoice, setShowDoctorDeleteChoice] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', target: 'doctor' | 'secretary', data: any } | null>(null);

  // Drive Bulk Sync State
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkSyncProgress, setBulkSyncProgress] = useState('');

  const isAdmin = !activeDoctorId && !activeSecretaryId;
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  const [formDoc, setFormDoc] = useState({ id: '', name: '', user: '', pass: '' });
  const [formSec, setFormSec] = useState({ name: '', user: '', pass: '' });

  useEffect(() => {
    const check = () => setIsDriveVerifiedOnDevice(googleDriveService.hasActiveToken());
    window.addEventListener('dentro_drive_auth_change', check);
    return () => window.removeEventListener('dentro_drive_auth_change', check);
  }, []);

  const handleVerifySuccess = (passwordInput: string) => {
      const adminPass = data.settings.adminPassword || '123456';
      if (passwordInput === adminPass) {
          const action = pendingAction;
          setShowVerificationModal(false);
          setVerifyError('');
          
          if (!action) {
              // إذا لم يكن هناك إجراء معلق، نفتح واجهة تغيير كلمة السر
              setShowChangeAdminPassModal(true);
              return;
          }
          if (action.target === 'doctor') {
              if (action.type === 'edit') {
                  setFormDoc({ id: action.data.id, name: action.data.name, user: action.data.username || '', pass: action.data.password || '' });
                  setShowEditDoctorModal(true);
              } else if (action.type === 'delete') {
                  setShowDoctorDeleteChoice(true);
              }
          } else if (action.target === 'secretary') {
              if (action.type === 'delete') {
                  openConfirm(t.deleteSecretary, isRTL ? `هل أنت متأكد من حذف حساب ${action.data.name}؟` : `Delete ${action.data.name}?`, () => handleDeleteSecretary(action.data.id));
              }
          }
          setPendingAction(null);
      } else {
          setVerifyError(t.wrongPin);
      }
  };

  const saveAdminPassword = (newPass: string) => {
      setData(prev => ({
          ...prev,
          lastUpdated: Date.now(),
          settings: { ...prev.settings, adminPassword: newPass }
      }));
      alert(isRTL ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully");
  };

  const handleDoctorDeleteFinal = (deletePatients: boolean) => {
      if (pendingAction?.data) {
          handleDeleteDoctor(pendingAction.data.id, deletePatients);
          setShowDoctorDeleteChoice(false);
          setPendingAction(null);
      }
  };

  const tryOpenAddSecretary = () => {
      if ((data.secretaries || []).length >= 4) {
          alert(t.maxSecretaries);
          return;
      }
      setShowAddSecretaryModal(true);
  };

  const handleDeviceDriveVerify = async () => {
      setIsVerifyingDrive(true);
      try {
          const token = await googleDriveService.login('consent');
          if (token) {
              setIsDriveVerifiedOnDevice(true);
              return true;
          }
      } catch (e: any) {
          if (e === 'popup_closed_by_user') return false;
          if (googleDriveService.hasActiveToken()) {
              setIsDriveVerifiedOnDevice(true);
              return true;
          }
      } finally { setIsVerifyingDrive(false); }
      return false;
  };

  const handleBulkSyncToDrive = async () => {
      if (!isDriveVerifiedOnDevice) {
          const success = await handleDeviceDriveVerify();
          if (!success) return;
      }

      setIsBulkSyncing(true);
      setBulkSyncProgress(t.syncingNow);

      try {
          const rootId = await googleDriveService.ensureRootFolder();
          let updatedPatients = [...data.patients];
          let changed = false;

          for (let i = 0; i < updatedPatients.length; i++) {
              const patient = updatedPatients[i];
              let patientChanged = false;
              let patientFolderId = '';

              // Sync Profile Picture
              if (patient.profilePicture && !patient.profilePictureDriveId && patient.profilePicture.startsWith('data:')) {
                  setBulkSyncProgress(isRTL ? `جاري مزامنة صورة بروفايل ${patient.name}...` : `Syncing profile picture for ${patient.name}...`);
                  patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  
                  const blob = await (await fetch(patient.profilePicture)).blob();
                  const file = new File([blob], `ProfilePic_${patient.name}_${Date.now()}.png`, { type: blob.type });
                  const result = await googleDriveService.uploadFile(patientFolderId, file);
                  patient.profilePictureDriveId = result.id;
                  patient.profilePicture = result.url; // Update local URL to Drive thumbnail
                  patientChanged = true;
              }

              // Sync Images
              if (patient.images && patient.images.some(img => !img.driveFileId)) {
                  setBulkSyncProgress(isRTL ? `جاري مزامنة صور ${patient.name}...` : `Syncing images for ${patient.name}...`);
                  if (!patientFolderId) patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  
                  const updatedImages = [...patient.images];
                  for (let j = 0; j < updatedImages.length; j++) {
                      const img = updatedImages[j];
                      if (!img.driveFileId && img.url.startsWith('data:')) {
                          const blob = await (await fetch(img.url)).blob();
                          const file = new File([blob], img.name, { type: blob.type });
                          const result = await googleDriveService.uploadFile(patientFolderId, file);
                          updatedImages[j] = { ...img, driveFileId: result.id, url: result.url };
                          patientChanged = true;
                      }
                  }
                  patient.images = updatedImages;
              }

              // Sync RCT Drawing
              if (patient.rctDrawing && !patient.rctDrawingDriveId && patient.rctDrawing.startsWith('data:')) {
                  setBulkSyncProgress(isRTL ? `جاري مزامنة هطط قنوات ${patient.name}...` : `Syncing RCT chart for ${patient.name}...`);
                  if (!patientFolderId) patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  
                  const blob = await (await fetch(patient.rctDrawing)).blob();
                  const file = new File([blob], `RCT_Chart_${patient.name}_${Date.now()}.png`, { type: 'image/png' });
                  const result = await googleDriveService.uploadFile(patientFolderId, file);
                  patient.rctDrawingDriveId = result.id;
                  patientChanged = true;
              }

              if (patientChanged) {
                  updatedPatients[i] = { ...patient };
                  changed = true;
              }
          }

          if (changed) {
              setData(prev => ({ ...prev, patients: updatedPatients, lastUpdated: Date.now() }));
              alert(t.saveSuccessDrive);
          } else {
              alert(t.allSynced);
          }
      } catch (err) {
          console.error("Bulk sync failed", err);
          alert(t.errorDrive);
      } finally {
          setIsBulkSyncing(false);
          setBulkSyncProgress('');
      }
  };

  const getUnsyncedCount = () => {
      let count = 0;
      data.patients.forEach(p => {
          if (p.profilePicture && !p.profilePictureDriveId) count += 1;
          if (p.images) count += p.images.filter(img => !img.driveFileId).length;
          if (p.rctDrawing && !p.rctDrawingDriveId) count += 1;
      });
      return count;
  };

  const unsyncedCount = getUnsyncedCount();

  const handleResetLocalData = () => {
      openConfirm(
          t.resetConfirmTitle, 
          t.resetConfirmMsg, 
          () => {
              localStorage.clear();
              window.location.reload();
          },
          t.resetLocalData,
          t.cancel
      );
  };

  const adjustScale = (delta: number) => setDeviceScale(Math.max(80, Math.min(150, deviceScale + delta)));

  const saveClinicName = () => {
    if (!tempClinicName.trim()) return;
    setData(prev => ({ ...prev, clinicName: tempClinicName }));
    setIsEditingClinic(false);
  };

  const saveClinicPhone = () => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, clinicPhone: tempClinicPhone } }));
    setIsEditingPhone(false);
  };

  return (
    <div className={`animate-fade-in pb-10 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t.settings}</h1>
        
        <BackupModal show={showBackupModal} onClose={() => setShowBackupModal(false)} t={t} data={data} isRTL={isRTL} fontClass={fontClass} />
        <RestoreModal show={showRestoreModal} onClose={() => setShowRestoreModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onImport={handleImportData} />
        <VerificationModal show={showVerificationModal} onClose={() => setShowVerificationModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} error={verifyError} onVerify={handleVerifySuccess} />
        <ChangeAdminPasswordModal show={showChangeAdminPassModal} onClose={() => setShowChangeAdminPassModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onSave={saveAdminPassword} />
        <DoctorDeleteChoiceModal show={showDoctorDeleteChoice} onClose={() => setShowDoctorDeleteChoice(false)} t={t} doctorName={pendingAction?.data?.name} onChoice={handleDoctorDeleteFinal} isRTL={isRTL} fontClass={fontClass} />

        <div className="space-y-8 max-w-3xl mx-auto xl:mx-0">
          {isAdmin && (
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
                                      <input 
                                          type="text" autoFocus 
                                          value={tempClinicName} 
                                          onChange={(e) => setTempClinicName(e.target.value)} 
                                          className="w-full ps-12 pe-4 py-4 bg-white dark:bg-gray-700 border-none rounded-2xl dark:text-white outline-none font-bold text-lg shadow-sm"
                                      />
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
                                      <input 
                                          type="tel" autoFocus 
                                          value={tempClinicPhone} 
                                          onChange={(e) => setTempClinicPhone(e.target.value)} 
                                          className="w-full ps-12 pe-4 py-4 bg-white dark:bg-gray-700 border-none rounded-2xl dark:text-white outline-none font-bold text-lg shadow-sm"
                                          dir="ltr"
                                      />
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
                      <button onClick={() => { setPendingAction(null); setVerifyError(''); setShowVerificationModal(true); }} className="w-full flex items-center justify-between p-6 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-[2rem] group border-2 border-red-100/50 dark:border-red-900/30">
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
          )}

          {isAdmin && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-10">
                  {/* Doctors */}
                  <div>
                      <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-5">
                          <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-sm"><Stethoscope size={20} /></div>
                              <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.manageProfiles}</h3>
                          </div>
                          <button onClick={() => { setFormDoc({ id: '', name: '', user: '', pass: '' }); setShowAddDoctorModal(true); }} className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition active:scale-95"><Plus size={18} /> {t.addDoctor}</button>
                      </div>
                      {(showAddDoctorModal || showEditDoctorModal) && (
                          <form onSubmit={(e) => {
                              e.preventDefault();
                              if (showEditDoctorModal) handleUpdateDoctor(formDoc.id, { name: formDoc.name, username: formDoc.user, password: formDoc.pass });
                              else handleAddDoctor(formDoc.name, formDoc.user, formDoc.pass);
                              setShowAddDoctorModal(false); setShowEditDoctorModal(false);
                          }} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-[2.5rem] mb-8 border-2 border-primary-100 dark:border-primary-900 animate-fade-in space-y-5 shadow-inner">
                              <div className="flex justify-between items-center">
                                  <h4 className="font-black text-sm text-primary-600 uppercase tracking-widest">{showEditDoctorModal ? t.editItem : t.addDoctor}</h4>
                                  <button type="button" onClick={() => { setShowAddDoctorModal(false); setShowEditDoctorModal(false); }} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"><X size={20}/></button>
                              </div>
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.drNamePlaceholder}</label>
                                      <input value={formDoc.name} onChange={e => setFormDoc({...formDoc, name: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.username}</label>
                                          <input value={formDoc.user} onChange={e => setFormDoc({...formDoc, user: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.password}</label>
                                          <input value={formDoc.pass} onChange={e => setFormDoc({...formDoc, pass: e.target.value})} type="text" className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                                      </div>
                                  </div>
                              </div>
                              <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition">{t.save}</button>
                          </form>
                      )}
                      <div className="space-y-4">
                          {data.doctors.map(doc => (
                              <div key={doc.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform"><User size={28} /></div>
                                      <div>
                                          <div className="font-black text-gray-800 dark:text-white text-lg">{doc.name}</div>
                                          <div className="text-xs text-gray-400 font-bold tracking-tight">@{doc.username || '---'}</div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => { setPendingAction({ type: 'edit', target: 'doctor', data: doc }); setVerifyError(''); setShowVerificationModal(true); }} className="text-blue-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Edit2 size={18} /></button>
                                      <button onClick={() => { setPendingAction({ type: 'delete', target: 'doctor', data: doc }); setVerifyError(''); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Secretary */}
                  <div>
                      <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-5">
                          <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl shadow-sm"><Contact size={20} /></div>
                              <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.manageSecretaries}</h3>
                          </div>
                          <button onClick={tryOpenAddSecretary} className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition active:scale-95"><Plus size={18} /> {t.addSecretary}</button>
                      </div>
                      {showAddSecretaryModal && (
                          <form onSubmit={(e) => {
                              e.preventDefault();
                              handleAddSecretary(formSec.name, formSec.user, formSec.pass);
                              setFormSec({ name: '', user: '', pass: '' }); setShowAddSecretaryModal(false);
                          }} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-[2.5rem] mb-8 border-2 border-purple-100 dark:border-purple-900 animate-fade-in space-y-5 shadow-inner">
                              <div className="flex justify-between items-center">
                                  <h4 className="font-black text-sm text-purple-600 uppercase tracking-widest">{t.addSecretary}</h4>
                                  <button type="button" onClick={() => setShowAddSecretaryModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"><X size={20}/></button>
                              </div>
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.secretaryName}</label>
                                      <input value={formSec.name} onChange={e => setFormSec({...formSec, name: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.username}</label>
                                          <input value={formSec.user} onChange={e => setFormSec({...formSec, user: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.password}</label>
                                          <input value={formSec.pass} onChange={e => setFormSec({...formSec, pass: e.target.value})} type="text" className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                                      </div>
                                  </div>
                              </div>
                              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition">{t.save}</button>
                          </form>
                      )}
                      <div className="space-y-4">
                          {(data.secretaries || []).map(sec => (
                              <div key={sec.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform"><UserCheck size={28} /></div>
                                      <div>
                                          <div className="font-black text-gray-800 dark:text-white text-lg">{sec.name}</div>
                                          <div className="text-xs text-gray-400 font-bold tracking-tight">@{sec.username}</div>
                                      </div>
                                  </div>
                                  <button onClick={() => { setPendingAction({ type: 'delete', target: 'secretary', data: sec }); setVerifyError(''); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* Cloud Sync Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
             <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl border-b border-gray-100 dark:border-gray-700 pb-3 uppercase tracking-tight">{t.cloudSync}</h3>
             
             {/* Google Drive Connection */}
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

             {/* Bulk Sync Files Button */}
             {data.settings.googleDriveLinked && (
                 <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-800 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md text-orange-600">
                                <HardDriveUpload size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-orange-900 dark:text-orange-100 text-lg">{t.syncLocalFiles}</h4>
                                <p className="text-xs text-orange-600 font-bold">{isRTL ? `يوجد ${unsyncedCount} صورة ورسم ينتظر الرفع` : `${unsyncedCount} local items waiting for upload`}</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleBulkSyncToDrive}
                            disabled={isBulkSyncing || unsyncedCount === 0}
                            className={`px-8 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isBulkSyncing ? 'bg-orange-400 text-white' : 'bg-orange-600 text-white shadow-orange-500/30'}`}
                        >
                            {isBulkSyncing ? <RefreshCw size={20} className="animate-spin" /> : <Cloud size={20} />}
                            <span>{isBulkSyncing ? bulkSyncProgress : t.syncLocalFiles}</span>
                        </button>
                    </div>
                    <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-orange-900 group-hover:rotate-12 transition-transform duration-700">
                        <Files size={120} />
                    </div>
                 </div>
             )}
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
             <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl border-b border-gray-100 dark:border-gray-700 pb-3 uppercase tracking-tight">{t.preferences}</h3>
             
             {/* Interface Scale */}
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

             {/* Dark Mode & Language */}
             <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shadow-inner"><Moon size={20} /></div>
                        <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.darkMode}</span>
                    </div>
                    <button onClick={() => setLocalTheme(currentTheme === 'light' ? 'dark' : 'light')} className={`w-16 h-10 rounded-full p-1.5 transition-all duration-500 flex items-center ${currentTheme === 'dark' ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start shadow-inner'}`}><div className="w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700 transform transition-transform duration-500">{currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</div></button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-gray-600 pt-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner"><Globe size={20} /></div>
                        <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.language}</span>
                    </div>
                    <div className="flex bg-white dark:bg-gray-700 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-600 shadow-inner">{(['en', 'ar', 'ku'] as const).map(lang => (<button key={lang} onClick={() => setDeviceLang(lang)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${currentLang === lang ? 'bg-primary-600 shadow-lg text-white' : 'text-gray-500 hover:text-gray-900'}`}>{lang.toUpperCase()}</button>))}</div>
                </div>
             </div>

             {/* Themes Section */}
             <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Palette size={20} /></div>
                    <span className="font-black text-gray-800 dark:text-white text-lg">{t.appTheme}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {THEMES.map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => setActiveThemeId(theme.id)}
                            className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeThemeId === theme.id ? 'border-primary-500 bg-white dark:bg-gray-600 shadow-xl scale-105' : 'border-transparent bg-gray-100/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'}`}
                        >
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

          {/* Data Management Section */}
          {isAdmin && (
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
          )}

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/30">
                      <AlertOctagon size={24} />
                  </div>
                  <h3 className="font-black text-red-600 dark:text-red-400 text-xl uppercase tracking-tighter">{t.dangerZone}</h3>
              </div>
              
              <p className="text-sm md:text-base text-red-800/80 dark:text-red-300/60 leading-relaxed font-bold">
                  {t.resetLocalDataDesc}
              </p>

              <button 
                  onClick={handleResetLocalData}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-red-900/20 text-red-600 border-2 border-red-200 dark:border-red-800 rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-red-600 hover:text-white shadow-sm active:scale-95"
              >
                  <Trash size={20} />
                  <span>{t.resetLocalData}</span>
              </button>
          </div>

          {/* App Installation */}
          {deferredPrompt && (
              <div className="pt-4 px-2">
                  <button onClick={handleInstallApp} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95">
                      <Layout size={24} />
                      <span className="text-lg">{t.installApp}</span>
                  </button>
              </div>
          )}
        </div>
    </div>
  );
};
