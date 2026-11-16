import React from 'react';
import { Clock, ShieldCheck, User, Users, Tv, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, usersList }) {
  return (
    <nav className="sticky top-0 z-50 glass-card bg-white/90 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                SmartTime<span className="text-indigo-600 font-extrabold">Checking</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  v1.0 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hệ thống Chấm công Đa lớp Doanh nghiệp</p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'employee'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Nhân viên
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'manager'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Quản lý / HR
            </button>
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'kiosk'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Màn hình Kiosk QR
            </button>
          </div>

          {/* Quick User Switcher */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser?.fullName || 'Người dùng'}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold uppercase">
                    {currentUser?.role === 'HR_ADMIN' ? 'HR Admin' : currentUser?.role === 'MANAGER' ? 'Tech Lead' : 'Nhân viên'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Chuyển nhanh vai trò thử nghiệm
                </div>
                {usersList.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                      currentUser.email === u.email ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500">{u.title} ({u.role})</div>
                    </div>
                    {currentUser.email === u.email && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'home' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Trang chủ
          </button>
          <button 
            onClick={() => setActiveTab('employee')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'employee' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Nhân viên
          </button>
          <button 
            onClick={() => setActiveTab('manager')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'manager' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Quản lý / HR
          </button>
          <button 
            onClick={() => setActiveTab('kiosk')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'kiosk' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Kiosk QR
          </button>
        </div>
      </div>
    </nav>
  );
}

