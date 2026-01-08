
import { createClient } from '@supabase/supabase-js';
import { ClinicData } from '../types';
import { INITIAL_DATA } from '../initialData';

const SUPABASE_URL = 'https://ionklmzfvsbbbbdakwhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmtsbXpmdnNiYmJiZGFrd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTQ3MTEsImV4cCI6MjA3OTg3MDcxMX0.fAuimBEH6f5eCHS0UFj_NdU4WIx77v7fKvz6kok9lUg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  checkAccountStatus: async (): Promise<{ exists: boolean; error: boolean }> => {
    try {
      const user = await supabaseService.getUser();
      if (!user) return { exists: false, error: false };

      const { data, error } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Check Account Status Error:', error.message);
        return { exists: true, error: true };
      }
      return { exists: data && data.length > 0, error: false };
    } catch (e: any) {
      console.error('Check Account Status Exception:', e.message || String(e));
      return { exists: true, error: true };
    }
  },

  loadData: async (): Promise<ClinicData | null> => {
    const user = await supabaseService.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading data:', error.message, error.details);
      return null;
    }

    if (!data || data.length === 0) {
      return INITIAL_DATA;
    }

    const row = data[0];
    const content = row.content || {};
    
    if (row['RX json']) {
        const rxData = row['RX json'];
        if (rxData && rxData.image) {
            if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
            content.settings.rxBackgroundImage = rxData.image;
        }
    } else if (row.rx && typeof row.rx === 'string') {
        if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
        content.settings.rxBackgroundImage = row.rx;
    }

    const cloudTimestamp = content.lastUpdated || 0;

    return { 
        ...INITIAL_DATA, 
        ...content,
        lastUpdated: cloudTimestamp
    };
  },

  saveData: async (clinicData: ClinicData) => {
    const user = await supabaseService.getUser();
    if (!user) return;

    const dataToSave = {
        ...clinicData,
        lastUpdated: Date.now()
    };

    const payload = {
        user_id: user.id,
        content: dataToSave,
        "RX json": { image: clinicData.settings.rxBackgroundImage }
    };

    // Manual 'Upsert' logic to avoid reliance on unique constraints that might be missing in DB
    // Step 1: Check for existing record
    const { data: existingRows, error: fetchError } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(1);

    if (fetchError) {
        console.error('Error checking for existing record:', fetchError.message);
        throw new Error(fetchError.message || 'Failed to check existing data');
    }

    let saveError;
    if (existingRows && existingRows.length > 0) {
        // Step 2a: Update existing row
        const { error: updateError } = await supabase
            .from('user_data')
            .update(payload)
            .eq('id', existingRows[0].id);
        saveError = updateError;
    } else {
        // Step 2b: Insert new row
        const { error: insertError } = await supabase
            .from('user_data')
            .insert(payload);
        saveError = insertError;
    }

    if (saveError) {
        const errorInfo = `Code: ${saveError.code}, Message: ${saveError.message}, Details: ${saveError.details}`;
        console.error('Error saving data to Supabase:', errorInfo);
        throw new Error(saveError.message || 'Database sync failed');
    }
  }
};
