
import { Language } from './types';
import { LABELS } from './locales';
import { TREATMENT_TYPES } from './constants';
// @ts-ignore
import ArabicReshaper from 'arabic-persian-reshaper';

export const hexToRgb = (hex: string): string => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

export const formatTime12 = (time24: string, lang: Language) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const isPm = h >= 12;
  h = h % 12;
  h = h ? h : 12;
  
  const amLabel = LABELS[lang]?.morning || 'AM';
  const pmLabel = LABELS[lang]?.night || 'PM';
  const ampm = isPm ? pmLabel : amLabel;
  
  return `${h}:${minutes} ${ampm}`;
};

export const getLocaleCode = (lang: 'en' | 'ar' | 'ku') => {
    switch(lang) {
        case 'ar': return 'ar-IQ';
        case 'ku': return 'ckb-IQ';
        default: return 'en-US';
    }
}

export const getLocalizedDate = (date: Date, type: 'day' | 'month' | 'full' | 'weekday', lang: 'en' | 'ar' | 'ku') => {
    const locale = getLocaleCode(lang);
    if (type === 'day') return new Intl.DateTimeFormat(locale, { day: 'numeric', numberingSystem: 'latn' }).format(date);
    if (type === 'weekday') return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
    if (type === 'month') return new Intl.DateTimeFormat(locale, { month: 'numeric', year: 'numeric', numberingSystem: 'latn' }).format(date);
    if (type === 'full') return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric', numberingSystem: 'latn' }).format(date);
    return date.toDateString();
}

export const getTreatmentLabel = (typeId?: string, currentLang: Language = 'en', isRTL: boolean = false) => {
    if(!typeId) return '';
    const type = TREATMENT_TYPES.find(t => t.id === typeId);
    if(isRTL) return currentLang === 'ku' ? type?.ku : type?.ar;
    return type?.en;
};

const normalizeDigits = (str: string) => {
  return str.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
            .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
};

export const processArabicText = (text: string): string => {
  if (!text) return '';
  const normalizedText = normalizeDigits(text);
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (!arabicPattern.test(normalizedText)) return normalizedText;
  try {
      const reshaped = ArabicReshaper.convert(normalizedText);
      return reshaped.split('').reverse().join('');
  } catch (e) {
      console.warn("Reshaping failed", e);
      return text;
  }
};

/**
 * Direct WhatsApp Redirect:
 * Forces the device to open the installed WhatsApp application immediately
 * without opening a new browser tab or landing page.
 */
export const openWhatsApp = (phoneCode: string = '', phone: string = '') => {
    // Clean the phone number from any symbols or spaces
    const cleanPhone = `${phoneCode.replace('+', '')}${phone.replace(/\s/g, '')}`;
    
    // The 'whatsapp://' protocol triggers the native application directly 
    // on iOS (iPhone/iPad), Android, and Windows/Mac desktop apps.
    const directUrl = `whatsapp://send?phone=${cleanPhone}`;
    
    // Assigning to window.location.href triggers the OS protocol handler 
    // without leaving the current app page.
    window.location.href = directUrl;
};
