
import React from 'react';
import { Plus, Settings, Pill, Trash2, Printer } from 'lucide-react';
import { getLocalizedDate } from '../../utils';
import { Patient, Language, Prescription } from '../../types';

interface PrescriptionsSectionProps {
  activePatient: Patient;
  t: any;
  currentLang: Language;
  setShowRxModal: (show: boolean) => void;
  setShowRxSettingsModal: (show: boolean) => void;
  setPrintingRx: (rx: Prescription) => void;
  handleDeleteRx: (id: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const PrescriptionsSection: React.FC<PrescriptionsSectionProps> = ({
  activePatient, t, currentLang, setShowRxModal, setShowRxSettingsModal, setPrintingRx, handleDeleteRx, openConfirm
}) => {
  return (
      <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> <Pill className="text-primary-500" /> {t.prescriptions} </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button onClick={() => setShowRxModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-0.5"><Plus size={18} /> {t.newPrescription}</button>
                  <button onClick={() => setShowRxSettingsModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 transition transform hover:-translate-y-0.5"><Settings size={18} /> {t.settings}</button>
              </div>
          </div>

          {(!activePatient.prescriptions || activePatient.prescriptions.length === 0) ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                  <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">{t.noRx}</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {activePatient.prescriptions.map((rx) => (
                      <div key={rx.id} className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 border-b border-gray-100 dark:border-gray-600 pb-3 w-full">
                              <div>
                                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">{t.date}</div>
                                  <div className="font-bold text-lg text-gray-800 dark:text-white">{getLocalizedDate(new Date(rx.date), 'full', currentLang)}</div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto justify-end">
                                   <button onClick={() => openConfirm(t.deleteRx, t.deleteRxConfirm, () => handleDeleteRx(rx.id))} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition" title="Delete"><Trash2 size={20} /></button>
                                  <button onClick={() => setPrintingRx(rx)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-bold text-sm hover:bg-gray-200 transition"><Printer size={16} /> {t.print}</button>
                              </div>
                          </div>
                          <div className="space-y-3" dir="ltr">
                              {rx.medications.map((med, idx) => (
                                  <div key={idx} className="flex flex-wrap items-baseline gap-2 break-words">
                                      <span className="font-bold text-gray-800 dark:text-white min-w-[20px]">{idx + 1}.</span>
                                      <span className="font-bold text-primary-700 dark:text-primary-300 text-lg">{med.name}</span>
                                      <span className="text-gray-600 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-md">{med.dose}</span>
                                      <span className="text-gray-500 dark:text-gray-400 italic text-sm">- {med.form} {med.frequency}</span>
                                      {med.notes && <span className="text-xs text-gray-400 ml-2">({med.notes})</span>}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );
};
