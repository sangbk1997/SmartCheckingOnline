import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Building, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, UserCheck 
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', usersList = [] }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('EMPLOYEE');
  const [regDepartmentId, setRegDepartmentId] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Departments List
  const [departments, setDepartments] = useState([]);
  
  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  // Tải danh sách phòng ban cho dropdown Đăng ký
  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/departments')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setDepartments(data.data);
            if (data.data.length > 0 && !regDepartmentId) {
              setRegDepartmentId(data.data[0].id);
            }
          }
        })
        .catch(err => console.error("Lỗi tải phòng ban:", err));
    }
  }, [isOpen]);

  const demoUsers = usersList.length > 0
    ? [
        usersList.find(u => u.role === 'EMPLOYEE') || { email: 'dev@congty.com', fullName: 'Lê Hoàng Nam', role: 'EMPLOYEE' },
        usersList.find(u => u.role === 'MANAGER') || { email: 'lead@congty.com', fullName: 'Trần Văn Mạnh', role: 'MANAGER' },
        usersList.find(u => u.role === 'HR_ADMIN') || { email: 'hr@congty.com', fullName: 'Nguyễn Thị Thu', role: 'HR_ADMIN' }
      ]
    : [
        { email: 'dev@congty.com', fullName: 'Lê Hoàng Nam', role: 'EMPLOYEE' },
        { email: 'lead@congty.com', fullName: 'Trần Văn Mạnh', role: 'MANAGER' },
        { email: 'hr@congty.com', fullName: 'Nguyễn Thị Thu', role: 'HR_ADMIN' }
      ];

  if (!isOpen) return null;

  // Xử lý Đăng Nhập
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail.trim(),
          password: loginPassword 
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          onAuthSuccess(data.data);
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập nhanh 1-Click bằng tài khoản mẫu
  const handleQuickLogin = (email) => {
    setLoginEmail(email);
    setLoginPassword('Password@123');
    setErrorMsg('');
    setLoading(true);

    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.token) {
          setSuccessMsg(`Đăng nhập thành công với tài khoản ${data.data.fullName}!`);
          setTimeout(() => {
            onAuthSuccess(data.data);
            onClose();
          }, 500);
        } else {
          setErrorMsg(data.message || 'Không thể đăng nhập tài khoản mẫu.');
        }
      })
      .catch(() => setErrorMsg('Lỗi kết nối máy chủ.'))
      .finally(() => setLoading(false));
  };

  // Xử lý Đăng Ký Tài Khoản Mới
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (regPassword && regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          departmentId: regDepartmentId
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        setSuccessMsg('Đăng ký tài khoản thành công! Tự động đăng nhập...');
        setTimeout(() => {
          onAuthSuccess(data.data);
          onClose();
        }, 700);
      } else {
        setErrorMsg(data.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Switcher Tabs */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 pb-5">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">SmartTimeChecking</h3>
              <p className="text-[11px] text-indigo-200">Xác thực Định danh & Phân quyền RBAC</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Đăng Ký Tài Khoản
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Doanh Nghiệp</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ví dụ: dev@congty.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật Khẩu</label>
                  <span className="text-[10px] text-slate-400">Mặc định: Password@123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Demo Accounts */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Đăng Nhập Nhanh 1-Click (Tài Khoản Mẫu)
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {demoUsers.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleQuickLogin(u.email)}
                      className="w-full px-3 py-2 text-left text-xs rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <span className="font-bold text-slate-800 group-hover:text-indigo-700">{u.fullName}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">({u.email})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'HR_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên Nhân Viên</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="ví dụ: Nguyễn Văn An"
                    required
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Công Ty</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="an.nguyen@congty.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng Ban</label>
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                    {departments.length === 0 && (
                      <option value="">Khối Công nghệ Thông tin</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vai Trò (Role)</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition font-medium"
                  >
                    <option value="EMPLOYEE">Nhân viên (EMPLOYEE)</option>
                    <option value="MANAGER">Quản lý (MANAGER)</option>
                    <option value="HR_ADMIN">HR Quản trị (HR_ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Xác Nhận Mật Khẩu</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Tài khoản đăng ký mới sẽ được tự động kích hoạt quỹ phép năm 12 ngày chuẩn.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {loading ? 'Đang tạo hồ sơ...' : 'Đăng Ký & Đăng Nhập Ngay'}
                <UserCheck className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
