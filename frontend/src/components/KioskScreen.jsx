import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Tv, Clock, ShieldCheck, Wifi, RefreshCw, Maximize2, 
  Sparkles, CheckCircle2, AlertCircle, Volume2 
} from 'lucide-react';

export default function KioskScreen({ onExit }) {
  const [qrPayload, setQrPayload] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [lastNotification, setLastNotification] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy mã QR từ backend
  const fetchCurrentQr = async () => {
    try {
      const res = await fetch('/api/v1/kiosk/current-qr');
      const data = await res.json();
      if (data.success && data.data?.qrPayload) {
        setQrPayload(data.data.qrPayload);
        setCountdown(5);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Lỗi lấy mã QR:", err);
      setIsConnected(false);
    }
  };

  // Vòng lặp xoay mã mỗi 5 giây
  useEffect(() => {
    fetchCurrentQr();
    const interval = setInterval(() => {
      fetchCurrentQr();
    }, 5000);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownTimer);
    };
  }, []);

  // Giả lập hoặc lắng nghe sự kiện check-in để hiển thị thông điệp chào mừng
  const triggerCelebration = (employeeName, punchType) => {
    const timeStr = new Date().toLocaleTimeString('vi-VN');
    setLastNotification({
      employeeName: employeeName || "Lê Hoàng Nam",
      punchType: punchType || "IN",
      time: timeStr,
      message: `Chào mừng ${employeeName || 'Lê Hoàng Nam'} đã ${punchType === 'IN' ? 'Check-in (Vào ca)' : 'Check-out (Ra ca)'} thành công!`
    });

    // Bắn pháo hoa Confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Tự tắt thông báo sau 4.5 giây
    setTimeout(() => {
      setLastNotification(null);
    }, 4500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              KIOSK CHẤM CÔNG VĂN PHÒNG
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Vị trí: Quầy Lễ Tân (Tầng 1 - Trụ sở chính) • ID: <span className="text-indigo-400 font-mono">OFFICE_HQ_FLOOR_1</span>
            </p>
          </div>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight text-indigo-300">
              {clock.toLocaleTimeString('vi-VN')}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              {clock.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Toàn màn hình"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onExit}
              className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-semibold transition-all border border-slate-700"
            >
              Thoát Kiosk
            </button>
          </div>
        </div>
      </div>

      {/* Center QR & Notification Area */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {/* Dynamic Greeting Toast Banner */}
        {lastNotification && (
          <div className="absolute -top-24 z-30 animate-bounce transition-all">
            <div className="glass-dark px-8 py-4 rounded-3xl border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/30 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-lg font-black text-emerald-300 tracking-wide">
                  {lastNotification.message}
                </div>
                <div className="text-xs text-slate-300">
                  Thời gian: <span className="font-mono text-emerald-400 font-bold">{lastNotification.time}</span> • Phương thức: Dynamic QR Hợp lệ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Frame */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-white shadow-2xl shadow-indigo-500/20 border-4 border-indigo-500/40 flex flex-col items-center">
          {qrPayload ? (
            <QRCodeSVG
              value={qrPayload}
              size={280}
              level="H"
              includeMargin={true}
              className="rounded-xl"
            />
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center bg-slate-100 rounded-xl">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}

          {/* Countdown & Security badge */}
          <div className="mt-4 flex items-center justify-between w-full px-2">
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Chữ ký số HMAC-SHA256</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              Đổi mã sau: {countdown}s
            </div>
          </div>
        </div>

        {/* Scanning Instructions */}
        <div className="mt-6 text-center space-y-2 max-w-md">
          <p className="text-sm sm:text-base font-bold text-slate-200">
            Mở điện thoại cá nhân kết nối Wi-Fi công ty & quét mã này để Chấm công
          </p>
          <p className="text-xs text-slate-400">
            Mã tự động đổi mỗi 5 giây. Không thể sử dụng ảnh chụp màn hình gửi từ xa.
          </p>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 z-10 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Wifi className="w-4 h-4" /> Mạng nội bộ kết nối ổn định
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-indigo-300">
            <ShieldCheck className="w-4 h-4" /> Chống Replay Attack kích hoạt
          </span>
        </div>

        {/* Nút test nhanh giả lập bắn thông báo chào mừng */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerCelebration("Lê Hoàng Nam", "IN")}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Thử thông báo: "Nam Check-in"
          </button>
          <button
            onClick={() => triggerCelebration("Trần Văn Mạnh", "OUT")}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Thử thông báo: "Mạnh Check-out"
          </button>
        </div>
      </div>
    </div>
  );
}

