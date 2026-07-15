import React from 'react';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeProvider';
import { 
  Users, Stethoscope, CalendarDays, ArrowUpRight, 
  TrendingUp, Activity, CheckCircle2, ShieldAlert,
  Clock, Plus, Check
} from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const stats = [
    { 
      name: 'Total Managed Patients', 
      value: '1,245', 
      change: '+18 this week', 
      changeType: 'positive',
      icon: Stethoscope,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    { 
      name: 'Active Clinical Staff', 
      value: '84', 
      change: '2 on leave', 
      changeType: 'neutral',
      icon: Users,
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    { 
      name: 'Appointments Today', 
      value: '32', 
      change: '4 slots open', 
      changeType: 'positive',
      icon: CalendarDays,
      bg: 'bg-amber-50 text-amber-600 border-amber-100'
    },
  ];

  const logs = [
    { message: 'Dr. Sarah Connor registered patient "John Doe" (Record #10294)', type: 'registration', time: '12 mins ago' },
    { message: 'Lab Results uploaded for patient "Bruce Wayne"', type: 'lab', time: '45 mins ago' },
    { message: 'Billing settlement processed for Invoice #INV-29402', type: 'billing', time: '1 hour ago' },
    { message: 'MFA configuration verified for Staff Member "Alice Johnson"', type: 'security', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      
      {/* Welcome Hero banner */}
      <div 
        className="rounded-3xl p-8 text-white relative overflow-hidden shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${theme?.secondaryColor || 'var(--color-secondary)'}, ${theme?.primaryColor || 'var(--color-primary)'})`
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Live Facility Console
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome to {user?.hospital?.hospitalName || 'your dashboard'}
          </h2>
          <p className="text-white/85 text-xs md:text-sm font-semibold max-w-xl leading-relaxed">
            This dashboard adaptively configures its themes, layouts, and typography to align with your organization branding template.
          </p>
        </div>
      </div>
      
      {/* Statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div 
                className={`h-11 w-11 rounded-xl flex items-center justify-center border ${stat.bg}`}
              >
                <stat.icon className="h-5.5 w-5.5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.change}</span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{stat.name}</span>
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 block">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Mock Analytics Panel */}
        <div className="xl:col-span-2 bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Weekly Patient Intake</h3>
              <p className="text-xs text-slate-400 mt-0.5">Summary of inpatient and outpatient registries</p>
            </div>
            <span className="text-xs text-theme-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
              View Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="h-52 flex items-end justify-between px-6 border-b border-theme-border/50 pb-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pt-1 pb-1 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-px border-b border-dashed border-theme-border/40" />
              ))}
            </div>
            
            <div className="w-8 bg-theme-primary/10 hover:bg-theme-primary/20 rounded-t-lg transition-all h-[30%]" />
            <div className="w-8 bg-theme-primary/10 hover:bg-theme-primary/20 rounded-t-lg transition-all h-[55%]" />
            <div className="w-8 bg-theme-primary/15 hover:bg-theme-primary/25 rounded-t-lg transition-all h-[40%]" />
            <div className="w-8 bg-theme-primary/15 hover:bg-theme-primary/25 rounded-t-lg transition-all h-[75%]" />
            <div className="w-8 bg-theme-primary/20 hover:bg-theme-primary/30 rounded-t-lg transition-all h-[60%]" />
            <div className="w-8 bg-theme-primary hover:opacity-90 rounded-t-lg transition-all h-[90%] shadow-md shadow-theme-primary/20" />
          </div>
          <div className="flex justify-between px-6 mt-3 text-[10px] font-bold text-slate-400">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>TODAY</span>
          </div>
        </div>

        {/* Real-time Logs & Facility Status */}
        <div className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border flex flex-col justify-between gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-800">Recent Facility Logs</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <div className="h-6.5 w-6.5 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-700">{log.message}</p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-theme-border/60 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-theme-warning shrink-0 mt-0.5" style={{ color: theme?.warningColor || 'var(--color-warning)' }} />
            <p className="text-[10px] font-bold text-slate-500 leading-normal">
              For security auditing, all clinical activity records are timestamped. Contact your platform coordinator for configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
