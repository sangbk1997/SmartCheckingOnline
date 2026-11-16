import React from 'react';
import { 
  ShieldCheck, QrCode, Smartphone, Wifi, Sparkles, ArrowRight, 
  CalendarClock, Lock, CheckCircle, FileText, AlertTriangle, Play 
} from 'lucide-react';

export default function LandingPage({ onGoToKiosk, onGoToEmployee, onGoToManager }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
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

          <div className="flex flex-wrap gap-3.5 pt-2">
            <button
              onClick={onGoToKiosk}
              className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-indigo-900 group-hover:scale-110 transition-transform" />
              Mở Màn hình Kiosk TV (QR 5s)
            </button>
            <button
              onClick={onGoToEmployee}
              className="px-6 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-sm border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              Vào Không gian Nhân viên
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToManager}
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              Duyệt đơn & Theo dõi (HR)
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
            <h3 className="font-bold text-slate-900 text-base">Device Binding (Khóa Thiết Bị)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi nhân viên chỉ được chấm công trên 1 thiết bị đã được kích hoạt. Ngăn chặn hành vi 1 người mang điện thoại đến chấm công cho cả nhóm.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dự phòng Khẩn cấp (Selfie + GPS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khi mất điện hoặc đứt cáp mạng, nhân viên chấm công bằng ảnh Selfie chụp trực tiếp kèm toạ độ GPS. Tự động tính khoảng cách Haversine cảnh báo nếu lệch &gt; 200m.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="glass-card rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-indigo-600" />
          Phân hệ Quản lý Đơn từ & Tự động Tính công Chặt chẽ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Kiểm soát Hạn ngạch (Quota)
            </div>
            <p className="text-[11px] text-slate-600">
              Đi muộn/về sớm tối đa 2 lần/tháng (mỗi lần $\le$ 60 phút). Tự động chặn ngay từ giao diện nộp đơn.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Hạn nộp Đơn Quên Chấm
            </div>
            <p className="text-[11px] text-slate-600">
              Bắt buộc nộp trong vòng 3 ngày làm việc kể từ ngày quên chấm. Sau 3 ngày hệ thống tự động khóa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Chứng từ Y tế BHXH (C65)
            </div>
            <p className="text-[11px] text-slate-600">
              Nghỉ ốm đau, thai sản bắt buộc tải lên giấy chứng nhận y tế để tách bạch nguồn chi trả BHXH.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Khóa Công & Hồi tố Kỳ sau
            </div>
            <p className="text-[11px] text-slate-600">
              Kỳ công chốt khóa bất biến. Đơn duyệt muộn sau khi khóa sẽ tự động chuyển hồi tố bù vào kỳ sau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

