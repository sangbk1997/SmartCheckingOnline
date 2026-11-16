import React, { useState } from 'react';
import { 
  Clock, ShieldCheck, User, Users, Tv, CheckCircle2, ChevronDown, 
  LogIn, UserPlus, LogOut, Sparkles, AlertCircle 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  setCurrentUser, 
  usersList = [], 
  onOpenAuthModal, 
  onLogout 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavClick = (tab) => {
    if ((tab === 'employee' || tab === 'manager') && !currentUser) {
      onOpenAuthModal('login');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <nav className="sticky top-0 z-40 glass-card bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
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
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => handleNavClick('employee')}
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
              onClick={() => handleNavClick('manager')}
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
              onClick={() => handleNavClick('kiosk')}
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

          {/* User Auth Section */}
          <div className="flex items-center space-x-2.5">
            {currentUser ? (
              /* User Profile & Role Dropdown */
              <div className="relative">
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser?.fullName || 'Người dùng'}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold uppercase flex items-center gap-1">
                      {currentUser?.role === 'HR_ADMIN' ? 'HR Admin' : currentUser?.role === 'MANAGER' ? 'Tech Lead' : 'Nhân viên'}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {currentUser.role} • {currentUser.employeeCode || 'EMP'}
                      </div>
                    </div>

                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Chuyển nhanh vai trò thử nghiệm
                    </div>
                    {usersList.map((u) => (
                      <button
                        key={u.email}
                        onClick={() => {
                          setCurrentUser(u);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                          currentUser.email === u.email ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-xs">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400">{u.role}</div>
                        </div>
                        {currentUser.email === u.email && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Đăng xuất khỏi hệ thống
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Auth Buttons */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng Nhập
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng Ký
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Submenu */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button 
            onClick={() => handleNavClick('home')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'home' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Trang chủ
          </button>
          <button 
            onClick={() => handleNavClick('employee')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'employee' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Nhân viên
          </button>
          <button 
            onClick={() => handleNavClick('manager')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'manager' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Quản lý / HR
          </button>
          <button 
            onClick={() => handleNavClick('kiosk')} 
            className={`py-1 px-2.5 rounded-lg font-medium ${activeTab === 'kiosk' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
          >
            Kiosk QR
          </button>
        </div>
      </div>
    </nav>
  );
}
