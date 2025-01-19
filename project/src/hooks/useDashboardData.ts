import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DataState } from '../lib/types';

export function useDashboardData() {
  const [state, setState] = useState<DataState>({
    data: [],
    headers: [],
    loading: false,
    error: null
  });

  const processFile = useCallback(async (data: any[], headers: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase
        .from('dashboard_data')
        .insert({ 
          data,
          headers,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        data,
        headers,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    processFile
  };
}