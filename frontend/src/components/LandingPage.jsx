import React from 'react';
import { 
  ShieldCheck, QrCode, Smartphone, Wifi, Sparkles, ArrowRight, 
  CalendarClock, Lock, CheckCircle, FileText, AlertTriangle, Play, 
  LogIn, UserPlus, Users, CheckCircle2 
} from 'lucide-react';

export default function LandingPage({ 
  onGoToKiosk, 
  onGoToEmployee, 
  onGoToManager, 
  onOpenAuthModal, 
  currentUser 
}) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Kiến trúc Bảo mật Xác thực Đa lớp 4.0
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Chấm công Thông minh, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-violet-200 to-amber-200">
              Chống Gian lận Tuyệt đối
            </span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Giải pháp chấm công Website/PWA ứng dụng mã <strong>Dynamic QR Code xoay 5s</strong>, 
            kết hợp khóa thiết bị cá nhân <strong>(Device Binding 1-1)</strong>, 
            kiểm soát <strong>IP mạng văn phòng</strong> và phương án <strong>Selfie khẩn cấp</strong> khi mất điện.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 group"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng Nhập Vào Hệ Thống
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Đăng Ký Thành Viên Mới
                </button>
              </>
            ) : (
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Đã đăng nhập: <span className="text-amber-300">{currentUser.fullName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-400 text-slate-900">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-200">{currentUser.email}</div>
                </div>
              </div>
            )}

            <button
              onClick={onGoToKiosk}
              className="px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-indigo-900 group-hover:scale-110 transition-transform" />
              Màn hình Kiosk TV (QR 5s)
            </button>
            <button
              onClick={onGoToEmployee}
              className="px-5 py-3 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              Cổng Nhân viên
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToManager}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Cổng Quản lý / HR
            </button>
          </div>
        </div>

        {/* Floating Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-indigo-700/50">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">5 Giây</div>
            <div className="text-xs text-indigo-200 mt-0.5">Chu kỳ xoay mã Dynamic QR</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">100%</div>
            <div className="text-xs text-indigo-200 mt-0.5">Khóa thiết bị 1 tài khoản</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">&lt; 50ms</div>
            <div className="text-xs text-indigo-200 mt-0.5">Tốc độ ghi nhận chấm công</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-300">ACID</div>
            <div className="text-xs text-indigo-200 mt-0.5">Khóa bảng công & Hồi tố kỳ sau</div>
          </div>
        </div>
      </div>

      {/* Core Security Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Chiến lược Bảo vệ Đa tầng Toàn diện
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Loại bỏ triệt để mọi hành vi gian lận chấm công, chia sẻ mã QR qua Zalo, đổi điện thoại hoặc Fake GPS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dynamic QR Code (Kiosk)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mã QR đổi liên tục mỗi 5 giây bằng chữ ký HMAC-SHA256, tự động hủy trên Redis ngay sau 1 lần quét (`GETDEL`), chống hoàn toàn việc chụp màn hình gửi đồng nghiệp quét hộ.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Hardware Binding (1-1)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khóa cứng tài khoản nhân viên vào phần cứng thiết bị di động duy nhất qua Device Fingerprint. Chặn đứng tuyệt đối việc 1 nhân viên cầm nhiều điện thoại chấm công cho cả phòng.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Văn Phòng & Chấm Khẩn Cấp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kiểm soát IP Subnet văn phòng (192.168.1.0/24). Khi xảy ra sự cố mất điện hoặc mất mạng nội bộ, cơ chế Chấm công Khẩn cấp 4G kèm ảnh Selfie và GPS Haversine sẽ tự động kích hoạt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
