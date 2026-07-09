import React from 'react';
import { Building2, Users, Banknote, Cloud, Plus, Radio, FileText, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Overview() {
  const stats = [
    { name: 'Total Tenants', value: '142', subtext: 'hospitals', change: '+4 this month', changeType: 'positive', icon: Building2 },
    { name: 'Active Users', value: '48.5k', subtext: '', change: '12.4k new', changeType: 'neutral', icon: Users },
    { name: 'Monthly Revenue', value: '$1.24M', subtext: '', change: '↑ 8.2%', changeType: 'positive', icon: Banknote },
    { name: 'System Uptime', value: '99.99%', subtext: '', change: 'Target 99.9%', changeType: 'neutral-gray', icon: Cloud },
  ];

  const quickActions = [
    { title: 'Add New Tenant', subtitle: 'HOSPITAL ONBOARDING', icon: Plus, color: 'text-teal-700', bg: 'bg-teal-50' },
    { title: 'Global Broadcast', subtitle: 'MAINTENANCE / ALERTS', icon: Radio, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Generate Audit Report', subtitle: 'COMPLIANCE / SECURITY', icon: FileText, color: 'text-gray-700', bg: 'bg-gray-100' },
    { title: 'Manage Licenses', subtitle: 'SUBSCRIPTION LOGIC', icon: Key, color: 'text-teal-700', bg: 'bg-teal-50' },
  ];

  const tenants = [
    { id: 'MA', name: 'Mayo Clinic Apex', branches: 14, plan: 'PLATINUM', planColor: 'text-amber-700 bg-amber-100', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500', time: 'Just now' },
    { id: 'SH', name: 'St. Helios Medical', branches: 6, plan: 'GOLD', planColor: 'text-blue-700 bg-blue-100', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500', time: '4 mins ago' },
    { id: 'KC', name: "King's Cross Health", branches: 22, plan: 'PLATINUM', planColor: 'text-amber-700 bg-amber-100', status: 'Suspended', statusColor: 'text-red-700 bg-red-100', dot: 'bg-red-500', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto bg-slate-50/50 min-h-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-teal-700">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                ${stat.changeType === 'positive' ? 'bg-teal-50 text-teal-700' : 
                  stat.changeType === 'neutral' ? 'bg-teal-50 text-teal-700' : 
                  'bg-gray-100 text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                {stat.subtext && <span className="text-sm text-gray-500 font-medium">{stat.subtext}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Chart Mock */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">Global Revenue Growth</h2>
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-semibold bg-white text-gray-900 rounded shadow-sm">6 Months</button>
                <button className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-900">1 Year</button>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between px-4 sm:px-12 relative border-b border-gray-100 pb-2">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-2 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-px border-b border-dashed border-gray-200" />
                ))}
              </div>
              
              {/* Bars */}
              <div className="relative w-12 h-[20%] bg-gray-200 rounded-t-sm" />
              <div className="relative w-12 h-[35%] bg-gray-200 rounded-t-sm" />
              <div className="relative w-12 h-[45%] bg-gray-300 rounded-t-sm" />
              <div className="relative w-12 h-[60%] bg-gray-400 rounded-t-sm" />
              <div className="relative w-12 h-[75%] bg-gray-400 rounded-t-sm" />
              <div className="relative w-12 h-[95%] bg-teal-700 rounded-t-sm" />
            </div>
            <div className="flex justify-between px-4 sm:px-12 mt-4 text-xs font-semibold text-gray-400">
              <span>JAN</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
            </div>
          </div>

          {/* Active Tenants Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-900">Active Tenants</h2>
              <button className="text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors">View All Tenants</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Branches</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenants.map((tenant, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200/60 flex items-center justify-center text-xs font-bold text-gray-600">
                            {tenant.id}
                          </div>
                          <div className="ml-4 font-bold text-sm text-gray-900">
                            {tenant.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {tenant.branches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded ${tenant.planColor}`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${tenant.statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.dot}`} />
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <div key={idx} className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-gray-900">{action.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">{action.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Infrastructure */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Cloud Infrastructure</h2>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="text-gray-900">42%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-teal-700 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600">Memory Utilization</span>
                  <span className="text-gray-900">68%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-teal-700 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600">Storage Pool</span>
                  <span className="text-gray-900">81%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 flex overflow-hidden">
                  <div className="bg-amber-500 h-1.5" style={{ width: '81%' }}></div>
                  <div className="bg-gray-100 h-1.5 flex-1"></div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200/60 flex items-start">
              <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0 mr-3" />
              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                All 14 node clusters operating within parameters.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}