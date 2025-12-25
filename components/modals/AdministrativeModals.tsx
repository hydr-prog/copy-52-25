
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { COUNTRY_CODES, CATEGORIES, TREATMENT_TYPES, DURATIONS, STATUS_COLORS } from '../../constants';
import { Patient, Appointment } from '../../types';

export const PatientModal = ({ show, onClose, t, isRTL, currentLang, data, handleAddPatient, updatePatient, guestToConvert, activePatient, activeDoctorId }: any) => {
    if (!show) return null;
    const isEdit = !!activePatient;
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    
    // Determine if we should allow changing the doctor (Only Admin or Editing mode for admin)
    const canChangeDoctor = !activeDoctorId;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{isEdit ? t.editPatient : (guestToConvert ? t.convertGuestTitle : t.newPatient)}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const rawPhone = fd.get('phone') as string;
              
              // If doctor is logged in, use their ID. If admin, use the selected one.
              const doctorIdToSave = activeDoctorId || (fd.get('doctorId') as string);

              const formValues: any = {
                 name: fd.get('name') as string,
                 age: parseInt(fd.get('age') as string),
                 gender: fd.get('gender') as any,
                 phone: rawPhone.replace(/\s/g, ''),
                 phoneCode: fd.get('phoneCode') as string,
                 address: fd.get('address') as string,
                 category: fd.get('category') as any,
                 doctorId: doctorIdToSave
              };
              if (isEdit) { updatePatient(activePatient.id, formValues); onClose(); }
              else { handleAddPatient(formValues); onClose(); }
            }} className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                  <input name="name" defaultValue={isEdit ? activePatient.name : guestToConvert?.patientName} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t.fullNamePlaceholder} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.age}</label>
                      <input name="age" type="number" defaultValue={isEdit ? activePatient.age : ''} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
                      <select name="gender" defaultValue={isEdit ? activePatient.gender : 'male'} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                      </select>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                  <div className="flex gap-2">
                      <select name="phoneCode" defaultValue={isEdit ? activePatient.phoneCode : data.settings.defaultCountryCode} className="w-24 px-2 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm">
                          {COUNTRY_CODES.map(c => ( <option key={c.code} value={c.code}>{c.flag} {c.code}</option> ))}
                      </select>
                      <input name="phone" type="tel" defaultValue={isEdit ? activePatient.phone : ''} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="750 000 0000" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
                  <select name="category" defaultValue={isEdit ? activePatient.category : "diagnosis"} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => ( <option key={cat.id} value={cat.id}>{isRTL ? (currentLang === 'ku' ? cat.labelKu : cat.labelAr) : cat.label}</option> ))}
                  </select>
              </div>

              {/* Only show doctor selection if Admin is logged in */}
              {canChangeDoctor && data.doctors.length > 1 && (
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatingDoctor}</label>
                      <select name="doctorId" defaultValue={isEdit ? activePatient.doctorId : ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                          {data.doctors.map((doc: any) => ( <option key={doc.id} value={doc.id}>{doc.name}</option> ))}
                      </select>
                  </div>
              )}

              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                  <input name="address" defaultValue={isEdit ? activePatient.address : ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t.cityStreetPlaceholder} />
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5">{t.save}</button>
            </form>
          </div>
        </div>, document.body
    );
};

export const AppointmentModal = ({ show, onClose, t, selectedAppointment, appointmentMode, setAppointmentMode, selectedPatientId, data, currentDate, handleAddAppointment, isRTL, currentLang }: any) => {
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatientIdForm, setSelectedPatientIdForm] = useState('');
    const [showPatientList, setShowPatientList] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (!show) { setPatientSearch(''); setSelectedPatientIdForm(''); setShowPatientList(false); }
        else { if(selectedAppointment) { setSelectedPatientIdForm(selectedAppointment.patientId); setPatientSearch(selectedAppointment.patientName); } }
    }, [show, selectedAppointment]);

    useEffect(() => { if (show && !selectedAppointment) { setPatientSearch(''); setSelectedPatientIdForm(''); setShowPatientList(false); } }, [appointmentMode]);
    if (!show) return null;
    const filteredPatients = data.patients.filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch) );

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{selectedAppointment ? t.editAppointment : t.addAppointment}</h3>
                  {!selectedAppointment && !selectedPatientId && (
                      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-4">
                          <button type="button" onClick={() => setAppointmentMode('existing')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'existing' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>{t.existingPatient}</button>
                          <button type="button" onClick={() => setAppointmentMode('new')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'new' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>{t.quickNewPatient}</button>
                      </div>
                  )}
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const apptData: Partial<Appointment> = {
                          date: fd.get('date') as string,
                          time: fd.get('time') as string,
                          duration: parseInt(fd.get('duration') as string),
                          treatmentType: fd.get('treatmentType') as string,
                          sessionNumber: parseInt(fd.get('sessionNumber') as string) || 1,
                          notes: fd.get('notes') as string
                      };
                      if (appointmentMode === 'new') { apptData.patientName = fd.get('guestName') as string; handleAddAppointment(null, apptData); }
                      else { let pId = selectedPatientId || selectedPatientIdForm; if (!pId) { alert(isRTL ? "يرجى اختيار مريض" : "Please select a patient"); return; } handleAddAppointment(pId, apptData); }
                  }} className="space-y-3">
                      {appointmentMode === 'existing' ? ( !selectedPatientId && (
                              <div className="relative" ref={searchRef}>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.patients}</label>
                                  <div className="relative">
                                      <input type="text" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatientIdForm(''); setShowPatientList(true); }} onFocus={() => setShowPatientList(true)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none pr-10" placeholder={t.searchPatients} required={!selectedPatientIdForm} autoComplete="off" />
                                      {showPatientList && patientSearch && (
                                         <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border dark:border-gray-700 z-[110] max-h-40 overflow-y-auto rounded-xl shadow-lg mt-1">
                                             {filteredPatients.length > 0 ? ( filteredPatients.map((p: Patient) => (
                                                    <div key={p.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white border-b last:border-0 border-gray-50 dark:border-gray-700" onMouseDown={(e) => { e.preventDefault(); setPatientSearch(p.name); setSelectedPatientIdForm(p.id); setShowPatientList(false); }}>
                                                        <div className="font-bold">{p.name}</div>
                                                        <div className="text-gray-400 text-xs">{p.phone}</div>
                                                    </div> ))
                                             ) : ( <div className="p-3 text-sm text-gray-400 italic text-center">{t.noPatientsFilter}</div> )}
                                         </div>
                                      )}
                                  </div>
                              </div>
                          )
                      ) : (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.guestNamePlaceholder}</label>
                              <input name="guestName" defaultValue={selectedAppointment?.patientName} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" required placeholder={t.guestNamePlaceholder} />
                          </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.date}</label>
                              <input name="date" type="date" defaultValue={selectedAppointment?.date || format(currentDate, 'yyyy-MM-dd')} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.time}</label>
                              <input name="time" type="time" defaultValue={selectedAppointment?.time || '09:00'} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.treatmentType}</label>
                              <select name="treatmentType" defaultValue={selectedAppointment?.treatmentType || 'diagnosis'} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none">
                                  {TREATMENT_TYPES.map(type => ( <option key={type.id} value={type.id}>{currentLang === 'ku' ? type.ku : (currentLang === 'ar' ? type.ar : type.en)}</option> ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.duration}</label>
                              <select name="duration" defaultValue={selectedAppointment?.duration || 30} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none">
                                  {DURATIONS.map(d => <option key={d} value={d}>{d} {t.min}</option>)}
                              </select>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.sessionNumber}</label>
                              <input name="sessionNumber" type="number" min="1" defaultValue={selectedAppointment?.sessionNumber || 1} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.notes}</label>
                          <textarea name="notes" defaultValue={selectedAppointment?.notes} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder={t.optionalNotesPlaceholder} rows={2} />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                      </div>
                  </form>
              </div>
          </div>, document.body
    );
};
