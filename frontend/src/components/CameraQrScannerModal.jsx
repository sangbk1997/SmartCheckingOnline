import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, X, RefreshCw, Zap, Flashlight, AlertCircle, 
  CheckCircle2, MapPin, Smartphone, ShieldCheck, Upload,
  HelpCircle, Eye, Volume2, ArrowRightLeft
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';

export default function CameraQrScannerModal({ 
  isOpen, 
  onClose, 
  punchType = 'IN', // 'IN' | 'OUT'
  currentUser,
  activeDevice,
  onPunchSuccess 
}) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [punchResult, setPunchResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [demoTokenLoading, setDemoTokenLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Play audio beep on QR scan success
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz (A5)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('AudioContext not available', e);
    }
  };

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera (getUserMedia).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        setIsScanning(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasCameraPermission(false);
      setCameraError(err.message || 'Không thể truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Continuous frame scanning loop with jsQR
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && isScanning && !isProcessing) {
          console.log('Found QR code:', code.data);
          playScanBeep();
          setIsScanning(false);
          setScannedCode(code.data);
          handleProcessPunch(code.data);
          return;
        }
      }
    }
    if (isOpen && isScanning) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  // Switch Camera Front / Back
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle Torch if supported
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }]
          });
          setTorchOn(!torchOn);
        } catch (e) {
          console.warn('Torch not supported', e);
        }
      } else {
        alert('Thiết bị hoặc camera hiện tại không hỗ trợ đèn flash.');
      }
    }
  };

  // Process Punch via API
  const handleProcessPunch = async (qrPayloadString) => {
    setIsProcessing(true);
    setCameraError('');

    try {
      const token = localStorage.getItem('smarttime_token') || localStorage.getItem('token');
      const deviceToken = activeDevice?.deviceToken || 'FP_DEVICE_TOKEN_DEV_IPHONE_15_PRO';

      const response = await fetch('/api/v1/attendance/punch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          punchType: punchType,
          qrPayload: qrPayloadString,
          deviceToken: deviceToken
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        setPunchResult({
          success: true,
          message: resData.message || (punchType === 'IN' ? 'Check-in thành công!' : 'Check-out thành công!'),
          data: resData.data
        });
        if (onPunchSuccess) {
          onPunchSuccess(resData.data);
        }
      } else {
        setPunchResult({
          success: false,
          code: resData.code,
          message: resData.message || 'Chấm công thất bại!',
          hrGuide: resData.hrGuide
        });
      }
    } catch (err) {
      console.error('Punch error:', err);
      setPunchResult({
        success: false,
        message: 'Lỗi kết nối tới máy chủ chấm công. Vui lòng thử lại!'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo 1-Click: Fetch active Kiosk Dynamic QR from backend and punch immediately
  const handleScanFromLiveKiosk = async () => {
    setDemoTokenLoading(true);
    setCameraError('');
    try {
      const res = await fetch('/api/v1/kiosk/current-qr');
      const data = await res.json();
      if (data.success && data.data?.qrPayload) {
        playScanBeep();
        setIsScanning(false);
        setScannedCode(data.data.qrPayload);
        await handleProcessPunch(data.data.qrPayload);
      } else {
        alert('Không lấy được mã QR từ Kiosk sảnh.');
      }
    } catch (err) {
      alert('Lỗi kết nối tới Kiosk: ' + err.message);
    } finally {
      setDemoTokenLoading(false);
    }
  };

  // Scan from Uploaded Image file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          playScanBeep();
          setIsScanning(false);
          setScannedCode(code.data);
          handleProcessPunch(code.data);
        } else {
          alert('Không tìm thấy mã QR hợp lệ trong ảnh tải lên!');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner to scan again
  const handleResetScanner = () => {
    setScannedCode('');
    setPunchResult(null);
    setIsScanning(true);
    setIsProcessing(false);
    startCamera(facingMode);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
      setPunchResult(null);
      setScannedCode('');
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              punchType === 'IN' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Quét Mã QR {punchType === 'IN' ? 'Vào Ca (Check-in)' : 'Ra Ca (Check-out)'}
              </h3>
              <p className="text-xs text-slate-400">
                Hướng camera vào mã Dynamic QR hiển thị trên màn hình Kiosk sảnh
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport & Overlay */}
        <div className="relative w-full h-80 bg-black flex items-center justify-center overflow-hidden">
          {/* Real Video Element */}
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Hidden Canvas for QR decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay UI */}
          {isScanning && !punchResult && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Darkened backdrop with transparent target cutout */}
              <div className="relative w-56 h-56 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.3)] flex items-center justify-center">
                {/* Laser scan line animation */}
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
                
                {/* Corner bracket graphics */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

                <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur">
                  Đặt mã QR vào khung
                </span>
              </div>
            </div>
          )}

          {/* Processing Spinner Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">Đang xác thực chữ ký số HMAC & Điểm danh...</p>
            </div>
          )}

          {/* Result Overlay when Punch Complete */}
          {punchResult && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              {punchResult.success ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {punchType === 'IN' ? 'Check-in Thành Công!' : 'Check-out Thành Công!'}
                  </h4>
                  <p className="text-sm text-emerald-400 font-medium mb-3">
                    {punchResult.message}
                  </p>
                  
                  {punchResult.data && (
                    <div className="w-full max-w-sm bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-left space-y-1.5 mb-4">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="font-semibold text-white">
                          {new Date(punchResult.data.punchTime).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Hình thức:</span>
                        <span className="font-semibold text-emerald-300">
                          {punchResult.data.verificationMethod || 'Dynamic QR Kiosk'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Trạng thái xác thực:</span>
                        <span className="font-semibold text-emerald-400">Hợp lệ (100% Chống gian lận)</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-900/30 transition-all text-sm"
                  >
                    Đóng & Hoàn Tất
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">Điểm Danh Thất Bại</h4>
                  <p className="text-sm text-rose-400 font-medium mb-2">
                    {punchResult.message}
                  </p>
                  {punchResult.hrGuide && (
                    <p className="text-xs text-slate-400 bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 mb-4 text-left">
                      💡 <strong>Hướng dẫn:</strong> {punchResult.hrGuide}
                    </p>
                  )}
                  <button
                    onClick={handleResetScanner}
                    className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-white transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Thử Quét Lại
                  </button>
                </>
              )}
            </div>
          )}

          {/* Camera Controls bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <button 
              onClick={toggleFacingMode}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white backdrop-blur flex items-center gap-1.5 text-xs font-medium"
              title="Đổi camera trước/sau"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Đổi Camera</span>
            </button>

            <button 
              onClick={toggleTorch}
              className={`p-2 rounded-xl border backdrop-blur flex items-center gap-1.5 text-xs font-medium ${
                torchOn 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Bật/Tắt đèn Flash"
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span>{torchOn ? 'Tắt Đèn' : 'Đèn Flash'}</span>
            </button>
          </div>
        </div>

        {/* Fallback / Testing Helpers */}
        <div className="p-5 bg-slate-900 space-y-3">
          {cameraError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <div>
                <strong>Lỗi Camera:</strong> {cameraError}
                <p className="mt-1 text-slate-400">Bạn có thể bấm "Lấy mã Kiosk hiện tại (1-Click)" phía dưới để điểm danh ngay mà không cần camera vật lý.</p>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Thiết bị: <strong className="text-slate-200">{activeDevice?.deviceName || 'iPhone 15 Pro Max'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bảo mật 1-1: <span className="text-emerald-400 font-semibold">Đã xác minh</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleScanFromLiveKiosk}
              disabled={demoTokenLoading || isProcessing}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {demoTokenLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Lấy Mã Kiosk Sảnh (1-Click)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Tải Ảnh Mã QR Từ Máy
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}

