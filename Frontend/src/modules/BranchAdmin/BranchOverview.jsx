import React from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Users, Stethoscope, Calendar, Activity, 
  ArrowUpRight, Clock, MapPin, Building2,
  Plus, FileText, Settings, ChevronRight
} from "lucide-react";
import Button from "../../core/components/ui/Button";

export default function BranchOverview() {
  const { user } = useAuth();

  // MOCK DATA for visually stunning placeholders until API is fully wired
  const stats = [
    { label: "Total Doctors", value: "42", trend: "+12%", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Patients", value: "1,248", trend: "+5%", icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { label: "Today's Appointments", value: "86", trend: "-2%", icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Active Staff", value: "115", trend: "+1%", icon: Activity, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const recentActivities = [
    { id: 1, action: "New Doctor Onboarded", subject: "Dr. Sarah Jenkins", time: "2 hours ago", status: "completed" },
    { id: 2, action: "Department Added", subject: "Cardiology Unit B", time: "5 hours ago", status: "completed" },
    { id: 3, action: "Equipment Maintenance", subject: "MRI Scanner #2", time: "1 day ago", status: "pending" },
    { id: 4, action: "Staff Training", subject: "Emergency Protocols", time: "2 days ago", status: "completed" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome back, {user?.firstName || "Admin"}! 👋
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Building2 size={16} />
            Branch Administration Dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-all shadow-sm">
            <Plus size={18} /> New Appointment
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 transition-all">
            <FileText size={18} /> Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={`font-medium flex items-center ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowUpRight size={16} className="rotate-90" />}
                {stat.trend}
              </span>
              <span className="text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Table (Takes up 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Branch Activity</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{activity.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {activity.time}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Info (Takes up 1/3) */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Stethoscope size={18} />
                  </div>
                  <span className="font-medium text-sm">Manage Doctors</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-700 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Users size={18} />
                  </div>
                  <span className="font-medium text-sm">Manage Patients</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 text-gray-700 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Settings size={18} />
                  </div>
                  <span className="font-medium text-sm">Branch Settings</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">Access the comprehensive guide for managing your branch operations effectively.</p>
              <button className="bg-white text-blue-600 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                View Documentation
              </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

        </div>
      </div>
    </div>
  );
}