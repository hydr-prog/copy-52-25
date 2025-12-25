
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, FlaskConical, Briefcase, Palette, Check } from 'lucide-react';
import { ClinicData } from '../../types';

interface LabSettingsModalProps {
    show: boolean;
    onClose: () => void;
    t: any;
    data: ClinicData;
    setData: React.Dispatch<React.SetStateAction<ClinicData>>;
    currentLang: string;
}

export const LabSettingsModal: React.FC<LabSettingsModalProps> = ({ show, onClose, t, data, setData, currentLang }) => {
    const [activeTab, setActiveTab] = useState<'labs' | 'works' | 'shades'>('labs');
    const [newItem, setNewItem] = useState('');
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    if (!show) return null;

    // Improved Add Logic: Strictly immutable to ensure React detects changes
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const value = newItem.trim();
        if (!value) return;

        // Check for duplicates
        const currentList = activeTab === 'labs' ? (data.labs || []) : activeTab === 'works' ? (data.workTypes || []) : (data.shades || []);
        if (currentList.includes(value)) {
            alert(isRTL ? "هذا العنصر موجود بالفعل" : "This item already exists");
            return;
        }

        setData(prev => {
            const timestamp = Date.now();
            if (activeTab === 'labs') {
                return { ...prev, lastUpdated: timestamp, labs: [...(prev.labs || []), value] };
            } else if (activeTab === 'works') {
                return { ...prev, lastUpdated: timestamp, workTypes: [...(prev.workTypes || []), value] };
            } else {
                return { ...prev, lastUpdated: timestamp, shades: [...(prev.shades || []), value] };
            }
        });
        setNewItem('');
    };

    // Improved Delete Logic: Strictly immutable
    const handleDeleteItem = (itemToDelete: string) => {
        setData(prev => {
            const timestamp = Date.now();
            if (activeTab === 'labs') {
                return { ...prev, lastUpdated: timestamp, labs: (prev.labs || []).filter(l => l !== itemToDelete) };
            } else if (activeTab === 'works') {
                return { ...prev, lastUpdated: timestamp, workTypes: (prev.workTypes || []).filter(w => w !== itemToDelete) };
            } else {
                return { ...prev, lastUpdated: timestamp, shades: (prev.shades || []).filter(s => s !== itemToDelete) };
            }
        });
    };

    const listToRender = activeTab === 'labs' ? (data.labs || []) : activeTab === 'works' ? (data.workTypes || []) : (data.shades || []);

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            {/* Main Modal Container: Flexible height for better scrolling on all devices */}
            <div 
                className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:h-[650px] ${fontClass}`} 
                dir={isRTL ? 'rtl' : 'ltr'}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section (Fixed) */}
                <div className="p-6 md:p-8 pb-4 shrink-0 bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <FlaskConical size={28} />
                            {t.labSettings}
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex bg-black/20 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setActiveTab('labs')}
                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'labs' ? 'bg-white text-primary-700 shadow-lg scale-[1.02]' : 'text-white/80 hover:text-white'}`}
                        >
                            <FlaskConical size={18} /> {t.labs}
                        </button>
                        <button 
                            onClick={() => setActiveTab('works')}
                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'works' ? 'bg-white text-primary-700 shadow-lg scale-[1.02]' : 'text-white/80 hover:text-white'}`}
                        >
                            <Briefcase size={18} /> {t.labWorkTypes}
                        </button>
                        <button 
                            onClick={() => setActiveTab('shades')}
                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'shades' ? 'bg-white text-primary-700 shadow-lg scale-[1.02]' : 'text-white/80 hover:text-white'}`}
                        >
                            <Palette size={18} /> {t.labShades}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
                    {/* Input Form (Fixed at top of content) */}
                    <form onSubmit={handleAddItem} className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                        <div className="relative group">
                            <input 
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                className="w-full ps-5 pe-16 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:text-white outline-none shadow-sm font-bold text-lg transition-all"
                                placeholder={activeTab === 'labs' ? t.enterLabName : activeTab === 'works' ? t.addWorkType : t.addShade}
                            />
                            <button 
                                type="submit"
                                disabled={!newItem.trim()}
                                className="absolute top-1/2 -translate-y-1/2 end-2 p-3 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </form>

                    {/* Scrollable List Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                        {(!listToRender || listToRender.length === 0) ? (
                            <div className="text-center py-20 opacity-30 flex flex-col items-center animate-fade-in">
                                <FlaskConical size={64} className="mb-4" />
                                <p className="font-black text-lg">{t.noDataFound}</p>
                            </div>
                        ) : (
                            listToRender.map((item, idx) => (
                                <div 
                                    key={`${activeTab}-${idx}`} 
                                    className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900/30 transition-all duration-300 animate-scale-up"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-black shadow-inner">
                                            {idx + 1}
                                        </div>
                                        <span className="font-black text-gray-800 dark:text-white text-lg">{item}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteItem(item)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                                        title={t.deleteItem}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Safe Area Footer for mobile devices */}
                <div className="h-4 bg-gray-50 dark:bg-gray-900 shrink-0"></div>
            </div>
        </div>,
        document.body
    );
};
