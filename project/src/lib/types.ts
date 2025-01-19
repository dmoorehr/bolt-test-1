import { Database } from './database.types';

export type DashboardData = Database['public']['Tables']['dashboard_data']['Row'];
export type DashboardConfig = Database['public']['Tables']['dashboard_configs']['Row'];
export type SavedView = Database['public']['Tables']['saved_views']['Row'];

export interface FilterState {
  [key: string]: string;
}

export interface DataState {
  data: any[];
  headers: string[];
  loading: boolean;
  error: string | null;
}

export interface ConfigState {
  configs: DashboardConfig[];
  loading: boolean;
  error: string | null;
}

export interface ViewState {
  views: SavedView[];
  loading: boolean;
  error: string | null;
}