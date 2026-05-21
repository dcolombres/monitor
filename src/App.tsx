/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Info,
  Maximize,
  X,
  Cpu,
  Zap,
  Target,
  Wifi,
  Database,
  Server,
  ZapOff,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
  const [autoPlay, setAutoPlay] = useState(false);

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

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger refresh when countdown hits 0
  useEffect(() => {
    if (countdown === 0 && !isRefreshing) {
      refreshAll();
    }
  }, [countdown, isRefreshing, refreshAll]);

  // Rotation logic
  useEffect(() => {
    if (!autoPlay) return;
    
    const views: View[] = ['screensaver_cyber', 'screensaver_dev', 'screensaver_dashboard', 'screensaver_analytics'];
    const timer = setInterval(() => {
      setActiveView(current => {
        const currentIndex = views.indexOf(current);
        if (currentIndex === -1) return views[0];
        return views[(currentIndex + 1) % views.length];
      });
    }, 60000); // 60 seconds rotation

    return () => clearInterval(timer);
  }, [autoPlay]);

  const stats = useMemo(() => {
    const online = monitors.filter(m => m.status === 'online').length;
    const offline = monitors.filter(m => m.status === 'offline').length;
    const total = monitors.length;
    const avgLatency = monitors.length > 0 
      ? monitors.reduce((acc, m) => acc + (m.latency || 0), 0) / monitors.length 
      : 0;
    
    const sortedByLatency = [...monitors].filter(m => m.latency !== null).sort((a, b) => (b.latency || 0) - (a.latency || 0));
    const slowest = sortedByLatency[0] || null;
    const maxLatency = slowest ? slowest.latency : 0;
    
    return { online, offline, total, avgLatency, maxLatency, slowest };
  }, [monitors]);

  if (activeView === 'screensaver_cyber') {
    return <ScreensaverCyberView monitors={monitors} stats={stats} autoPlay={autoPlay} onToggleAutoPlay={() => setAutoPlay(!autoPlay)} onExit={() => {setActiveView('dashboard'); setAutoPlay(false);}} onSwitch={() => setActiveView('screensaver_dev')} />;
  }

  if (activeView === 'screensaver_dev') {
    return <ScreensaverDevView monitors={monitors} stats={stats} autoPlay={autoPlay} onToggleAutoPlay={() => setAutoPlay(!autoPlay)} onExit={() => {setActiveView('dashboard'); setAutoPlay(false);}} onSwitch={() => setActiveView('screensaver_dashboard')} />;
  }

  if (activeView === 'screensaver_dashboard') {
    return <ScreensaverDashboardView monitors={monitors} stats={stats} autoPlay={autoPlay} onToggleAutoPlay={() => setAutoPlay(!autoPlay)} onExit={() => {setActiveView('dashboard'); setAutoPlay(false);}} onSwitch={() => setActiveView('screensaver_analytics')} />;
  }

  if (activeView === 'screensaver_analytics') {
    return <ScreensaverAnalyticsView monitors={monitors} stats={stats} autoPlay={autoPlay} onToggleAutoPlay={() => setAutoPlay(!autoPlay)} onExit={() => {setActiveView('dashboard'); setAutoPlay(false);}} onSwitch={() => setActiveView('screensaver_cyber')} />;
  }

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
              <button 
                onClick={() => setActiveView('screensaver_cyber')}
                className="p-2 rounded hover:bg-[#1e2129] transition-colors text-slate-400"
              >
                <Maximize className="w-5 h-5" />
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
            {activeView === 'dashboard' && <DashboardView key="dashboard" monitors={monitors} stats={stats} onCheck={checkHealth} />}
            {activeView === 'analytics' && <AnalyticsView key="analytics" monitors={monitors} stats={stats} />}
            {activeView === 'admin' && <AdminView key="admin" monitors={monitors} onAdd={fetchMonitors} onDelete={fetchMonitors} />}
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

function DashboardView({ monitors, stats, onCheck }: { monitors: Monitor[], stats: any, onCheck: (id: string) => void, key?: string }) {
  const [page, setPage] = useState(0);
  const pageSize = 16;
  const currentMonitors = monitors.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col gap-6 overflow-hidden"
    >
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <StatCard label="Endpoint Capacity" value={`${monitors.length}/128`} icon={<Globe className="text-slate-500 w-4 h-4" />} />
        <StatCard label="Online Status" value={stats.online} icon={<CheckCircle2 className="text-primary w-4 h-4" />} />
        <StatCard label="Critical Errors" value={stats.offline} icon={<AlertCircle className="text-error w-4 h-4" />} />
        <StatCard label="System Latency" value={`${Math.round(stats.avgLatency)}ms`} icon={<Clock className="text-tertiary w-4 h-4" />} />
      </div>

      <div className="flex items-center justify-between border-b border-[#1e2129] pb-4 shrink-0">
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

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-0">
        {currentMonitors.map(monitor => (
          <MonitorCard key={monitor.id} monitor={monitor} onCheck={() => onCheck(monitor.id)} />
        ))}
        {Array.from({ length: Math.max(0, pageSize - currentMonitors.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[#12141a] border border-slate-800/40 opacity-40 p-4 rounded-lg flex flex-col justify-center items-center border-dashed h-full">
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
    return [...monitors]
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
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function ScreensaverCyberView({ monitors, stats, autoPlay, onToggleAutoPlay, onExit, onSwitch }: { monitors: Monitor[], stats: any, autoPlay: boolean, onToggleAutoPlay: () => void, onExit: () => void, onSwitch: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onExit]);

  const availabilityData = [
    { name: 'Online', value: stats.online },
    { name: 'Offline', value: stats.offline },
  ];
  
  const radarData = useMemo(() => {
    return [
      { subject: 'Availability', A: (stats.online / (stats.total || 1)) * 100, fullMark: 100 },
      { subject: 'Latency', A: Math.max(0, 100 - (stats.avgLatency / 10)), fullMark: 100 },
      { subject: 'Stability', A: 95, fullMark: 100 },
      { subject: 'Coverage', A: (monitors.length / 128) * 100, fullMark: 100 },
      { subject: 'Response', A: 88, fullMark: 100 },
    ];
  }, [stats, monitors]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0a0b0e] z-[100] flex flex-col p-10 overflow-hidden select-none grid-bg"
    >
      <div className="scanline" />
      
      <div className="flex justify-between items-center mb-10 border-b border-primary/20 pb-8 relative">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Activity className="w-14 h-14 text-primary relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                OBSIDIAN <span className="text-primary">FLUX</span>
              </h1>
              <div className="bg-primary/10 border border-primary/40 px-2 py-0.5 rounded text-[10px] text-primary font-bold animate-pulse">
                LIVE NOC MODE (V1)
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-mono text-xs tracking-[0.2em] uppercase">
              <span>Security Node: BUE-P-01</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span>Kernel v4.0.2-STABLE</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="text-primary animate-pulse flex items-center gap-2" onClick={onSwitch}>
                <RefreshCw className="w-3 h-3 cursor-pointer" /> Switch Aesthetic
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <button 
            onClick={onToggleAutoPlay}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl border transition-all font-bold text-xs uppercase tracking-[0.2em]",
              autoPlay 
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                : "bg-[#12141a] border-[#1e2129] text-slate-500 hover:border-primary/50"
            )}
          >
            {autoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {autoPlay ? "Auto-Rotate ON" : "Start Rotation"}
          </button>
          <div className="text-right">
            <div className="text-7xl font-mono text-white leading-none font-bold tracking-tighter mb-1 glow-green">
              {time.toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-[0.4em]">
              {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <button 
            onClick={onExit}
            className="p-4 rounded-xl bg-[#12141a] border border-[#1e2129] text-slate-500 hover:text-white hover:border-primary transition-all group shadow-2xl"
          >
            <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-10 min-h-0">
        <div className="col-span-8 flex flex-col gap-10 min-h-0">
          <div className="bg-[#12141a]/40 border border-[#1e2129] rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
                Infrastructure Pulse Matrix
              </h2>
              <div className="text-[10px] font-mono text-slate-500">
                CAPACITY: 128 ENDPOINTS | SCALE: 1:1
              </div>
            </div>
            <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-3">
              {Array.from({ length: 128 }).map((_, i) => {
                const m = monitors[i];
                const status = m ? m.status : 'empty';
                return (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                    className={cn(
                      "aspect-square rounded-sm relative transition-all duration-700",
                      status === 'online' ? "bg-primary shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                      status === 'offline' ? "bg-error shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse" :
                      status === 'unknown' ? "bg-slate-700 opacity-40" : "bg-[#1e2129] opacity-10"
                    )}
                  >
                    {status === 'online' && <div className="absolute inset-0 bg-primary/20 animate-ping rounded-sm" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-[#12141a]/20 border border-[#1e2129] rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Live Traffic Stream</h2>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded border border-primary/20">HTTP/2</span>
                <span className="text-[10px] font-bold text-tertiary px-2 py-1 bg-tertiary/10 rounded border border-tertiary/20">SSL/TLS</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <motion.div 
                animate={{ y: monitors.length > 5 ? [0, -(monitors.length * 70)] : 0 }}
                transition={{ 
                  duration: Math.max(15, monitors.length * 1.5), 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop"
                }}
                className="space-y-3"
              >
                {[...monitors, ...monitors].map((m, i) => (
                  <div key={`${m.id}-${i}`} className="bg-[#0a0b0e]/60 border border-[#1e2129] p-4 rounded-xl flex items-center justify-between group hover:border-primary transition-colors border-l-4 border-l-primary/50">
                    <div className="flex items-center gap-6">
                      <div className="bg-[#12141a] p-2 rounded-lg border border-[#1e2129]">
                        <Globe className={cn("w-5 h-5", m.status === 'online' ? "text-primary" : "text-error")} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-white uppercase tracking-tight">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{m.url}</div>
                      </div>
                    </div>
                    <div className="flex gap-12 items-center">
                      <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</div>
                        <div className={cn("text-xs font-mono font-bold", m.status === 'online' ? "text-primary" : "text-error")}>
                          {m.status === 'online' ? '● 200 OK' : '× 503 ERR'}
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Latency</div>
                        <div className={cn("text-xl font-mono font-black text-white leading-none")}>
                          {m.latency || '---'}<span className="text-[10px] font-normal ml-0.5 opacity-40">ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0b0e] to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0b0e] to-transparent z-10" />
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-10">
          <div className="grid grid-cols-2 gap-6">
            <StatHUD icon={<ShieldCheck className="text-primary" />} label="Uptime" value={`${Math.round((stats.online / (stats.total || 1)) * 100)}%`} color="primary" />
            <StatHUD icon={<Zap className="text-tertiary" />} label="Avg Speed" value={`${Math.round(stats.avgLatency)}ms`} color="tertiary" />
            <StatHUD icon={<Target className="text-white" />} label="Endpoints" value={stats.total} color="white" />
            <StatHUD icon={<ZapOff className="text-error" />} label="Slowest" value={`${Math.round(stats.maxLatency)}ms`} color="error" />
          </div>

          <div className="flex-1 bg-[#12141a]/40 border border-[#1e2129] rounded-3xl p-8 backdrop-blur-md flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3">
              <Cpu className="w-4 h-4 text-primary" />
              Infrastructure Stability Radar
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#1e2129" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                  <Radar
                    name="System"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#12141a]/40 border border-[#1e2129] rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Resource Allocation</h3>
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={availabilityData}
                      innerRadius="65%"
                      outerRadius="85%"
                      paddingAngle={10}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" stroke="none" />
                      <Cell fill="#f43f5e" stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Operational</span>
                  <span className="text-lg font-mono font-bold text-primary">{stats.online}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" animate={{ width: `${(stats.online / stats.total) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Degraded</span>
                  <span className="text-lg font-mono font-bold text-error">{stats.offline}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-error" animate={{ width: `${(stats.offline / stats.total) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12141a]/40 border border-[#1e2129] rounded-3xl p-8 backdrop-blur-md h-48">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Signal Spectrum Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monitors[0]?.history || []}>
                <defs>
                  <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="step" dataKey="latency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#cyberGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 h-10 border border-primary/20 bg-primary/5 rounded-xl flex items-center px-6 overflow-hidden">
        <div className="flex items-center gap-4 text-primary shrink-0 mr-8 font-bold text-[10px] uppercase tracking-widest border-r border-primary/20 pr-8">
          <Server className="w-4 h-4" />
          System Log
        </div>
        <motion.div 
          animate={{ x: [1000, -2000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-16 text-[11px] font-mono text-slate-400 uppercase tracking-tight"
        >
          <span>[{new Date().toISOString()}] WARN: Node BUE-01 experienced 0.05% packet loss on upstream</span>
          <span>[{new Date().toISOString()}] INFO: Load balancer re-weighted group ARG-CENTRAL</span>
          <span>[{new Date().toISOString()}] CRIT: {stats.slowest?.name || 'Unknown'} latency threshold exceeded: {stats.maxLatency}ms</span>
          <span>[{new Date().toISOString()}] SUCCESS: All global caches synchronized across 12 clusters</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ScreensaverDevView({ monitors, stats, autoPlay, onToggleAutoPlay, onExit, onSwitch }: { monitors: Monitor[], stats: any, autoPlay: boolean, onToggleAutoPlay: () => void, onExit: () => void, onSwitch: () => void }) {
  const [time, setTime] = useState(new Date());
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);

  const selectedMonitor = useMemo(() => 
    monitors.find(m => m.id === selectedMonitorId), 
  [monitors, selectedMonitorId]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMonitorId) setSelectedMonitorId(null);
        else onExit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onExit, selectedMonitorId]);

  const histogramData = useMemo(() => {
    const bins = Array(10).fill(0);
    monitors.forEach(m => {
      if (m.latency !== null) {
        const binIndex = Math.min(Math.floor(m.latency / 100), 9);
        bins[binIndex]++;
      }
    });
    return bins.map((val, i) => ({ range: `${i*100}-${(i+1)*100}ms`, count: val }));
  }, [monitors]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#05070a] z-[100] flex flex-col p-8 font-mono text-cyan-500/80 overflow-hidden select-none border-[20px] border-[#0a0b0e]"
    >
      <div className="flex justify-between items-start mb-8 border-b border-cyan-900/50 pb-6">
        <div className="flex gap-10">
          <div>
            <div className="text-[10px] text-cyan-700 uppercase tracking-[0.4em] mb-1">Architecture Node</div>
            <div className="text-2xl font-bold text-cyan-100 tracking-tighter">DEV-CLUSTER-ALPHA</div>
          </div>
          <div className="w-px h-10 bg-cyan-900/50" />
          <div>
            <div className="text-[10px] text-cyan-700 uppercase tracking-[0.4em] mb-1">Global Health</div>
            <div className="text-2xl font-bold text-white flex items-center gap-3">
              {Math.round((stats.online / stats.total) * 100)}%
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={cn("w-1.5 h-4 rounded-sm", i < (stats.online / stats.total) * 10 ? "bg-cyan-500" : "bg-cyan-950")} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <button 
            onClick={onToggleAutoPlay}
            className={cn(
              "flex items-center gap-3 px-5 py-2 rounded border transition-all font-bold text-[10px] uppercase tracking-widest",
              autoPlay 
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                : "bg-cyan-950/30 border-cyan-900/50 text-cyan-700 hover:text-cyan-400"
            )}
          >
            {autoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {autoPlay ? "CAROUSEL_ACTIVE" : "START_CAROUSEL"}
          </button>
          <div className="text-right">
            <div className="text-5xl font-bold text-white leading-none mb-1 tracking-tighter">
              {time.toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="text-[10px] text-cyan-700 uppercase tracking-[0.5em]">SYSTEM_EPOCH_{Math.floor(time.getTime()/1000)}</div>
          </div>
          <button onClick={onExit} className="p-2 border border-cyan-900 hover:border-cyan-500 transition-all text-cyan-900 hover:text-cyan-100">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0 relative">
        <div className="col-span-3 flex flex-col gap-6 bg-cyan-950/10 border border-cyan-900/30 p-6 rounded-lg">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-2 border-l-2 border-cyan-500 pl-3">Service Dependency Map</h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-[11px]">
            <div className="pl-0 text-cyan-300">▼ root.cluster.production</div>
            <div className="pl-4 text-cyan-500">├─ load_balancer_bue_01</div>
            <div className="pl-8 text-cyan-600 space-y-2">
              {monitors.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedMonitorId(m.id)}
                  className={cn(
                    "flex items-center gap-3 group cursor-pointer hover:bg-cyan-500/10 p-1 rounded transition-colors",
                    selectedMonitorId === m.id && "bg-cyan-500/20 text-white"
                  )}
                >
                  <span className="text-cyan-900">└─</span>
                  <span className={cn(
                    m.status === 'online' ? "text-cyan-400" : "text-amber-500 animate-pulse",
                    selectedMonitorId === m.id && "text-white font-bold"
                  )}>
                    {m.name.toLowerCase().replace(/\s+/g, '_')}.service
                  </span>
                  <Activity className={cn("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", selectedMonitorId === m.id && "opacity-100")} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-8 min-h-0">
          <div className="h-1/2 bg-cyan-950/10 border border-cyan-900/30 p-6 rounded-lg">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-6">Latency Distribution (Histogram)</h2>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#083344" vertical={false} />
                <XAxis dataKey="range" stroke="#083344" fontSize={10} />
                <YAxis stroke="#083344" fontSize={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                  contentStyle={{ backgroundColor: '#05070a', border: '1px solid #083344', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" opacity={0.6} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 bg-black border border-cyan-900/50 p-4 rounded font-mono text-[10px] overflow-hidden relative">
            <div className="absolute top-2 right-4 text-cyan-900 animate-pulse uppercase tracking-[0.3em]">Live_Telemetry_Stream</div>
            <div className="space-y-1">
              {Array.from({ length: 20 }).map((_, i) => {
                const randomMon = monitors[Math.floor(Math.random() * monitors.length)];
                return (
                  <div key={i} className="flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
                    <span className="text-cyan-900">[{new Date().toISOString().split('T')[1]}]</span>
                    <span className="text-cyan-700">GET</span>
                    <span className="text-cyan-100">{randomMon?.url || '---'}</span>
                    <span className="text-cyan-500">{randomMon?.latency || 0}ms</span>
                    <span className="text-cyan-900">200_OK_SUCCESS</span>
                  </div>
                );
              })}
              <motion.div 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-cyan-500 inline-block"
              />
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-6 bg-cyan-950/10 border border-cyan-900/30 p-6 rounded-lg overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!selectedMonitor ? (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-4">Core_Kernel_Metrics</h2>
                <div className="space-y-6">
                  <DevStat label="Average_Response" value={`${Math.round(stats.avgLatency)}ms`} unit="latency" />
                  <DevStat label="Peak_Response" value={`${Math.round(stats.maxLatency)}ms`} unit="max_lat" />
                  <DevStat label="Operational_Nodes" value={stats.online} unit="nodes" />
                  <DevStat label="Degraded_Nodes" value={stats.offline} unit="errors" color="amber" />
                </div>

                <div className="mt-auto border-t border-cyan-900/50 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] uppercase text-cyan-800">Resource_Saturation</span>
                    <span className="text-[10px] text-cyan-400">74.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-cyan-950 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '74.2%' }}
                      className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-white">Node_Telemetry_Detail</h2>
                  <button onClick={() => setSelectedMonitorId(null)} className="text-cyan-700 hover:text-white transition-colors">
                    [CLOSE_X]
                  </button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="bg-black/40 border border-cyan-900/50 p-4 rounded">
                    <div className="text-[9px] text-cyan-700 uppercase mb-2">Service_Identity</div>
                    <div className="text-sm font-bold text-cyan-100 mb-1">{selectedMonitor.name}</div>
                    <div className="text-[10px] text-cyan-600 break-all">{selectedMonitor.url}</div>
                  </div>

                  <div className="bg-black/40 border border-cyan-900/50 p-4 rounded">
                    <div className="text-[9px] text-cyan-700 uppercase mb-2">Health_Descriptor</div>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-[0_0_8px]",
                        selectedMonitor.status === 'online' ? "bg-cyan-500 shadow-cyan-500" : "bg-amber-500 shadow-amber-500"
                      )} />
                      <div className="text-lg font-bold text-white uppercase">{selectedMonitor.status}</div>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-cyan-900/50 p-4 rounded flex-1">
                    <div className="text-[9px] text-cyan-700 uppercase mb-4">Latency_History (24H)</div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedMonitor.history}>
                          <Area 
                            type="step" 
                            dataKey="latency" 
                            stroke="#06b6d4" 
                            fill="#06b6d4" 
                            fillOpacity={0.1} 
                            strokeWidth={1} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="text-[9px] text-cyan-900 mt-4 leading-relaxed">
                    FETCH_SIGNAL: {new Date(selectedMonitor.lastCheck || '').toLocaleString()}<br/>
                    NODE_AFFINITY: BUE-P-01<br/>
                    MTU_SIZE: 1500<br/>
                    PROXIED: TRUE
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center text-[9px] text-cyan-900 uppercase tracking-[0.5em]">
        <div>Obsidian_Monitor // Kernel_v4.0.2 // Build_2026.05.21</div>
        <div className="flex gap-8">
          <span>Mem: 4.2GB / 16GB</span>
          <span>CPU: 12.4%</span>
          <span>Net: 842Mbps</span>
        </div>
      </div>
    </motion.div>
  );
}

function ScreensaverDashboardView({ monitors, stats, autoPlay, onToggleAutoPlay, onExit, onSwitch }: { monitors: Monitor[], stats: any, autoPlay: boolean, onToggleAutoPlay: () => void, onExit: () => void, onSwitch: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onExit]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0a0b0e] z-[100] flex flex-col p-10 overflow-hidden select-none grid-bg"
    >
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <LayoutDashboard className="w-12 h-12 text-white" />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Infrastructure <span className="text-slate-500">Overview</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <button 
            onClick={onToggleAutoPlay}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl border transition-all font-bold text-xs uppercase tracking-[0.2em]",
              autoPlay ? "bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "bg-[#12141a] border-[#1e2129] text-slate-500"
            )}
          >
            {autoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {autoPlay ? "ROULETTE ACTIVE" : "START ROULETTE"}
          </button>
          <div className="text-right">
            <div className="text-6xl font-mono text-white leading-none font-bold tracking-tighter">{time.toLocaleTimeString([], { hour12: false })}</div>
          </div>
          <button onClick={onExit} className="p-4 rounded-xl bg-[#12141a] border border-[#1e2129] text-slate-500 hover:text-white"><X className="w-8 h-8" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <DashboardView monitors={monitors} stats={stats} onCheck={() => {}} />
      </div>
    </motion.div>
  );
}

function ScreensaverAnalyticsView({ monitors, stats, autoPlay, onToggleAutoPlay, onExit, onSwitch }: { monitors: Monitor[], stats: any, autoPlay: boolean, onToggleAutoPlay: () => void, onExit: () => void, onSwitch: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onExit]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0a0b0e] z-[100] flex flex-col p-10 overflow-hidden select-none grid-bg"
    >
      <div className="flex justify-between items-center mb-10 border-b border-tertiary/20 pb-8">
        <div className="flex items-center gap-6">
          <BarChart3 className="w-12 h-12 text-tertiary" />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Deep <span className="text-tertiary">Analytics</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <button 
            onClick={onToggleAutoPlay}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl border transition-all font-bold text-xs uppercase tracking-[0.2em]",
              autoPlay ? "bg-tertiary/20 border-tertiary text-tertiary shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-[#12141a] border-[#1e2129] text-slate-500"
            )}
          >
            {autoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {autoPlay ? "AUTO-SCROLL ON" : "START SCROLL"}
          </button>
          <div className="text-right text-6xl font-mono text-white font-bold tracking-tighter">{time.toLocaleTimeString([], { hour12: false })}</div>
          <button onClick={onExit} className="p-4 rounded-xl bg-[#12141a] border border-[#1e2129] text-slate-500 hover:text-white"><X className="w-8 h-8" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <AnalyticsView monitors={monitors} stats={stats} />
      </div>
    </motion.div>
  );
}

function StatHUD({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    primary: "text-primary border-primary/20 shadow-primary/10",
    tertiary: "text-tertiary border-tertiary/20 shadow-tertiary/10",
    error: "text-error border-error/20 shadow-error/10",
    white: "text-white border-white/20 shadow-white/5"
  };

  return (
    <div className={cn(
      "p-6 rounded-3xl bg-[#12141a]/60 border backdrop-blur-md relative overflow-hidden group hover:scale-105 transition-all duration-300",
      colors[color]
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-mono font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function DevStat({ label, value, unit, color = 'cyan' }: { label: string, value: string | number, unit: string, color?: string }) {
  const colors: any = {
    cyan: "text-cyan-400",
    amber: "text-amber-500"
  };
  
  return (
    <div className="group">
      <div className="text-[9px] text-cyan-900 uppercase tracking-widest mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className={cn("text-2xl font-bold tracking-tighter", colors[color])}>{value}</div>
        <div className="text-[9px] text-cyan-900">[{unit}]</div>
      </div>
      <div className={cn("h-0.5 w-0 group-hover:w-full transition-all duration-500", color === 'cyan' ? 'bg-cyan-900' : 'bg-amber-900')} />
    </div>
  );
}
