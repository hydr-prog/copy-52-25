
import React from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { TeethChart } from '../TeethChart';
import { RCTDrawingBoard } from '../RCTDrawingBoard';
import { Patient, ClinicData, Language, ToothNote, RootCanalEntry } from '../../types';

interface TreatmentSectionProps {
  activePatient: Patient;
  data: ClinicData;
  t: any;
  currentLang: Language;
  isRTL: boolean;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  handleUpdateTooth: (patientId: string, toothId: number, status: any) => void;
  handleUpdateToothSurface: (patientId: string, toothId: number, surface: any, status: any) => void;
  handleUpdateToothNote: (patientId: string, toothId: number, note: ToothNote) => void;
  handleUpdateHead: (patientId: string, region: string, status: string) => void;
  handleUpdateBody: (patientId: string, region: string, status: string) => void;
  handleAddRCT: (patientId: string, rct: any) => void;
  handleDeleteRCT: (patientId: string, rctId: string) => void;
  rctInput: { tooth: string, canal: string, length: string };
  setRctInput: (val: any) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const TreatmentSection: React.FC<TreatmentSectionProps> = ({
  activePatient, data, t, currentLang, isRTL, updatePatient, handleUpdateTooth, handleUpdateToothSurface, handleUpdateToothNote, handleUpdateHead, handleUpdateBody,
  handleAddRCT, handleDeleteRCT, rctInput, setRctInput, openConfirm
}) => {
  return (
    <div className="space-y-10 animate-fade-in">
      <TeethChart 
        teeth={activePatient.teeth}
        headMap={activePatient.headMap}
        bodyMap={activePatient.bodyMap}
        onToothClick={(id, status) => handleUpdateTooth(activePatient.id, id, status)} 
        onToothSurfaceClick={(id, surface, status) => handleUpdateToothSurface(activePatient.id, id, surface, status)}
        onToothNoteUpdate={(id, note) => handleUpdateToothNote(activePatient.id, id, note)}
        onHeadClick={(region, status) => handleUpdateHead(activePatient.id, region, status)}
        onBodyClick={(region, status) => handleUpdateBody(activePatient.id, region, status)}
        language={currentLang}
        t={t}
      />

      <RCTDrawingBoard 
          t={t} 
          initialDrawing={activePatient.rctDrawing} 
          onSave={(base64) => updatePatient(activePatient.id, { rctDrawing: base64 })}
          googleDriveLinked={data.settings.googleDriveLinked}
          patient={activePatient}
          isRTL={isRTL}
      />

      <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t.rct}</h3>
          <div className="flex flex-wrap items-end gap-2 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
               <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.tooth}</label>
                   <input className="w-16 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" placeholder="#" value={rctInput.tooth} onChange={e => setRctInput({...rctInput, tooth: e.target.value})} />
               </div>
               <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.canal}</label>
                   <input className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" placeholder="MB/DB/P" value={rctInput.canal} onChange={e => setRctInput({...rctInput, canal: e.target.value})} />
               </div>
               <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.length}</label>
                   <input className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" placeholder="mm" value={rctInput.length} onChange={e => setRctInput({...rctInput, length: e.target.value})} />
               </div>
               <button 
                  onClick={() => { if(rctInput.tooth && rctInput.canal && rctInput.length) { handleAddRCT(activePatient.id, { toothNumber: rctInput.tooth, canalName: rctInput.canal, length: rctInput.length, date: new Date().toISOString() }); } }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary-700 transition"
               > + {t.addRCT} </button>
          </div>
          
          {(activePatient.rootCanals || []).length > 0 ? (
             <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 text-start">
                            <th className="pb-2 px-2">{t.tooth}</th>
                            <th className="pb-2 px-2">{t.canal}</th>
                            <th className="pb-2 px-2">{t.length}</th>
                            <th className="pb-2 px-2">{t.date}</th>
                            <th className="pb-2 px-2">{t.action}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activePatient.rootCanals.map((r) => (
                            <tr key={r.id} className="border-t border-gray-200 dark:border-gray-600">
                                <td className="py-2 px-2 font-bold">{r.toothNumber}</td>
                                <td className="py-2 px-2">{r.canalName}</td>
                                <td className="py-2 px-2">{r.length}</td>
                                <td className="py-2 px-2 text-xs opacity-70">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="py-2 px-2"><button onClick={() => openConfirm('Delete RCT', 'Remove this entry?', () => handleDeleteRCT(activePatient.id, r.id))} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          ) : ( <p className="text-gray-400 text-sm italic text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">No RCT data.</p> )}
      </div>
      
       <div className="mt-8">
           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <StickyNote size={20} className="text-primary-500" /> {t.notes}
           </h3>
           <textarea 
               className="w-full p-4 rounded-2xl bg-yellow-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white min-h-[120px]"
               value={activePatient.notes}
               onChange={(e) => updatePatient(activePatient.id, { notes: e.target.value })}
               placeholder={t.addNotesPlaceholder}
           />
      </div>
    </div>
  );
};
