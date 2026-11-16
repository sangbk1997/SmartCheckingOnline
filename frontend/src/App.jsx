import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import KioskScreen from './components/KioskScreen';
import EmployeePortal from './components/EmployeePortal';
import ManagerPortal from './components/ManagerPortal';

const USERS = [
  {
    email: 'dev@congty.com',
    fullName: 'Lê Hoàng Nam',
    title: 'Software Engineer (Kỹ thuật)',
    role: 'EMPLOYEE',
    employeeCode: 'IT002'
  },
  {
    email: 'tuan.pham@smartcorp.com',
    fullName: 'Phạm Minh Tuấn',
    title: 'Software Dev Lead (Trưởng nhóm)',
    role: 'MANAGER',
    employeeCode: 'DEV001'
  },
  {
    email: 'lead@congty.com',
    fullName: 'Trần Văn Mạnh',
    title: 'Tech Director (Giám đốc Khối CN)',
    role: 'MANAGER',
    employeeCode: 'IT001'
  },
  {
    email: 'hr@congty.com',
    fullName: 'Nguyễn Thị Thu',
    title: 'HR Manager (Trưởng phòng NS)',
    role: 'HR_ADMIN',
    employeeCode: 'HR001'
  },
  {
    email: 'mai.hoang@smartcorp.com',
    fullName: 'Hoàng Thị Mai',
    title: 'HR C&B Specialist (Chuyên viên NS)',
    role: 'HR_ADMIN',
    employeeCode: 'HR002'
  },
  {
    email: 'ceo@smartcorp.com',
    fullName: 'Trần Quốc Bảo',
    title: 'CEO (Tổng Giám Đốc)',
    role: 'HR_ADMIN',
    employeeCode: 'CEO001'
  },
  {
    email: 'huy.ngo@smartcorp.com',
    fullName: 'Ngô Quốc Huy',
    title: 'Sales Manager (Trưởng phòng KD)',
    role: 'MANAGER',
    employeeCode: 'SAL001'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'employee', 'manager', 'kiosk'
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [token, setToken] = useState('');

  // Tự động lấy JWT token khi đổi người dùng
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/v1/auth/login-dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email })
        });
        const data = await res.json();
        if (data.success && data.data?.token) {
          setToken(data.data.token);
        }
      } catch (err) {
        console.error("Lỗi lấy JWT:", err);
      }
    };
    fetchToken();
  }, [currentUser]);

  // Nếu đang ở chế độ Kiosk Fullscreen
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
        usersList={USERS}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'home' && (
          <LandingPage
            onGoToKiosk={() => setActiveTab('kiosk')}
            onGoToEmployee={() => setActiveTab('employee')}
            onGoToManager={() => setActiveTab('manager')}
          />
        )}

        {activeTab === 'employee' && (
          <EmployeePortal currentUser={currentUser} token={token} />
        )}

        {activeTab === 'manager' && (
          <ManagerPortal
            currentUser={currentUser}
            token={token}
            setCurrentUser={setCurrentUser}
            usersList={USERS}
          />
        )}
      </main>

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
            <span>Emergency Selfie GPS</span>
            <span>•</span>
            <span>Retroactive Payroll Closing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

