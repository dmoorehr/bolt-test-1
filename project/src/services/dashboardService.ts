import { supabase } from '../lib/supabase';
import { DashboardConfig, SavedView } from '../lib/types';

export const dashboardService = {
  async saveConfig(name: string, config: any) {
    const { data, error } = await supabase
      .from('dashboard_configs')
      .insert({
        name,
        config,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConfigs() {
    const { data, error } = await supabase
      .from('dashboard_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async saveView(name: string, filters: any) {
    const { data, error } = await supabase
      .from('saved_views')
      .insert({
        name,
        filters,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getViews() {
    const { data, error } = await supabase
      .from('saved_views')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};