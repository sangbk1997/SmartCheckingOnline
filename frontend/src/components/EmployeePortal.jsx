import React, { useState, useEffect } from 'react';
import { 
  QrCode, Smartphone, AlertTriangle, Calendar, FileText, CheckCircle2, 
  XCircle, Clock, MapPin, Upload, Info, RefreshCw, AlertCircle, ShieldAlert,
  FileSpreadsheet, MessageSquare, Send, Check, Camera, Eye, X, ChevronRight
} from 'lucide-react';
import CameraQrScannerModal from './CameraQrScannerModal';
import DetailedTimesheetView from './DetailedTimesheetView';

export default function EmployeePortal({ currentUser, token }) {
  const [activeTab, setActiveTab] = useState('punch'); // 'punch', 'emergency', 'requests', 'timesheet'
  const [quotas, setQuotas] = useState(null);
  const [todayPunches, setTodayPunches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [myTimesheet, setMyTimesheet] = useState(null);
  const [myDisputes, setMyDisputes] = useState([]);
  const [myDevice, setMyDevice] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState(null);

  // Camera QR Scanner Modal states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [scannerPunchType, setScannerPunchType] = useState('IN');
  const [viewingRequest, setViewingRequest] = useState(null);

  // Form states cho đơn từ
  const [requestForm, setRequestForm] = useState({
    requestType: 'LATE_IN',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    durationMinutes: 30,
    reason: '',
    attachmentUrl: ''
  });

  // Form states cho chấm công khẩn cấp
  const [emergencyForm, setEmergencyForm] = useState({
    reason: 'Mất điện văn phòng, màn hình Kiosk không hoạt động',
    latitude: 10.776889,
    longitude: 106.700806,
  });

  // Form states cho khiếu nại công 48h
  const [disputeForm, setDisputeForm] = useState({
    disputedDate: new Date().toISOString().split('T')[0],
    reason: 'Quên check-out ca chiều do họp khách hàng đột xuất',
    attachmentUrl: ''
  });

  // Custom QR test state (để test mã hết hạn / sai IP)
  const [customQrPayload, setCustomQrPayload] = useState('');

  // Load Quotas & Lịch sử hôm nay & Bảng công & Thiết bị
  const loadData = async () => {
    if (!token) return;
    try {
      // 0. Thiết bị bảo mật
      fetch('/api/v1/devices/my-device', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setMyDevice(data.data);
          } else {
            setMyDevice(null);
          }
        })
        .catch(err => console.error("Lỗi lấy thông tin thiết bị:", err));

      // 1. Quotas
      const qRes = await fetch('/api/v1/requests/quotas/remaining', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const qData = await qRes.json();
      if (qData.success) setQuotas(qData.data);

      // 2. Punches hôm nay
      const pRes = await fetch('/api/v1/attendance/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (pData.success) setTodayPunches(pData.data);

      // 3. Danh sách đơn
      const rRes = await fetch('/api/v1/requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rData = await rRes.json();
      if (rData.success) setMyRequests(rData.data);

      // 4. Kỳ công & Bảng công cá nhân
      const perRes = await fetch('/api/v1/timesheets/periods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const perData = await perRes.json();
      if (perData.success && perData.data?.length > 0) {
        setPeriods(perData.data);
        if (!selectedPeriodId) {
          setSelectedPeriodId(perData.data[0].id);
        }
      }

      // 5. Khiếu nại công cá nhân (48h)
      const dRes = await fetch('/api/v1/timesheets/my-disputes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dData = await dRes.json();
      if (dData.success) {
        setMyDisputes(dData.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, currentUser]);

  // Liên kết thiết bị hiện tại (Device Binding)
  const handleEnrollThisDevice = async () => {
    if (!token || !currentUser) return null;
    setDeviceLoading(true);
    try {
      const code = currentUser.employeeCode || currentUser.id?.substring(0, 8) || 'EMP';
      const isMac = navigator.userAgent.includes('Mac');
      const isWin = navigator.userAgent.includes('Win');
      const platformName = isMac ? 'macOS' : isWin ? 'Windows' : 'Mobile';
      const browserName = navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser';
      const deviceToken = `DEV_${code}_${platformName.toUpperCase()}_${window.location.hostname.replace(/[^a-zA-Z0-9]/g, '')}`;
      const deviceName = `${platformName} (${browserName})`;

      const res = await fetch('/api/v1/devices/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceToken,
          deviceName,
          platform: platformName
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMyDevice(data.data);
        return data.data;
      }
    } catch (e) {
      console.error("Lỗi đăng ký thiết bị:", e);
    } finally {
      setDeviceLoading(false);
    }
    return null;
  };

  // Load bảng công cá nhân theo kỳ (Dữ liệu cô lập bảo mật của riêng user)
  useEffect(() => {
    if (!selectedPeriodId || !token) return;
    const fetchMyTimesheet = async () => {
      try {
        const res = await fetch(`/api/v1/timesheets/my-timesheet?periodId=${selectedPeriodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMyTimesheet(data.data || null);
        }
      } catch (e) {
        console.error("Lỗi tải bảng công cá nhân:", e);
      }
    };
    fetchMyTimesheet();
  }, [selectedPeriodId, token, currentUser]);

  // Thao tác chấm công chuẩn (Lấy mã QR từ Kiosk rồi bấm Chấm công)
  const handlePunch = async (punchType, overridePayload = null) => {
    setLoading(true);
    setPunchFeedback(null);
    try {
      // Đảm bảo thiết bị đã liên kết
      let activeDev = myDevice;
      if (!activeDev) {
        activeDev = await handleEnrollThisDevice();
      }

      if (!activeDev?.deviceToken) {
        setPunchFeedback({
          success: false,
          code: 'ERR_DEVICE_NOT_BOUND',
          message: 'Vui lòng liên kết thiết bị trước khi chấm công',
          hrGuide: 'Bấm nút "Liên kết thiết bị này" trên góc phải màn hình để bảo vệ tài khoản.'
        });
        return;
      }

      let qrPayload = overridePayload;
      if (!qrPayload) {
        // 1. Lấy mã QR Kiosk mới nhất
        const qrRes = await fetch('/api/v1/kiosk/current-qr');
        const qrData = await qrRes.json();
        qrPayload = qrData.data?.qrPayload;
      }

      // 2. Gọi API chấm công với deviceToken của chính tài khoản này
      const res = await fetch('/api/v1/attendance/punch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          qrPayload: qrPayload,
          deviceToken: activeDev.deviceToken,
          punchType: punchType
        })
      });

      const data = await res.json();
      setPunchFeedback(data);
      if (data.success) {
        loadData();
      }
    } catch (err) {
      setPunchFeedback({
        success: false,
        code: 'NETWORK_ERROR',
        message: 'Lỗi kết nối tới máy chủ chấm công',
        hrGuide: 'Kiểm tra xem backend service trên cổng 8085 có đang chạy không.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Nộp đơn chấm công khẩn cấp
  const handleEmergencyPunch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPunchFeedback(null);
    try {
      const formData = new FormData();
      formData.append('latitude', emergencyForm.latitude);
      formData.append('longitude', emergencyForm.longitude);
      formData.append('reason', emergencyForm.reason);

      const res = await fetch('/api/v1/attendance/punch-emergency', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setPunchFeedback(data);
      if (data.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Nộp đơn từ mới (Đi muộn, WFH, Nghỉ phép...)
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPunchFeedback(null);
    try {
      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestForm)
      });

      const data = await res.json();
      setPunchFeedback(data);
      if (data.success) {
        setRequestForm({
          ...requestForm,
          reason: '',
          attachmentUrl: ''
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Nộp khiếu nại bảng công 48h
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodId) return;
    setLoading(true);
    setPunchFeedback(null);
    try {
      const params = new URLSearchParams();
      params.append('periodId', selectedPeriodId);
      params.append('disputedDate', disputeForm.disputedDate);
      params.append('reason', disputeForm.reason);
      if (disputeForm.attachmentUrl) {
        params.append('attachmentUrl', disputeForm.attachmentUrl);
      }

      const res = await fetch(`/api/v1/timesheets/disputes?${params.toString()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPunchFeedback(data);
      if (data.success) {
        setDisputeForm({
          disputedDate: new Date().toISOString().split('T')[0],
          reason: '',
          attachmentUrl: ''
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      {/* Employee Header Profile */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
            {currentUser?.fullName?.charAt(0) || 'E'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                {currentUser?.employeeCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser?.email} • Hợp đồng: <strong className="text-slate-700">Chính thức</strong>
            </p>
          </div>
        </div>

        {/* Device Binding Status */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <Smartphone className="w-4 h-4 text-indigo-600" />
          <div>
            <div className="text-slate-500 text-[10px]">Thiết bị bảo mật đã đăng ký:</div>
            {myDevice ? (
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>{myDevice.deviceName || 'Thiết bị của tôi'} ({myDevice.platform})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã kích hoạt Device Binding"></span>
              </div>
            ) : (
              <button
                onClick={handleEnrollThisDevice}
                disabled={deviceLoading}
                className="mt-0.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
              >
                {deviceLoading ? 'Đang liên kết...' : '+ Liên kết thiết bị hiện tại'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quotas Status Overview */}
      {quotas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border-l-4 border-l-indigo-500 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Đi muộn / Về sớm</div>
            <div className="text-2xl font-black text-indigo-600">
              {quotas.lateEarlyRemaining} <span className="text-xs font-medium text-slate-400">/ {quotas.lateEarlyMaxMonth} lần</span>
            </div>
            <p className="text-[10px] text-slate-500">Tối đa 60 phút/lần</p>
          </div>

          <div className="glass-card rounded-xl p-4 border-l-4 border-l-violet-500 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Làm việc từ xa (WFH)</div>
            <div className="text-2xl font-black text-violet-600">
              {quotas.wfhRemaining} <span className="text-xs font-medium text-slate-400">/ {quotas.wfhMaxMonth} ngày</span>
            </div>
            <p className="text-[10px] text-slate-500">Cần nộp trước 1 ngày</p>
          </div>

          <div className="glass-card rounded-xl p-4 border-l-4 border-l-emerald-500 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quỹ Phép năm 2026</div>
            <div className="text-2xl font-black text-emerald-600">
              {quotas.annualLeaveRemaining} <span className="text-xs font-medium text-slate-400">ngày</span>
            </div>
            <p className="text-[10px] text-slate-500">+1 ngày mỗi 2 năm thâm niên</p>
          </div>

          <div className="glass-card rounded-xl p-4 border-l-4 border-l-amber-500 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quên Chấm Công</div>
            <div className="text-2xl font-black text-amber-600">
              {quotas.missedPunchRemaining} <span className="text-xs font-medium text-slate-400">/ {quotas.missedPunchMaxMonth} lần</span>
            </div>
            <p className="text-[10px] text-slate-500">Hạn nộp trong vòng 3 ngày</p>
          </div>
        </div>
      )}

      {/* Main Tab Controller */}
      <div className="flex border-b border-slate-200 space-x-4 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('punch')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'punch'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Chấm công Vào/Ra (QR)
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'emergency'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Chấm công Khẩn cấp (Mất điện/Mạng)
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Tạo Đơn từ & Phép
        </button>

        <button
          onClick={() => setActiveTab('timesheet')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'timesheet'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Bảng công Cá nhân & Khiếu nại (48h)
        </button>
      </div>

      {/* Feedback Alert Banner */}
      {punchFeedback && (
        <div
          className={`p-4 rounded-2xl border text-sm transition-all ${
            punchFeedback.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {punchFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                {punchFeedback.message}
                {punchFeedback.code && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                    {punchFeedback.code}
                  </span>
                )}
              </div>
              {punchFeedback.hrGuide && (
                <div className="text-xs bg-white/70 p-2.5 rounded-xl border border-rose-200/80 mt-1.5 flex items-start gap-2 text-rose-800">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-700">Hướng dẫn HR / Khắc phục: </span>
                    {punchFeedback.hrGuide}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Chấm công QR */}
      {activeTab === 'punch' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 md:col-span-1 space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Chấm công tại Văn phòng</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hướng camera quét mã Dynamic QR đang nhảy trên màn hình Kiosk TV quầy lễ tân
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setScannerPunchType('IN');
                  setIsCameraModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5 animate-pulse" />
                Bật Camera Quét QR Check-in
              </button>

              <button
                onClick={() => {
                  setScannerPunchType('OUT');
                  setIsCameraModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5 animate-pulse" />
                Bật Camera Quét QR Check-out
              </button>

              <button
                disabled={loading}
                onClick={() => handlePunch('IN')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Chấm công Vào ca (Check-in)
              </button>

              <button
                disabled={loading}
                onClick={() => handlePunch('OUT')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Chấm công Ra ca (Check-out)
              </button>
            </div>

            {/* Test Edge Cases Bar */}
            <div className="pt-3 border-t border-slate-100 text-left">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Mô phỏng Test Kịch bản Biên:
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePunch('IN', 'EXPIRED_QR_TOKEN_FAKE_TEST')}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold transition-colors"
                >
                  Test QR Hết hạn
                </button>
                <button
                  onClick={() => handlePunch('IN', 'MALFORMED_INVALID_PAYLOAD')}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold transition-colors"
                >
                  Test QR Sai chữ ký
                </button>
              </div>
            </div>
          </div>

          {/* Lịch sử hôm nay */}
          <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>Lịch sử Chấm công Hôm nay ({new Date().toLocaleDateString('vi-VN')})</span>
              <button onClick={loadData} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Làm mới
              </button>
            </h3>

            {todayPunches.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Chưa có lượt chấm công nào trong ngày hôm nay.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayPunches.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                        p.punchType === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.punchType === 'IN' ? 'VÀO CA' : 'RA CA'}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800">
                          {new Date(p.punchTime).toLocaleTimeString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p.verificationMethod} • IP: {p.clientIp}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Chấm công Khẩn cấp */}
      {activeTab === 'emergency' && (
        <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Phương án Chấm công Dự phòng Khẩn cấp</div>
              <p className="mt-0.5 text-amber-800">
                Chỉ sử dụng khi văn phòng bị mất điện, đứt mạng Wi-Fi hoặc màn hình Kiosk hỏng. 
                Yêu cầu gửi kèm toạ độ GPS và ảnh chụp bối cảnh để Quản lý trực tiếp phê duyệt.
              </p>
            </div>
          </div>

          <form onSubmit={handleEmergencyPunch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lý do khẩn cấp:</label>
              <select
                value={emergencyForm.reason}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, reason: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Mất điện văn phòng, màn hình Kiosk không hoạt động">Mất điện văn phòng</option>
                <option value="Sự cố mất kết nối mạng Wi-Fi nội bộ">Sự cố mất mạng Wi-Fi nội bộ</option>
                <option value="Màn hình Kiosk bị treo / bảo trì">Màn hình Kiosk bị treo / bảo trì</option>
                <option value="Khác (Ghi chú chi tiết bên dưới)">Khác</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Toạ độ Vĩ độ (Lat):</label>
                <input
                  type="number"
                  step="0.000001"
                  value={emergencyForm.latitude}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, latitude: parseFloat(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Toạ độ Kinh độ (Lng):</label>
                <input
                  type="number"
                  step="0.000001"
                  value={emergencyForm.longitude}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, longitude: parseFloat(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Gửi Chấm công Khẩn cấp (Chờ Quản lý duyệt)
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Quản lý Đơn từ */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 md:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Tạo Đơn từ Mới
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Loại đơn:</label>
                <select
                  value={requestForm.requestType}
                  onChange={(e) => setRequestForm({ ...requestForm, requestType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="LATE_IN">Đi muộn (Late In - Tối đa 60p)</option>
                  <option value="EARLY_OUT">Về sớm (Early Out - Tối đa 60p)</option>
                  <option value="MISSED_PUNCH">Bổ sung công (Trong vòng 3 ngày)</option>
                  <option value="WFH">Làm việc từ xa (WFH)</option>
                  <option value="ANNUAL_LEAVE">Nghỉ phép năm (Có lương)</option>
                  <option value="SICK_LEAVE">Nghỉ ốm (Cần chứng từ y tế C65)</option>
                </select>
              </div>

              {(requestForm.requestType === 'LATE_IN' || requestForm.requestType === 'EARLY_OUT') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số phút (Tối đa 60):</label>
                  <input
                    type="number"
                    value={requestForm.durationMinutes}
                    onChange={(e) => setRequestForm({ ...requestForm, durationMinutes: parseInt(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Từ ngày:</label>
                  <input
                    type="date"
                    value={requestForm.fromDate}
                    onChange={(e) => setRequestForm({ ...requestForm, fromDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                  <input
                    type="date"
                    value={requestForm.toDate}
                    onChange={(e) => setRequestForm({ ...requestForm, toDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {requestForm.requestType === 'SICK_LEAVE' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-rose-600">
                    *Link Chứng từ y tế mẫu C65-HD (Bắt buộc):
                  </label>
                  <input
                    type="text"
                    placeholder="https://storage.congty.com/giay-kham-c65.pdf"
                    value={requestForm.attachmentUrl}
                    onChange={(e) => setRequestForm({ ...requestForm, attachmentUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do chi tiết:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ lý do xin phép..."
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                Nộp Đơn
              </button>
            </form>
          </div>

          {/* Lịch sử đơn đã nộp */}
          <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Đơn từ Đã Nộp của Bạn</h3>

            {myRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Bạn chưa có đơn từ nào trong tháng này.
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">
                        {r.requestType} • {r.fromDate}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'APPROVED' ? 'ĐÃ DUYỆT' : r.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}
                      </span>
                    </div>
                    <div className="text-slate-600">Lý do: {r.reason}</div>
                    {r.attachmentUrl && (
                      <div className="text-[10px] text-indigo-600 underline">Chứng từ: {r.attachmentUrl}</div>
                    )}
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => setViewingRequest(r)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Xem Chi Tiết Đơn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Bảng công cá nhân & Khiếu nại 48h (Timesheet & Dispute) */}
      {activeTab === 'timesheet' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Bảng Công Chi Tiết & Cổng Khiếu Nại 48h
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo quy định, nhân viên có thời hạn 48 giờ để rà soát và khiếu nại công trước khi HR khóa sổ.
              </p>
            </div>

            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Kỳ {p.periodCode} ({p.status === 'LOCKED' ? '🔒 ĐÃ KHÓA' : '🟢 ĐANG MỞ KHIẾU NẠI'})
                </option>
              ))}
            </select>
          </div>

          {/* Timesheet Summary KPI Cards */}
          {myTimesheet ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Công chuẩn kỳ này</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{myTimesheet.standardWorkDays} ngày</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đi làm thực tế</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{myTimesheet.actualWorkDays} ngày</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Ngày WFH</div>
                <div className="text-2xl font-black text-violet-600 mt-1">{myTimesheet.wfhDays} ngày</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng phút đi muộn</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{myTimesheet.lateMinutesTotal} phút</div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              Kỳ này đang trong tháng hoạt động, số liệu công sẽ được tự động tổng hợp sau ngày cuối tháng.
            </div>
          )}

          {/* Tra Cứu Bảng Công Chi Tiết (Năm / Tháng / Ngày) */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Tra Cứu Bảng Công Chi Tiết (Lịch 30 Ngày & Tổng Quan Cả Năm)
            </h4>
            <DetailedTimesheetView 
              currentUser={currentUser} 
              isManagerView={false}
              onRequestDispute={(date) => {
                setDisputeForm({ ...disputeForm, disputedDate: date });
              }}
            />
          </div>

          {/* Form Khiếu nại 48h */}
          <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Gửi Đơn Khiếu Nại Bảng Công (48h Dispute Form)
            </h4>
            <p className="text-xs text-slate-500">
              Nếu phát hiện sót công hoặc thiếu ngày WFH đã duyệt, vui lòng gửi khiếu nại để HR giải quyết trước khi khóa kỳ công.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày cần khiếu nại:</label>
                <input
                  type="date"
                  required
                  value={disputeForm.disputedDate}
                  onChange={(e) => setDisputeForm({ ...disputeForm, disputedDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do khiếu nại chi tiết:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Ngày 15/10 tôi có check-in lúc 08:25 và check-out lúc 18:00 nhưng bảng công ghi vắng..."
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Gửi Khiếu Nại Lên Phòng Nhân Sự
              </button>
            </form>
          </div>

          {/* Danh sách Khiếu nại của tôi */}
          <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Lịch Sử Khiếu Nại Bảng Công Của Bạn ({myDisputes.length})
              </span>
              <span className="text-[11px] font-normal text-slate-400">Thời hạn phản hồi: 24h</span>
            </h4>

            {myDisputes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Bạn chưa có đơn khiếu nại nào trong kỳ này.
              </div>
            ) : (
              <div className="space-y-3">
                {myDisputes.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Ngày thắc mắc: {d.disputedDate}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : d.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-amber-100 text-amber-700 border border-amber-300'
                          }`}>
                            {d.status === 'ACCEPTED' ? '✓ ĐÃ CHẤP THUẬN (BÙ CÔNG)' : d.status === 'REJECTED' ? '✕ ĐÃ TỪ CHỐI' : '⏳ CHỜ HR XỬ LÝ'}
                          </span>
                        </div>
                        <p className="text-slate-600">Lý do: <em>{d.reason}</em></p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Nộp: {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {d.hrResponse && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-900">Phản hồi từ HR: </strong>
                          {d.hrResponse}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camera Live QR Scanner Modal */}
      <CameraQrScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        punchType={scannerPunchType}
        currentUser={currentUser}
        activeDevice={myDevice}
        onPunchSuccess={(punchData) => {
          loadData();
          setIsCameraModalOpen(false);
          setPunchFeedback({
            success: true,
            message: `${scannerPunchType === 'IN' ? 'Check-in' : 'Check-out'} thành công bằng Camera Quét QR!`
          });
        }}
      />

      {/* Chi Tiết Đơn Từ Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Chi Tiết Đơn Xin Phép</h4>
              </div>
              <button 
                onClick={() => setViewingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold">Loại đơn:</span>
                <strong className="text-slate-900">{viewingRequest.requestType}</strong>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold">Thời gian:</span>
                <strong className="text-slate-900">
                  {viewingRequest.fromDate} {viewingRequest.toDate && viewingRequest.toDate !== viewingRequest.fromDate ? `đến ${viewingRequest.toDate}` : ''}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Lý do:</span>
                <p className="text-slate-800 font-medium">{viewingRequest.reason || 'Không có'}</p>
              </div>

              {viewingRequest.attachmentUrl && (
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                  <span className="text-indigo-800 font-bold block">Chứng từ đính kèm (C65):</span>
                  <a 
                    href={viewingRequest.attachmentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 font-semibold underline break-all flex items-center gap-1"
                  >
                    {viewingRequest.attachmentUrl}
                  </a>
                </div>
              )}

              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  viewingRequest.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  viewingRequest.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {viewingRequest.status === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : viewingRequest.status === 'REJECTED' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
