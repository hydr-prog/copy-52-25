
import React from 'react';
import { Plus, Printer, Edit2, Trash2 } from 'lucide-react';
import { getLocalizedDate, formatTime12, getTreatmentLabel } from '../../utils';
import { Patient, Language, Appointment } from '../../types';

interface VisitsSectionProps {
  activePatient: Patient;
  t: any;
  currentLang: Language;
  isRTL: boolean;
  setShowAppointmentModal: (show: boolean) => void;
  setSelectedAppointment: (appt: Appointment | null) => void;
  setAppointmentMode: (mode: 'existing' | 'new') => void;
  setPrintingAppointment: (appt: Appointment) => void;
  handleDeleteAppointment: (patientId: string, appId: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const VisitsSection: React.FC<VisitsSectionProps> = ({
  activePatient, t, currentLang, isRTL, setShowAppointmentModal, setSelectedAppointment, setAppointmentMode, setPrintingAppointment, handleDeleteAppointment, openConfirm
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.appointmentHistory}</h3>
        <button 
          onClick={() => { setSelectedAppointment(null); setShowAppointmentModal(true); setAppointmentMode('existing'); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-700"
        > <Plus size={16} /> {t.addAppointment} </button>
      </div>

      <div className="space-y-3">
        {activePatient.appointments.length === 0 ? (
           <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">{t.noVisits}</div>
        ) : (
           [...activePatient.appointments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
            <div key={appt.id} className="flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 items-start sm:items-center">
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-800 dark:text-white">{getLocalizedDate(new Date(appt.date), 'full', currentLang)} {t.at} {formatTime12(appt.time, currentLang)}</span>
                      <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t[appt.status] || appt.status}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{getTreatmentLabel(appt.treatmentType, currentLang, isRTL) || t.checkup} • {appt.duration || 30} {t.min}{appt.sessionNumber && ` • ${t.session} ${appt.sessionNumber}`}</div>
                  {appt.notes && <div className="text-sm text-gray-400 mt-1 italic">"{appt.notes}"</div>}
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                  <button onClick={() => setPrintingAppointment(appt)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg" title={t.printTicket}><Printer size={16} /></button>
                  <button onClick={() => { setSelectedAppointment(appt); setShowAppointmentModal(true); setAppointmentMode('existing'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => openConfirm(t.deleteAppointment, t.deleteAppointmentConfirm, () => handleDeleteAppointment(activePatient.id, appt.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
