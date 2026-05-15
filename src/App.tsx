/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Activity, 
  Plus, 
  RefreshCw, 
  Bell, 
  Globe, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { cn } from './lib/utils';
import { Monitor, View } from './types';

// Refresh interval in seconds
const REFRESH_INTERVAL = 120;

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial monitors
  const fetchMonitors = useCallback(async () => {
    try {
      const res = await fetch('/api/monitors');
      const data = await res.json();
      setMonitors(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch monitors', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Check health for a single monitor
  const checkHealth = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/check/${id}`, { method: 'POST' });
      const updated = await res.json();
      setMonitors(prev => prev.map(m => m.id === id ? updated : m));
    } catch (err) {
      console.error(`Check failed for ${id}`, err);
    }
  }, []);

  // Refresh all monitors
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    const list = await fetchMonitors();
    await Promise.all(list.map((m: Monitor) => checkHealth(m.id)));
    setIsRefreshing(false);
    setCountdown(REFRESH_INTERVAL);
  }, [fetchMonitors, checkHealth]);

  // Initial load and timer
  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshAll();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshAll]);

  const stats = useMemo(() => {
    const online = monitors.filter(m => m.status === 'online').length;
    const offline = monitors.filter(m => m.status === 'offline').length;
    const total = monitors.length;
    const avgLatency = monitors.length > 0 
      ? monitors.reduce((acc, m) => acc + (m.latency || 0), 0) / monitors.length 
      : 0;
    
    return { online, offline, total, avgLatency };
  }, [monitors]);

  return (
    <div className="flex h-screen bg-[#0a0b0e] text-[#cbd5e1] font-sans selection:bg-primary selection:text-on-primary">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1e2129] bg-[#12141a] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white">URL NOC</h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Monitor v4.0.2</span>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarLink 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')}
            />
            <SidebarLink 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Analytics" 
              active={activeView === 'analytics'} 
              onClick={() => setActiveView('analytics')}
            />
            <SidebarLink 
              icon={<Settings className="w-5 h-5" />} 
              label="Admin" 
              active={activeView === 'admin'} 
              onClick={() => setActiveView('admin')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="p-4 rounded-lg bg-[#0a0b0e] border border-[#1e2129]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Health</span>
              <span className="text-xs text-primary font-mono">{Math.round((stats.online / (stats.total || 1)) * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.online / (stats.total || 1)) * 100}%` }}
              />
            </div>
          </div>

          <button 
            onClick={refreshAll}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1e2129] hover:bg-[#2a2e38] text-white rounded border border-slate-700 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isRefreshing ? 'Checking...' : 'Force Sync'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-[#1e2129] bg-[#12141a] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h2 className="text-xl font-bold text-white capitalize">{activeView}</h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-8 pr-8 border-r border-[#1e2129]">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Overall Health</p>
                <p className="text-xl font-mono text-primary leading-none">{Math.round((stats.online / (stats.total || 1)) * 100)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Next Refresh</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-mono text-tertiary leading-none">{countdown}s</p>
                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      animate={{ width: `${(countdown / REFRESH_INTERVAL) * 100}%` }}
                      transition={{ ease: 'linear', duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded hover:bg-[#1e2129] transition-colors relative text-slate-400">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-[#12141a]" />
              </button>
              <button 
                onClick={refreshAll}
                className={cn("p-2 rounded hover:bg-[#1e2129] transition-colors text-slate-400", isRefreshing && "animate-spin")}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="h-10 w-10 rounded-lg border border-[#1e2129] p-0.5 bg-[#0a0b0e]">
                <div className="h-full w-full rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">JD</div>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView monitors={monitors} stats={stats} onCheck={checkHealth} />}
            {activeView === 'analytics' && <AnalyticsView monitors={monitors} stats={stats} />}
            {activeView === 'admin' && <AdminView monitors={monitors} onAdd={fetchMonitors} onDelete={fetchMonitors} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-12 border-t border-[#1e2129] bg-[#12141a] flex items-center justify-between px-8 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="bg-[#1e2129] px-2 py-0.5 rounded text-primary">LOG:</span>
            <span>[{new Date().toLocaleTimeString()}] System baseline operational - Mode: Passive</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_4px_rgba(16,185,129,1)]" />
              <span className="text-slate-300">{stats.online} Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-error rounded-full shadow-[0_0_4px_rgba(244,63,94,1)]" />
              <span className="text-slate-300">{stats.offline} Offline</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <span className="uppercase text-slate-500">Node: Argentina-01</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-2.5 rounded transition-all duration-300 group",
        active 
          ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none font-bold" 
          : "text-slate-500 hover:bg-[#1a1c23] hover:text-slate-300"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>{icon}</span>
      <span className="text-[11px] uppercase tracking-widest font-bold">{label}</span>
    </button>
  );
}

function DashboardView({ monitors, stats, onCheck }: { monitors: Monitor[], stats: any, onCheck: (id: string) => void }) {
  const [page, setPage] = useState(0);
  const pageSize = 16;
  const currentMonitors = monitors.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Endpoint Capacity" value={`${monitors.length}/128`} icon={<Globe className="text-slate-500 w-4 h-4" />} />
        <StatCard label="Online Status" value={stats.online} icon={<CheckCircle2 className="text-primary w-4 h-4" />} />
        <StatCard label="Critical Errors" value={stats.offline} icon={<AlertCircle className="text-error w-4 h-4" />} />
        <StatCard label="System Latency" value={`${Math.round(stats.avgLatency)}ms`} icon={<Clock className="text-tertiary w-4 h-4" />} />
      </div>

      {/* Main Grid */}
      <div className="flex items-center justify-between border-b border-[#1e2129] pb-4">
        <h3 className="text-base font-bold flex items-center gap-3 text-white uppercase tracking-tight">
          Current Monitoring Group
          <span className="text-[10px] text-slate-500 font-mono font-normal tracking-normal border border-[#1e2129] px-2 py-0.5 rounded">NODE BUE-01</span>
        </h3>
        <div className="flex gap-2">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="p-1 px-3 rounded bg-[#12141a] border border-[#1e2129] hover:bg-[#1e2129] disabled:opacity-20 transition-all text-[11px] font-bold text-slate-400"
          >
            PREV
          </button>
          <button 
            disabled={(page + 1) * pageSize >= monitors.length}
            onClick={() => setPage(p => p + 1)}
            className="p-1 px-3 rounded bg-[#12141a] border border-[#1e2129] hover:bg-[#1e2129] disabled:opacity-20 transition-all text-[11px] font-bold text-slate-400"
          >
            NEXT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMonitors.map(monitor => (
          <MonitorCard key={monitor.id} monitor={monitor} onCheck={() => onCheck(monitor.id)} />
        ))}
        {Array.from({ length: Math.max(0, pageSize - currentMonitors.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[#12141a] border border-slate-800/40 opacity-40 p-4 rounded-lg flex flex-col justify-center items-center border-dashed h-[140px]">
            <div className="text-[10px] uppercase text-slate-600 font-bold tracking-widest">Empty Slot {i + 1 + currentMonitors.length}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#12141a] p-4 rounded-lg border border-[#1e2129] flex flex-col items-center justify-center text-center">
      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-xl font-mono text-white leading-none">{value}</p>
        {icon}
      </div>
    </div>
  );
}

function MonitorCard({ monitor, onCheck }: { monitor: Monitor, onCheck: () => void }) {
  const isOnline = monitor.status === 'online';

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-[#12141a] border p-4 rounded-lg flex flex-col justify-between h-[150px] cursor-pointer transition-all duration-300 relative overflow-hidden",
        isOnline ? "border-[#1e2129]" : "border-error/40 ring-1 ring-error/20"
      )}
      onClick={onCheck}
    >
      <div className="flex justify-between items-start gap-3 z-10">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block truncate">{monitor.name}</span>
          <span className="text-[8px] text-slate-600 font-mono truncate block mt-0.5">{monitor.url}</span>
        </div>
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded border font-bold whitespace-nowrap",
          isOnline 
            ? "bg-primary/10 text-primary border-primary/30" 
            : "bg-error/10 text-error border-error/30"
        )}>
          {isOnline ? '200 OK' : '503 ERR'}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-10 h-12 opacity-30 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monitor.history}>
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke={isOnline ? "#10b981" : "#f43f5e"} 
              fill={isOnline ? "#10b981" : "#f43f5e"} 
              strokeWidth={1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-end z-10">
        <div className="text-xl font-mono text-white leading-none">
          {monitor.latency ? monitor.latency : '0'}
          <span className="text-[10px] text-slate-500 ml-1 font-normal">ms</span>
        </div>
        <div className="text-[9px] text-slate-500 font-bold">
          {isOnline ? `TTL: ${Math.floor(Math.random() * 60 + 10)}` : 'TIMEOUT'}
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsView({ monitors, stats }: { monitors: Monitor[], stats: any }) {
  const rankingData = useMemo(() => {
    return monitors
      .filter(m => m.latency !== null)
      .sort((a, b) => (a.latency || 0) - (b.latency || 0))
      .slice(0, 10);
  }, [monitors]);

  const availabilityData = [
    { name: 'Online', value: stats.online },
    { name: 'Offline', value: stats.offline },
  ];

  const distributionColors = ['#10b981', '#f43f5e'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Access Time Ranking */}
        <div className="lg:col-span-8 p-6 rounded-lg border border-[#1e2129] bg-[#12141a]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">Access Time Ranking (Best 10)</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2129" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0b0e', border: '1px solid #1e2129', borderRadius: '4px' }}
                />
                <Bar dataKey="latency" radius={[0, 2, 2, 0]} barSize={12}>
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.latency! < 200 ? '#10b981' : entry.latency! < 500 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="lg:col-span-4 p-6 rounded-lg border border-[#1e2129] bg-[#12141a] flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">Status Distribution</h3>
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availabilityData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {availabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={distributionColors[index % distributionColors.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0b0e', border: '1px solid #1e2129', borderRadius: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-6">
              {availabilityData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: distributionColors[i] }} />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latency Trends */}
      <div className="p-6 rounded-lg border border-[#1e2129] bg-[#12141a]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">Overall Latency History</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monitors[0]?.history || []}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2129" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0b0e', border: '1px solid #1e2129', borderRadius: '4px' }}
              />
              <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

function AdminView({ monitors, onAdd, onDelete }: { monitors: Monitor[], onAdd: () => void, onDelete: () => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    setSubmitting(true);
    try {
      await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url })
      });
      setName('');
      setUrl('');
      onAdd();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const removeMonitor = async (id: string) => {
    try {
      await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
      onDelete();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 xl:grid-cols-12 gap-8"
    >
      {/* Configuration Form */}
      <div className="xl:col-span-4 space-y-6">
        <div className="p-6 rounded-lg border border-[#1e2129] bg-[#12141a]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
            <Plus className="w-5 h-5" />
            Configurar Sitio
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre del Sitio</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-[#1e2129] rounded p-3 focus:border-primary outline-none transition-all font-mono text-sm"
                placeholder="Ej: API Producción Central"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL de Monitoreo</label>
              <input 
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-[#1e2129] rounded p-3 focus:border-primary outline-none transition-all font-mono text-sm"
                placeholder="https://example.com/api/health"
                required
              />
            </div>
            <div className="p-4 rounded bg-primary/5 border border-primary/20 text-[10px] text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-primary mb-2" />
              Los monitores se agrupan automáticamente de 16 en 16. La frecuencia de refresco global es de 120s.
            </div>
            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-emerald-500 text-white py-3 rounded text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin inline mr-2" /> : 'Guardar Monitor'}
            </button>
          </form>
        </div>
      </div>

      {/* List Table */}
      <div className="xl:col-span-8 rounded-lg border border-[#1e2129] bg-[#12141a] overflow-hidden">
        <div className="p-6 border-b border-[#1e2129] bg-[#0a0b0e]/30">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Monitored Endpoints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-[#1e2129]">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2129]">
              {monitors.map(m => (
                <tr key={m.id} className="hover:bg-[#1a1c23] transition-all group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200">{m.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{m.url}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase",
                      m.status === 'online' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-error/10 border-error/30 text-error'
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", m.status === 'online' ? 'bg-primary' : 'bg-error')} />
                      {m.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeMonitor(m.id)}
                      className="p-2 text-slate-500 hover:text-error hover:bg-error/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {monitors.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-500 text-xs">
                    No monitors found. Add your first one using the form.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
