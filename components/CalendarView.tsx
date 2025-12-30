
import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, Users, Plus, Check, X as XIcon, History, Trash2, Settings, Type as TypeIcon, Layout, Palette } from 'lucide-react';
import { addMonths, addWeeks, addDays, endOfWeek, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, format } from 'date-fns';
import { getLocalizedDate, formatTime12, getTreatmentLabel } from '../utils';
import { DAY_COLORS } from '../constants';
import { ClinicData, MonthViewSettings, WeekViewSettings } from '../types';

interface CalendarViewProps {
  t: any;
  data: ClinicData;
  currentLang: any;
  isRTL: boolean;
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (v: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  filteredAppointments: any[];
  setSelectedAppointment: (appt: any) => void;
  setAppointmentMode: (mode: 'existing' | 'new') => void;
  setShowAppointmentModal: (show: boolean) => void;
  handleUpdateAppointmentStatus: (patientId: string, appId: string, status: any) => void;
  handleDeleteAppointment: (patientId: string, appId: string) => void;
  setSelectedPatientId: (id: string) => void;
  setCurrentView: (view: any) => void;
  setPatientTab: (tab: any) => void;
  setGuestToConvert: (appt: any) => void;
  setShowNewPatientModal: (show: boolean) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  setData?: React.Dispatch<React.SetStateAction<ClinicData>>;
}

const COLUMN_COLORS = Array(7).fill('bg-white dark:bg-gray-800/40');

export const CalendarView: React.FC<CalendarViewProps> = ({
  t, data, currentLang, isRTL, calendarView, setCalendarView, currentDate, setCurrentDate,
  filteredAppointments, setSelectedAppointment, setAppointmentMode, setShowAppointmentModal,
  handleUpdateAppointmentStatus, handleDeleteAppointment, setSelectedPatientId, setCurrentView,
  setPatientTab, setGuestToConvert, setShowNewPatientModal, openConfirm, setData
}) => {
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  const [showMonthSettings, setShowMonthSettings] = useState(false);
  const [showWeekSettings, setShowWeekSettings] = useState(false);
  const [calendarFilterDoctor, setCalendarFilterDoctor] = useState<string>('');
  const [calendarFilterGender, setCalendarFilterGender] = useState<string>('');

  // Local device-only state for settings
  const [monthSettings, setMonthSettings] = useState<MonthViewSettings>(() => {
    const saved = localStorage.getItem('dentro_cal_month_settings');
    if (saved) return JSON.parse(saved);
    return data.settings.monthViewSettings || { fontSize: 12, columnPadding: 20, textColor: '#4b5563' };
  });

  const [weekSettings, setWeekSettings] = useState<WeekViewSettings>(() => {
    const saved = localStorage.getItem('dentro_cal_week_settings');
    if (saved) return JSON.parse(saved);
    return data.settings.weekViewSettings || { fontSize: 14, textColor: '#111827' };
  });

  const updateMonthSettings = (newSettings: Partial<MonthViewSettings>) => {
      const updated = { ...monthSettings, ...newSettings };
      setMonthSettings(updated);
      localStorage.setItem('dentro_cal_month_settings', JSON.stringify(updated));
  };

  const updateWeekSettings = (newSettings: Partial<WeekViewSettings>) => {
      const updated = { ...weekSettings, ...newSettings };
      setWeekSettings(updated);
      localStorage.setItem('dentro_cal_week_settings', JSON.stringify(updated));
  };

  const displayedAppointments = filteredAppointments.filter(appt => {
      const p = appt.patient;
      if (calendarFilterDoctor) {
          if (!p || p.doctorId !== calendarFilterDoctor) return false;
      }
      if (calendarFilterGender) {
          if (!p || p.gender !== calendarFilterGender) return false;
      }
      return true;
  });

  const calculateMinWidth = () => {
      const base = 1000;
      const multiplier = 10;
      const val = monthSettings.columnPadding < 100 ? monthSettings.columnPadding * 10 : monthSettings.columnPadding;
      return base + (val * multiplier);
  };

  return (
    <div className="w-full animate-fade-in pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
         <div className="shrink-0">
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.calendar}</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">{t.manageCalendar}</p>
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full lg:auto">
            {calendarView === 'month' && (
                <button 
                    onClick={() => setShowMonthSettings(!showMonthSettings)}
                    className={`p-2 rounded-lg border transition ${showMonthSettings ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                    title={t.calendarSettings}
                >
                    <Settings size={20} />
                </button>
            )}

            {calendarView === 'week' && (
                <button 
                    onClick={() => setShowWeekSettings(!showWeekSettings)}
                    className={`p-2 rounded-lg border transition ${showWeekSettings ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                    title={t.calendarSettings}
                >
                    <Settings size={20} />
                </button>
            )}

            <button 
                onClick={() => setShowCalendarFilter(!showCalendarFilter)}
                className={`p-2 rounded-lg border transition ${showCalendarFilter ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                title={t.filter}
            >
                <Filter size={20} />
            </button>

            {showCalendarFilter && (
                <>
                    <select 
                        value={calendarFilterDoctor}
                        onChange={(e) => setCalendarFilterDoctor(e.target.value)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-bold outline-none flex-1 lg:flex-none min-w-[140px] animate-scale-up"
                    >
                        <option value="">{t.selectDoctor}</option>
                        {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                        value={calendarFilterGender}
                        onChange={(e) => setCalendarFilterGender(e.target.value)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-bold outline-none flex-1 lg:flex-none min-w-[120px] animate-scale-up"
                    >
                        <option value="">{t.selectGender}</option>
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                    </select>
                </>
            )}

            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shrink-0">
                {(['month', 'week', 'day'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => {
                            setCalendarView(v);
                            setShowMonthSettings(false);
                            setShowWeekSettings(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${calendarView === v ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                    >
                        {t[v]}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {showMonthSettings && calendarView === 'month' && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><TypeIcon size={14}/> {t.fontSize}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="8" max="24" value={monthSettings.fontSize} onChange={(e) => updateMonthSettings({ fontSize: parseInt(e.target.value) })} className="flex-1 accent-primary-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span className="font-bold text-gray-700 dark:text-white w-8 text-center">{monthSettings.fontSize}</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Layout size={14}/> {t.columnPadding}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="150" step="5" value={monthSettings.columnPadding} onChange={(e) => updateMonthSettings({ columnPadding: parseInt(e.target.value) })} className="flex-1 accent-primary-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span className="font-bold text-gray-700 dark:text-white w-8 text-center">{monthSettings.columnPadding}</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> {t.textColor}</label>
                  <div className="flex items-center gap-3">
                      <input type="color" value={monthSettings.textColor} onChange={(e) => updateMonthSettings({ textColor: e.target.value })} className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                      <button onClick={() => updateMonthSettings({ textColor: '#4b5563' })} className="text-[10px] font-bold text-primary-600 hover:underline">{t.reset}</button>
                  </div>
              </div>
          </div>
      )}

      {showWeekSettings && calendarView === 'week' && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><TypeIcon size={14}/> {t.fontSize}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="10" max="24" value={weekSettings.fontSize} onChange={(e) => updateWeekSettings({ fontSize: parseInt(e.target.value) })} className="flex-1 accent-primary-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span className="font-bold text-gray-700 dark:text-white w-8 text-center">{weekSettings.fontSize}</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> {t.textColor}</label>
                  <div className="flex items-center gap-3">
                      <input type="color" value={weekSettings.textColor} onChange={(e) => updateWeekSettings({ textColor: e.target.value })} className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                      <button onClick={() => updateWeekSettings({ textColor: '#111827' })} className="text-[10px] font-bold text-primary-600 hover:underline">{t.reset}</button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, -1) : calendarView === 'week' ? addWeeks(currentDate, -1) : addDays(currentDate, -1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="rtl:rotate-180" /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
                  {getLocalizedDate(currentDate, 'month', currentLang)}
              </h2>
              <button onClick={() => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, 1) : calendarView === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="rtl:rotate-180" /></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-primary-600 font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition">{t.today}</button>
      </div>

      {calendarView === 'month' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden flex flex-col">
              <div className="overflow-auto custom-scrollbar">
                <div style={{ minWidth: `${calculateMinWidth()}px` }}>
                    <div className="grid grid-cols-7 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = addDays(new Date(2024, 0, 7), i);
                            const colColor = COLUMN_COLORS[i];
                            return (
                                <div key={i} className={`py-4 text-center text-sm font-black text-gray-600 dark:text-gray-200 border-r-2 last:border-r-0 border-gray-300 dark:border-gray-600 ${colColor}`}>
                                    {getLocalizedDate(d, 'weekday', currentLang)}
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-7">
                        {eachDayOfInterval({ 
                            start: addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), -new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()), 
                            end: endOfWeek(endOfMonth(currentDate)) 
                        }).map((day, idx) => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const dayAppointments = displayedAppointments.filter(a => isSameDay(new Date(a.date), day));
                            const dayOfWeek = day.getDay();
                            const colColor = COLUMN_COLORS[dayOfWeek];
                            
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => { setCurrentDate(day); setCalendarView('day'); }}
                                    className={`border-b-2 border-r-2 last:border-r-0 border-gray-300 dark:border-gray-600 p-3 transition hover:brightness-95 cursor-pointer flex flex-col items-start gap-1 min-h-[160px] ${colColor} ${!isCurrentMonth ? 'opacity-40 grayscale-[0.5]' : ''}`}
                                >
                                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    <div className="flex flex-col gap-1 w-full">
                                        {dayAppointments.map((appt, i) => (
                                            <div 
                                                key={i} 
                                                className="truncate w-full px-2 py-0.5 leading-tight bg-white/80 dark:bg-black/30 rounded-md border-s-4 border-primary-500 shadow-sm font-bold"
                                                style={{ fontSize: `${monthSettings.fontSize}px`, color: monthSettings.textColor }}
                                            >
                                                {appt.patientName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
              </div>
          </div>
      )}

      {calendarView === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {eachDayOfInterval({ start: addDays(currentDate, -currentDate.getDay()), end: endOfWeek(currentDate, { weekStartsOn: 0 }) }).map((day, idx) => {
                  const isToday = isSameDay(day, new Date());
                  const dayAppointments = displayedAppointments
                    .filter(a => isSameDay(new Date(a.date), day))
                    .sort((a,b) => a.time.localeCompare(b.time));

                  const colorClass = DAY_COLORS[idx % DAY_COLORS.length];
                  
                  return (
                      <div 
                          key={idx} 
                          onClick={() => { setCurrentDate(day); setCalendarView('day'); }}
                          className={`p-5 rounded-[2.5rem] border-2 shadow-sm cursor-pointer hover:shadow-md transition min-h-[180px] flex flex-col ${colorClass} ${idx === 6 ? 'md:col-span-2' : ''}`}
                      >
                          <div className="flex justify-between items-start mb-4 border-b-2 border-current/40 pb-3">
                              <div>
                                  <div className="text-xl font-black opacity-100 mb-0.5">{getLocalizedDate(day, 'weekday', currentLang)}</div>
                                  <div className="text-xs opacity-80 font-bold">{getLocalizedDate(day, 'full', currentLang)}</div>
                              </div>
                              {isToday && <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-[10px] font-black shadow-sm ring-1 ring-black/5">{t.today.toUpperCase()}</span>}
                          </div>

                          <div className="flex-1 space-y-2.5">
                              {dayAppointments.length === 0 ? (
                                  <div className="flex-1 flex items-center justify-center opacity-40 text-sm font-black italic">
                                      {t.noAppsDay}
                                  </div>
                              ) : (
                                  dayAppointments.map(appt => (
                                      <div key={appt.id} className="flex items-center justify-between bg-white/90 dark:bg-black/40 p-3 rounded-2xl shadow-sm border border-black/5 transition-transform hover:scale-[1.02]">
                                          <span 
                                            className="font-black truncate flex-1 pr-2"
                                            style={{ 
                                                fontSize: `${weekSettings.fontSize}px`, 
                                                color: weekSettings.textColor 
                                            }}
                                          >
                                              {appt.patientName}
                                          </span>
                                          <span className="text-[11px] font-black font-mono bg-primary-600 text-white dark:bg-primary-500 px-2 py-1 rounded-lg shrink-0 shadow-sm">
                                              {formatTime12(appt.time, currentLang)}
                                          </span>
                                      </div>
                                  ))
                              )}
                          </div>
                          
                          {dayAppointments.length > 0 && (
                             <div className="mt-3 text-[10px] opacity-90 font-black text-end uppercase tracking-widest bg-black/5 dark:bg-white/10 py-1 px-3 rounded-full w-fit ms-auto">
                                 {dayAppointments.length} {isRTL ? (currentLang === 'ku' ? 'دانیشتن' : 'جلسات') : 'Sessions'}
                             </div>
                          )}
                      </div>
                  );
              })}
          </div>
      )}

      {calendarView === 'day' && (
          <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {getLocalizedDate(currentDate, 'weekday', currentLang)}, {getLocalizedDate(currentDate, 'full', currentLang)}
                  </h2>
                  
                  <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2">
                      <Users size={18} />
                      <span>
                        {displayedAppointments.filter(a => isSameDay(new Date(a.date), currentDate)).length} {currentLang === 'ar' ? 'جلسات' : currentLang === 'ku' ? 'دانیشتن' : 'Sessions'}
                      </span>
                  </div>
              </div>
              
              <button 
                onClick={() => {
                    setSelectedAppointment(null);
                    setAppointmentMode('existing');
                    setShowAppointmentModal(true);
                }}
                className="w-full py-4 bg-primary-50 dark:bg-gray-700 border-2 border-dashed border-primary-200 dark:border-gray-600 rounded-2xl text-primary-600 dark:text-primary-300 font-bold hover:bg-primary-100 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                  <Plus size={20} /> {t.addAppointment}
              </button>

              <div className="space-y-3">
                  {(() => {
                      const dayApps = displayedAppointments
                        .filter(a => isSameDay(new Date(a.date), currentDate))
                        .sort((a,b) => a.time.localeCompare(b.time));

                      return dayApps.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">{t.noAppsDay}</div>
                      ) : (
                        dayApps.map((appt, idx) => (
                         <div key={appt.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center animate-fade-in group">
                             
                             <div className="w-20 text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                                 <div className="text-lg font-bold text-gray-800 dark:text-white">{formatTime12(appt.time, currentLang)}</div>
                                 <div className="text-xs text-gray-500">{appt.duration} {t.min}</div>
                             </div>
                             <div className="flex-1 min-w-[200px]">
                                 <div className="flex items-center gap-2 mb-1">
                                     <h3 className="font-bold text-lg text-gray-800 dark:text-white">{appt.patientName}</h3>
                                     {!appt.patientId && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Guest</span>}
                                 </div>
                                 <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                     {getTreatmentLabel(appt.treatmentType, currentLang, isRTL) || t.checkup}
                                     {appt.sessionNumber && <span>• {t.session} {appt.sessionNumber}</span>}
                                 </div>
                             </div>
                             
                             <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                 <button 
                                    onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'completed')}
                                    className={`p-2 rounded-md transition ${appt.status === 'completed' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-green-500'}`}
                                    title={t.markCompleted}
                                 >
                                     <Check size={18} />
                                 </button>
                                 <button 
                                    onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'noshow')}
                                    className={`p-2 rounded-md transition ${appt.status === 'noshow' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-red-500'}`}
                                    title={t.markNoShow}
                                 >
                                     <XIcon size={18} />
                                 </button>
                                 {(appt.status === 'completed' || appt.status === 'noshow') && (
                                    <button 
                                        onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'scheduled')}
                                        className="p-2 ml-1 text-gray-400 hover:text-blue-500"
                                        title={t.resetStatus}
                                    >
                                        <History size={16} />
                                    </button>
                                 )}
                             </div>

                             <div className="flex gap-2">
                                 {appt.patientId ? (
                                     <button 
                                        onClick={() => { setSelectedPatientId(appt.patientId); setCurrentView('patients'); setPatientTab('overview'); }}
                                        className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg font-bold text-sm hover:bg-primary-100 transition"
                                     >
                                         {t.profile}
                                     </button>
                                 ) : (
                                     <button 
                                        onClick={() => { setGuestToConvert(appt); setShowNewPatientModal(true); }}
                                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 transition"
                                     >
                                         {t.addToPatients}
                                     </button>
                                 )}
                                 <button onClick={() => openConfirm(t.deleteAppointment, t.deleteAppointmentConfirm, () => handleDeleteAppointment(appt.patientId, appt.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                             </div>
                         </div>
                     ))
                    );
                  })()}
              </div>
          </div>
      )}
    </div>
  );
};
