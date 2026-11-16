import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import KioskScreen from './components/KioskScreen';
import EmployeePortal from './components/EmployeePortal';
import ManagerPortal from './components/ManagerPortal';
import AuthModal from './components/AuthModal';
import { ShieldAlert, LogIn, ArrowRight, LogOut, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'employee', 'manager', 'kiosk'

  // Khởi tạo user & token từ localStorage hoặc null nếu chưa đăng nhập
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smarttime_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smarttime_token') || localStorage.getItem('token') || '';
  });

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Xử lý khi đăng nhập hoặc đăng ký thành công từ AuthModal
  const handleAuthSuccess = (authData) => {
    const newUser = {
      id: authData.employeeId,
      employeeId: authData.employeeId,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
      employeeCode: authData.employeeCode,
      title: authData.role === 'HR_ADMIN' ? 'HR Administrator' : authData.role === 'MANAGER' ? 'Quản lý Đội ngũ' : 'Nhân viên Chính thức'
    };
    setCurrentUser(newUser);
    setToken(authData.token);
    localStorage.setItem('smarttime_user', JSON.stringify(newUser));
    localStorage.setItem('smarttime_token', authData.token);
    localStorage.setItem('token', authData.token);

    // Tự động chuyển đến cổng thích hợp
    if (authData.role === 'MANAGER' || authData.role === 'HR_ADMIN') {
      setActiveTab('manager');
    } else {
      setActiveTab('employee');
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('smarttime_user');
    localStorage.removeItem('smarttime_token');
    localStorage.removeItem('token');
    setActiveTab('home');
  };

  // Mở Auth Modal với chế độ chỉ định
  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Nếu đang ở chế độ Kiosk Fullscreen (Công cộng)
  if (activeTab === 'kiosk') {
    return <KioskScreen onExit={() => setActiveTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TAB TRANG CHỦ */}
        {activeTab === 'home' && (
          <LandingPage
            onGoToKiosk={() => setActiveTab('kiosk')}
            onGoToEmployee={() => {
              if (!currentUser) handleOpenAuthModal('login');
              else setActiveTab('employee');
            }}
            onGoToManager={() => {
              if (!currentUser) handleOpenAuthModal('login');
              else setActiveTab('manager');
            }}
            onOpenAuthModal={handleOpenAuthModal}
            currentUser={currentUser}
          />
        )}

        {/* TAB CỔNG NHÂN VIÊN (Yêu cầu đăng nhập) */}
        {activeTab === 'employee' && (
          currentUser ? (
            <EmployeePortal currentUser={currentUser} token={token} />
          ) : (
            <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <LogIn className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Yêu Cầu Đăng Nhập</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vui lòng đăng nhập tài khoản nhân viên để thực hiện chấm công, nộp đơn từ và xem bảng công cá nhân.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                >
                  Đăng Nhập Ngay
                </button>
                <button
                  onClick={() => handleOpenAuthModal('register')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Chưa có tài khoản? Đăng Ký
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB CỔNG QUẢN LÝ / HR (Yêu cầu vai trò MANAGER hoặc HR_ADMIN) */}
        {activeTab === 'manager' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Yêu Cầu Quyền Quản Trị</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khu vực dành riêng cho cấp Quản lý (MANAGER) hoặc Ban Nhân sự (HR_ADMIN). Vui lòng đăng nhập để tiếp tục.
              </p>
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md transition"
              >
                Đăng Nhập Tài Khoản Quản Lý / HR
              </button>
            </div>
          ) : (currentUser.role === 'EMPLOYEE') ? (
            /* Role Guard Warning */
            <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-amber-200 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Truy Cập Bị Hạn Chế (403 Forbidden)</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Bạn đang đăng nhập với tài khoản <strong>{currentUser.fullName}</strong> có vai trò 
                  <span className="inline-block mx-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                    {currentUser.role}
                  </span>. 
                  <br/>
                  Cổng này yêu cầu vai trò <strong>MANAGER</strong> hoặc <strong>HR_ADMIN</strong> để phê duyệt đơn từ, quản lý nhân sự và khóa bảng lương.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-500">
                  Để truy cập cổng này, vui lòng đăng nhập với tài khoản quản lý hoặc liên hệ bộ phận IT / HR để được cấp quyền.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      handleLogout();
                      handleOpenAuthModal('login');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Đăng Nhập Tài Khoản Khác
                  </button>
                  <button
                    onClick={() => setActiveTab('employee')}
                    className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Về Cổng Nhân Viên
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ManagerPortal
              currentUser={currentUser}
              token={token}
              setCurrentUser={setCurrentUser}
            />
          )
        )}
      </main>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © 2026 <strong>SmartTimeChecking</strong>. Hệ thống Quản trị Chấm công & Quản lý Đơn từ Nội bộ.
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Dynamic QR 5s</span>
            <span>•</span>
            <span>Device Binding 1-1</span>
            <span>•</span>
            <span>Keycloak IAM Synced</span>
            <span>•</span>
            <span>Retroactive Payroll Closing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
