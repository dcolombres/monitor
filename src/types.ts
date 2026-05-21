export interface MonitorHistory {
  timestamp: string;
  status: 'online' | 'offline';
  latency: number;
  statusCode?: number;
  error?: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'unknown';
  latency: number | null;
  lastCheck: string | null;
  history: MonitorHistory[];
}

export type View = 'dashboard' | 'analytics' | 'admin' | 'screensaver_cyber' | 'screensaver_dev' | 'screensaver_dashboard' | 'screensaver_analytics';
