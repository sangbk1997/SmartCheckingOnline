import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, 
  Lock, RefreshCw, Eye, MessageSquare, MapPin, FileCheck, Download, 
  Building2, Sliders, Calendar, ChevronRight, UserPlus, FileSpreadsheet,
  Mail, Send, Bot, Sparkles, ExternalLink, ShieldAlert, MessageSquareCode,
  Smartphone, Plus, Edit, Shield, Check, Info, AlertCircle, ArrowRight,
  Trash2, X, BarChart3, TrendingUp, UserCheck
} from 'lucide-react';
import ExecutiveAnalyticsDashboard from './ExecutiveAnalyticsDashboard';
import DetailedTimesheetView from './DetailedTimesheetView';

export default function ManagerPortal({ currentUser, token, setCurrentUser, usersList, onEmployeeUpdated }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'emergencies', 'approvals', 'timesheets', 'departments', 'policies', 'google'
  const [dashboardViewMode, setDashboardViewMode] = useState('live'); // 'live' | 'analytics'
  
  // Dashboard & Approvals
  const [liveData, setLiveData] = useState(null);
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestComments, setRequestComments] = useState({});
  
  // Timesheets & Disputes
  const [timesheetSubTab, setTimesheetSubTab] = useState('matrix'); // 'matrix', 'disputes', 'calendar'
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [timesheetMatrix, setTimesheetMatrix] = useState([]);
  const [disputes, setDisputes] = useState([]);
  
  // Org & Staff & Devices
  const [orgSubTab, setOrgSubTab] = useState('departments'); // 'departments', 'employees', 'devices'
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allDevices, setAllDevices] = useState([]);

  // Policies, Shifts & Holidays
  const [policySubTab, setPolicySubTab] = useState('rules'); // 'rules', 'shifts', 'holidays'
  const [shifts, setShifts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Detail Modals States
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [viewingDevice, setViewingDevice] = useState(null);
  const [viewingShift, setViewingShift] = useState(null);
  const [viewingHoliday, setViewingHoliday] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [viewingEmergency, setViewingEmergency] = useState(null);
  const [viewingDispute, setViewingDispute] = useState(null);

  // Modals States
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState({
    periodCode: 'KY_' + (new Date().getMonth() + 1) + '_' + new Date().getFullYear(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeAction, setDisputeAction] = useState({ dispute: null, action: 'APPROVE', notes: '' });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: '', code: '', name: '', managerId: '', parentId: '' });

  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({
    id: '', employeeCode: '', fullName: '', email: '', departmentId: '',
    directManagerId: '', contractType: 'OFFICIAL', appRole: 'EMPLOYEE', isActive: true
  });

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    id: '', shiftCode: '', shiftName: '', shiftType: 'FIXED',
    startTime: '08:30:00', endTime: '17:30:00', lunchBreakStart: '12:00:00', lunchBreakEnd: '13:00:00',
    standardWorkHours: 8.0, isActive: true
  });

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    id: '', ruleCategory: '', targetValue: '', parameters: '', effectiveFrom: ''
  });

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    id: '', holidayYear: 2026, holidayName: '', startDate: '', endDate: '', isPaid: true
  });

  // Google Workspace Phase 2 States
  const [googleConfig, setGoogleConfig] = useState({
    gmailEnabled: true,
    gmailHost: 'smtp.gmail.com',
    gmailPort: 587,
    gmailUsername: 'notification@smartcorp.com',
    gmailAppPassword: '',
    senderName: 'SmartCorp HR Portal',
    googleChatEnabled: true,
    generalWebhookUrl: '',
    alertsWebhookUrl: ''
  });
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [recentChatCards, setRecentChatCards] = useState([]);
  const [testEmailAddress, setTestEmailAddress] = useState('test@smartcorp.com');

  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const formatTime = (t) => {
    if (!t) return '-';
    if (typeof t !== 'string') return String(t);
    if (t.includes('T')) return t.split('T')[1].substring(0, 5);
    return t.substring(0, 5);
  };

  const loadData = async () => {
    if (!token) return;
    try {
      // 1. Live Dashboard
      const dashRes = await fetch('/api/v1/attendance/live-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      if (dashData && dashData.success && dashData.data) {
        setLiveData(dashData.data);
      }

      // If user is just an employee, skip admin-only calls to prevent 403 errors
      if (currentUser?.role === 'EMPLOYEE') return;

      // 2. Chấm công khẩn cấp chờ duyệt
      const emRes = await fetch('/api/v1/admin/attendance/emergency-pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (emRes.ok) {
        const emData = await emRes.json();
        if (emData.success) setPendingEmergencies(emData.data || []);
      }

      // 3. Đơn từ chờ duyệt
      const rRes = await fetch('/api/v1/requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.success) setPendingRequests(rData.data || []);
      }

      // 4. Kỳ công
      const pRes = await fetch('/api/v1/timesheets/admin/periods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.success && pData.data?.length > 0) {
          setPeriods(pData.data);
          if (!selectedPeriodId) {
            setSelectedPeriodId(pData.data[0].id);
          }
        }
      }

      // 5. Khiếu nại công 48h
      const dispRes = await fetch('/api/v1/timesheets/admin/disputes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dispRes.ok) {
        const dispData = await dispRes.json();
        if (dispData.success) setDisputes(dispData.data || []);
      }

      // 6. Phòng ban & Nhân viên & Thiết bị
      const dRes = await fetch('/api/v1/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dRes.ok) {
        const dData = await dRes.json();
        if (dData.success) setDepartments(dData.data || []);
      }

      const empRes = await fetch('/api/v1/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        if (empData.success) setEmployees(empData.data || []);
      }

      const devRes = await fetch('/api/v1/devices/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (devRes.ok) {
        const devData = await devRes.json();
        if (devData.success) setAllDevices(devData.data || []);
      }

      // 7. Ca làm việc, Quy định & Ngày lễ
      const sRes = await fetch('/api/v1/admin/settings/shifts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success) setShifts(sData.data || []);
      }

      const polRes = await fetch('/api/v1/admin/settings/policies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (polRes.ok) {
        const polData = await polRes.json();
        if (polData.success) setPolicies(polData.data || []);
      }

      const holRes = await fetch('/api/v1/admin/settings/holidays', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (holRes.ok) {
        const holData = await holRes.json();
        if (holData.success) setHolidays(holData.data || []);
      }

      // 8. Google Workspace Config & Logs
      const cfgRes = await fetch('/api/v1/admin/notifications/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.success && cfgData.data) setGoogleConfig(cfgData.data);
      }

      const logsRes = await fetch('/api/v1/admin/notifications/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (logsData.success) setNotificationLogs(logsData.data || []);
      }

      const cardsRes = await fetch('/api/v1/admin/notifications/recent-chat-cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        if (cardsData.success) setRecentChatCards(cardsData.data || []);
      }

    } catch (e) {
      console.error("Lỗi tải dữ liệu Quản lý:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, currentUser]);

  // Load bảng công ma trận khi chọn kỳ khác
  useEffect(() => {
    if (!selectedPeriodId || !token || currentUser?.role === 'EMPLOYEE') return;
    const fetchMatrix = async () => {
      try {
        const res = await fetch(`/api/v1/timesheets/admin/periods/${selectedPeriodId}/matrix`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTimesheetMatrix(data.data || []);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy ma trận bảng công:", err);
      }
    };
    fetchMatrix();
  }, [selectedPeriodId, token, currentUser]);

  // Phê duyệt chấm công khẩn cấp
  const handleReviewEmergency = async (id, action) => {
    setLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/attendance/emergency/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action,
          comment: action === 'APPROVE' ? 'Quản lý đã xác nhận sự cố' : 'Từ chối: Khoảng cách GPS không hợp lệ'
        })
      });

      const data = await res.json();
      setActionFeedback(data);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Phê duyệt đơn từ
  const handleReviewRequest = async (id, action) => {
    setLoading(true);
    setActionFeedback(null);
    const comment = requestComments[id] || (action === 'APPROVE' ? 'Quản lý đã phê duyệt hợp lệ' : 'Từ chối: Không đáp ứng quy định');
    try {
      const res = await fetch(`/api/v1/requests/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action,
          comment: comment
        })
      });

      const data = await res.json();
      setActionFeedback(data);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Khóa kỳ công
  const handleLockPeriod = async () => {
    if (!selectedPeriodId) return;
    if (!confirm('Bạn có chắc chắn muốn KHÓA BẤT BIẾN kỳ công này? Sau khi khóa, không ai có thể sửa bảng công kỳ này!')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/timesheets/admin/periods/${selectedPeriodId}/lock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback(data);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Tổng hợp lại bảng công kỳ
  const handleAggregatePeriod = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/timesheets/admin/periods/${selectedPeriodId}/aggregate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã tổng hợp lại toàn bộ dữ liệu bảng công cho kỳ thành công!' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Tạo kỳ công mới
  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/timesheets/admin/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(periodForm)
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã tạo kỳ công mới thành công!' });
      setShowPeriodModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Giải quyết khiếu nại công 48h
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!disputeAction.dispute) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/timesheets/admin/disputes/${disputeAction.dispute.id}/resolve?action=${disputeAction.action}&notes=${encodeURIComponent(disputeAction.notes)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: `Đã ${disputeAction.action === 'APPROVE' ? 'chấp thuận bù công' : 'từ chối'} đơn khiếu nại thành công!` });
      setShowDisputeModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Lưu Phòng Ban (Thêm/Sửa)
  const handleSaveDept = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/departments/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(deptForm)
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã lưu thông tin phòng ban thành công!' });
      setShowDeptModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Lưu Nhân Viên (Thêm/Sửa)
  const handleSaveEmp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = empForm.id ? `/api/v1/admin/employees/${empForm.id}` : '/api/v1/admin/employees';
      const method = empForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(empForm)
      });
      const data = await res.json();
      setActionFeedback({ message: empForm.id ? 'Đã cập nhật nhân viên và đồng bộ Keycloak thành công!' : 'Đã thêm nhân viên mới và đồng bộ Keycloak thành công!' });
      setShowEmpModal(false);
      loadData();
      if (onEmployeeUpdated) onEmployeeUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Thu hồi thiết bị chấm công
  const handleRevokeDevice = async (deviceId) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi thiết bị này để nhân viên đăng ký máy mới?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/devices/admin/${deviceId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã thu hồi thiết bị thành công! Nhân viên có thể đăng nhập trên điện thoại mới.' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt lại thiết bị chấm công
  const handleActivateDevice = async (deviceId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/devices/admin/${deviceId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã kích hoạt lại thiết bị thành công!' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Vô hiệu hóa / Xóa nhân viên
  const handleDeleteEmployee = async (empId) => {
    if (!confirm('Bạn có chắc chắn muốn ngừng hoạt động nhân viên này?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/employees/${empId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã ngừng hoạt động nhân viên và vô hiệu hóa Keycloak thành công!' });
      loadData();
      if (onEmployeeUpdated) onEmployeeUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Xóa phòng ban
  const handleDeleteDepartment = async (deptId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/departments/admin/${deptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã xóa phòng ban thành công!' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Xóa ca làm việc
  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/settings/shifts/${shiftId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã xóa ca làm việc thành công!' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Xóa ngày nghỉ lễ
  const handleDeleteHoliday = async (holidayId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngày nghỉ lễ này?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/settings/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã xóa ngày nghỉ lễ thành công!' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật Quy định (Policy Rule)
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/settings/policies/${policyForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          parameters: policyForm.parameters,
          effectiveFrom: policyForm.effectiveFrom,
          effectiveTo: null
        })
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã cập nhật tham số quy tắc thành công!' });
      setShowPolicyModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Thêm/Sửa Ca Làm Việc
  const handleSaveShift = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(shiftForm)
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã lưu cấu hình ca làm việc thành công!' });
      setShowShiftModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Thêm Ngày Lễ Mới
  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(holidayForm)
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã thêm ngày nghỉ lễ doanh nghiệp thành công!' });
      setShowHolidayModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Xuất file CSV chuẩn Excel kế toán (có UTF-8 BOM)
  const handleDownloadCsv = () => {
    if (!selectedPeriodId) return;
    const url = `/api/v1/timesheets/admin/periods/${selectedPeriodId}/export-csv`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `BangCong_${selectedPeriodId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => console.error("Lỗi tải CSV:", err));
  };

  // Lưu cấu hình Google Workspace
  const handleSaveGoogleConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/notifications/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(googleConfig)
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã lưu cấu hình Google Workspace (Gmail & Chat) thành công!' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gửi Email Test
  const handleSendTestEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/notifications/test-email?toEmail=${encodeURIComponent(testEmailAddress)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: `Đã phát lệnh gửi email thử nghiệm tới ${testEmailAddress} (${data.data?.status})` });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bắn Thẻ Google Chat Test
  const handleSendTestChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/notifications/test-chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã bắn thẻ Google Chat Card v2 thử nghiệm thành công!' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt Bản tin Điểm danh Sáng 09:00
  const handleTriggerDailyBulletin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/notifications/daily-bulletin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActionFeedback({ message: 'Đã phát Bản tin Điểm danh Sáng 09:00 tới Space #chamcong-thongbao-chung!' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPeriod = (periods || []).find(p => p.id === selectedPeriodId);

  // ACCESS GUARD: If logged in user is only EMPLOYEE, show helpful switch role banner
  if (currentUser?.role === 'EMPLOYEE') {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 my-12 border border-amber-200 bg-amber-50/50 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Yêu Cầu Quyền Quản Lý Hoặc HR Admin</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tài khoản hiện tại của bạn là <strong>{currentUser?.fullName} ({currentUser?.email})</strong> với vai trò <strong>Nhân viên (EMPLOYEE)</strong> nên không có quyền truy cập Cổng Quản trị.
        </p>
        <p className="text-xs text-slate-500 font-medium">
          Để trải nghiệm duyệt đơn, quản lý quân số, sơ đồ tổ chức và khóa bảng công, vui lòng chọn một trong các vai trò quản trị mẫu bên dưới:
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              if (setCurrentUser) {
                const mgr = usersList?.find(u => u.role === 'MANAGER') || {
                  email: 'lead@congty.com', fullName: 'Trần Văn Mạnh', role: 'MANAGER', title: 'Tech Director', employeeCode: 'IT001'
                };
                setCurrentUser(mgr);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4" /> Chuyển sang Quản lý (Trần Văn Mạnh)
          </button>
          <button
            onClick={() => {
              if (setCurrentUser) {
                const hr = usersList?.find(u => u.role === 'HR_ADMIN') || {
                  email: 'hr@congty.com', fullName: 'Nguyễn Thị Thu', role: 'HR_ADMIN', title: 'HR Manager', employeeCode: 'HR001'
                };
                setCurrentUser(hr);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Chuyển sang HR Admin (Nguyễn Thị Thu)
          </button>
        </div>
      </div>
    );
  }

  const liveList = (liveData?.employeeList || liveData?.records || []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
      {/* Header Profile */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800">
                {currentUser?.role === 'HR_ADMIN' ? 'HR Administrator' : 'Quản lý Bộ phận / Tech Lead'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Phân hệ Giám sát Trực quan, Duyệt Đơn từ, Quản trị Nhân sự & Khóa Kỳ Công
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Giám Sát Đội Ngũ
        </button>

        <button
          onClick={() => setActiveTab('emergencies')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all relative ${
            activeTab === 'emergencies'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Duyệt Khẩn Cấp
          {(pendingEmergencies || []).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {(pendingEmergencies || []).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Duyệt Đơn từ
          {(pendingRequests || []).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
              {(pendingRequests || []).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('timesheets')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'timesheets'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Bảng công & Khóa sổ
          {(disputes || []).filter(d => d.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              {(disputes || []).filter(d => d.status === 'PENDING').length} khiếu nại
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Tổ Chức & Nhân Sự ({(employees || []).length})
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'policies'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Ca làm & Quy chế ({(policies || []).length})
        </button>

        <button
          onClick={() => setActiveTab('google')}
          className={`pb-3 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'google'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4 text-red-500" />
          Google Workspace (Phase 2)
          <span className="px-1.5 py-0.2 bg-red-100 text-red-700 rounded text-[9px] font-bold">New</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
      )}

      {/* TAB 1: Live Team Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Trung Tâm Điều Hành & Giám Sát Quân Số
              </h3>
              <p className="text-xs text-slate-500">Chuyển đổi giữa bảng hiện diện trực tiếp và báo cáo phân tích chuyên sâu</p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setDashboardViewMode('live')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dashboardViewMode === 'live' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hiện Diện Trực Tiếp
              </button>
              <button
                onClick={() => setDashboardViewMode('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dashboardViewMode === 'analytics' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Báo Cáo & Phân Tích Chuyên Sâu
              </button>
            </div>
          </div>

          {dashboardViewMode === 'analytics' ? (
            <ExecutiveAnalyticsDashboard currentUser={currentUser} />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-indigo-600">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Nhân sự</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{liveData?.totalEmployees || 0} người</div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-emerald-500">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Có mặt tại Văn phòng</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{liveData?.presentCount || 0} người</div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-violet-500">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Làm việc từ xa (WFH)</div>
                  <div className="text-2xl font-black text-violet-600 mt-1">{liveData?.wfhCount || 0} người</div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-rose-500">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Vắng mặt / Nghỉ phép</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">{liveData?.absentCount || 0} người</div>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
                  <span>Trạng thái Quân số Thời gian thực</span>
                  <span className="text-xs text-slate-500 font-normal">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Nhân sự</th>
                        <th className="py-3 px-4">Phòng ban</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4">Giờ vào ca</th>
                        <th className="py-3 px-4">Giờ ra ca</th>
                        <th className="py-3 px-4">Hình thức</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liveList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">Đang đồng bộ dữ liệu quân số...</td>
                        </tr>
                      ) : (
                        liveList.map((emp) => (
                          <tr key={emp.employeeId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{emp.fullName}</div>
                              <div className="text-[10px] text-slate-400">{emp.employeeCode}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{emp.departmentName}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                emp.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                                emp.status === 'WFH' ? 'bg-violet-100 text-violet-800' :
                                emp.status === 'LEAVE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {emp.status === 'PRESENT' ? 'CÓ MẶT VĂN PHÒNG' :
                                 emp.status === 'WFH' ? 'LÀM TỪ XA (WFH)' :
                                 emp.status === 'LEAVE' ? 'NGHỈ PHÉP' : 'CHƯA CHECK-IN'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">{formatTime(emp.checkInTime)}</td>
                            <td className="py-3 px-4 font-mono">{formatTime(emp.checkOutTime)}</td>
                            <td className="py-3 px-4 text-slate-500">{emp.statusDesc || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Duyệt Chấm Công Khẩn Cấp */}
      {activeTab === 'emergencies' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Yêu cầu Chấm công Khẩn cấp Chờ Phê Duyệt</h3>
              <p className="text-xs text-slate-500 mt-0.5">Nhân viên gửi yêu cầu khi mất điện hoặc sự cố mạng tại điểm chấm công</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              {(pendingEmergencies || []).length} yêu cầu cần xử lý
            </span>
          </div>

          {(pendingEmergencies || []).length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Hiện tại không có yêu cầu chấm công khẩn cấp nào đang chờ xử lý.
            </div>
          ) : (
            <div className="space-y-4">
              {(pendingEmergencies || []).map((em) => (
                <div key={em.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-800">Mã chấm công: {em.id.substring(0, 8)}...</div>
                      <div className="text-slate-500">Thời gian gửi: {new Date(em.punchTime).toLocaleString('vi-VN')}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingEmergency(em)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi tiết & Toạ độ
                      </button>
                      <button
                        onClick={() => handleReviewEmergency(em.id, 'APPROVE')}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Chấp thuận
                      </button>
                      <button
                        onClick={() => handleReviewEmergency(em.id, 'REJECT')}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                    <strong>Lý do khẩn cấp: </strong> {em.emergencyReason}
                  </div>

                  {em.flags && em.flags.includes('FLAG_LOCATION_MISMATCH') && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span className="font-bold">Cảnh báo sai lệch GPS: Tọa độ gửi lên cách văn phòng công ty vượt mức an toàn (&gt; 100m)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Duyệt Đơn từ */}
      {activeTab === 'approvals' && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                Duyệt Đơn Từ & Hạn Ngạch Nhân Sự
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hệ thống tự động kiểm tra Quota (Đi muộn tối đa 2 lần/tháng, WFH 4 ngày, Nghỉ phép năm)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
              {(pendingRequests || []).length} đơn đang chờ duyệt
            </span>
          </div>

          {(pendingRequests || []).length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Hiện tại không có đơn nào đang chờ phê duyệt.
            </div>
          ) : (
            <div className="space-y-4">
              {(pendingRequests || []).map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {req.requestCode}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          req.requestType === 'WFH' ? 'bg-violet-100 text-violet-800' :
                          req.requestType === 'ANNUAL_LEAVE' ? 'bg-emerald-100 text-emerald-800' :
                          req.requestType === 'SICK_LEAVE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.requestType}
                        </span>
                        {req.isUrgent && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px]">KHẨN CẤP</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {req.employeeName} <span className="text-xs text-slate-500 font-normal">({req.employeeCode} • {req.departmentName})</span>
                      </div>
                    </div>

                    <div className="text-slate-500 text-right">
                      <div>Thời gian: <strong className="text-slate-800">{req.fromDate}</strong> → <strong className="text-slate-800">{req.toDate}</strong></div>
                      {req.durationMinutes ? <div>Thời lượng: <strong>{req.durationMinutes} phút</strong></div> : null}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                    <strong>Lý do nộp đơn: </strong> <em>"{req.reason}"</em>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-end gap-3 pt-2 border-t border-slate-100">
                    <div className="w-full sm:w-2/3">
                      <input
                        type="text"
                        placeholder="Nhập ý kiến phản hồi phê duyệt (tùy chọn)..."
                        value={requestComments[req.id] || ''}
                        onChange={(e) => setRequestComments({ ...requestComments, [req.id]: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingRequest(req)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'APPROVE')}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Duyệt đơn
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'REJECT')}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Bảng công, Khóa kỳ lương & Xử lý Khiếu nại 48h */}
      {activeTab === 'timesheets' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Quản lý Bảng công Tổng hợp & Cổng Khiếu Nại 48h
              </div>
              <p className="text-xs text-slate-500">
                Quy trình 4 bước: 1. Tổng hợp công → 2. Nhân viên phản hồi (48h) → 3. HR chốt & Khóa → 4. Xuất file kế toán
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white shadow-sm"
              >
                {(periods || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    Kỳ {p.periodCode} ({p.status === 'LOCKED' ? '🔒 ĐÃ KHÓA' : '🟢 ĐANG MỞ'})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowPeriodModal(true)}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Mở Kỳ Mới
              </button>

              <button
                onClick={handleAggregatePeriod}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tổng Hợp Lại
              </button>

              {selectedPeriod && selectedPeriod.status !== 'LOCKED' && (
                <button
                  onClick={handleLockPeriod}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" /> Khóa Bất Biến
                </button>
              )}

              <button
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Xuất CSV (Excel)
              </button>
            </div>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
            <button
              onClick={() => setTimesheetSubTab('matrix')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                timesheetSubTab === 'matrix' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Ma Trận Bảng Công ({(timesheetMatrix || []).length} nhân sự)
            </button>
            <button
              onClick={() => setTimesheetSubTab('disputes')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                timesheetSubTab === 'disputes' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Cổng Xử Lý Khiếu Nại 48h ({(disputes || []).length})
            </button>
            <button
              onClick={() => setTimesheetSubTab('calendar')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                timesheetSubTab === 'calendar' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" /> Tra Cứu Lịch Chi Tiết (Năm / Tháng / Ngày)
            </button>
          </div>

          {/* Subtab 1: Matrix View */}
          {timesheetSubTab === 'matrix' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
                <span>Bảng Tổng Hợp Chi Tiết Công Kỳ {selectedPeriod?.periodCode || ''}</span>
                <span className="text-xs text-slate-500 font-normal">Chuẩn xuất Excel UTF-8 BOM chống vỡ font</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Nhân sự</th>
                      <th className="py-3 px-3 text-center">Công chuẩn</th>
                      <th className="py-3 px-3 text-center">Thực tế</th>
                      <th className="py-3 px-3 text-center">WFH</th>
                      <th className="py-3 px-3 text-center">Phép năm</th>
                      <th className="py-3 px-3 text-center">BHXH</th>
                      <th className="py-3 px-3 text-center">Phút trễ</th>
                      <th className="py-3 px-3 text-center">Hồi tố</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(timesheetMatrix || []).map((ts) => {
                      const emp = (employees || []).find(e => e.id === ts.employeeId);
                      return (
                        <tr key={ts.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{emp?.fullName || ts.employeeId}</div>
                            <div className="text-[10px] text-slate-400">{emp?.employeeCode || 'N/A'} • {emp?.email || ''}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{ts.standardWorkDays}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{ts.actualWorkDays}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-violet-600">{ts.wfhDays}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">{ts.paidLeaveDays}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">{ts.socialInsuranceDays}</td>
                          <td className="py-3 px-3 text-center font-mono text-amber-600 font-bold">{ts.lateMinutesTotal}m</td>
                          <td className="py-3 px-3 text-center font-mono text-indigo-600">{ts.retroAdjustmentDays}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ts.isLocked ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-emerald-100 text-emerald-800'}`}>
                              {ts.isLocked ? '🔒 ĐÃ KHÓA' : '🟢 ĐANG MỞ'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: Disputes Management */}
          {timesheetSubTab === 'disputes' && (
            <div className="space-y-4">
              {(disputes || []).length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400">
                  Không có đơn khiếu nại công nào trong hệ thống.
                </div>
              ) : (
                <div className="space-y-3">
                  {(disputes || []).map((d) => {
                    const emp = (employees || []).find(e => e.id === d.employeeId);
                    return (
                      <div key={d.id} className="glass-card rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{emp?.fullName || 'Nhân viên'}</span>
                              <span className="font-mono text-xs text-slate-500">({emp?.employeeCode})</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                                d.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {d.status === 'ACCEPTED' ? '✓ ĐÃ CHẤP THUẬN' : d.status === 'REJECTED' ? '✕ ĐÃ TỪ CHỐI' : '⏳ CHỜ HR XỬ LÝ'}
                              </span>
                            </div>
                            <div className="text-slate-500 mt-1">
                              Ngày công khiếu nại: <strong className="text-slate-800">{d.disputedDate}</strong> • Nộp lúc: {new Date(d.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingDispute(d)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Chi tiết
                            </button>
                            {d.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setDisputeAction({ dispute: d, action: 'APPROVE', notes: 'HR đã xác nhận dữ liệu và bù 1 ngày công vào kỳ sau' });
                                    setShowDisputeModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                >
                                  Chấp thuận & Bù công
                                </button>
                                <button
                                  onClick={() => {
                                    setDisputeAction({ dispute: d, action: 'REJECT', notes: 'Từ chối: Dữ liệu camera không ghi nhận check-in' });
                                    setShowDisputeModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                          <strong>Lý do của nhân viên: </strong> <em>"{d.reason}"</em>
                        </div>

                        {d.hrResponse && (
                          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-start gap-2">
                            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div><strong>Phản hồi của HR: </strong>{d.hrResponse}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subtab 3: Tra Cứu Lịch Chi Tiết (Năm / Tháng / Ngày) */}
          {timesheetSubTab === 'calendar' && (
            <DetailedTimesheetView 
              isManagerView={true}
              allEmployees={employees}
              currentUser={currentUser}
            />
          )}
        </div>
      )}

      {/* TAB 5: Cơ cấu Tổ chức & Quản lý Nhân sự & Thiết bị */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Cơ Cấu Tổ Chức, Nhân Sự & Quản Lý Thiết Bị Chấm Công
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Phân cấp đa tầng, phân quyền truy cập RBAC và chính sách 1 tài khoản - 1 thiết bị kích hoạt
              </p>
            </div>

            <div className="flex items-center gap-2">
              {orgSubTab === 'departments' && (
                <button
                  onClick={() => {
                    setDeptForm({ id: '', code: '', name: '', managerId: '', parentId: '' });
                    setShowDeptModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Phòng Ban
                </button>
              )}
              {orgSubTab === 'employees' && (
                <button
                  onClick={() => {
                    setEmpForm({
                      id: '', employeeCode: 'EMP-' + Math.floor(100 + Math.random() * 900),
                      fullName: '', email: '', departmentId: (departments || [])[0]?.id || '',
                      directManagerId: '', contractType: 'OFFICIAL', appRole: 'EMPLOYEE', isActive: true
                    });
                    setShowEmpModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Thêm Nhân Viên
                </button>
              )}
            </div>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
            <button
              onClick={() => setOrgSubTab('departments')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                orgSubTab === 'departments' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" /> Phòng Ban ({(departments || []).length})
            </button>
            <button
              onClick={() => setOrgSubTab('employees')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                orgSubTab === 'employees' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" /> Danh Sách Nhân Sự ({(employees || []).length})
            </button>
            <button
              onClick={() => setOrgSubTab('devices')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                orgSubTab === 'devices' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Quản Lý Thiết Bị Di Động ({(allDevices || []).length})
            </button>
          </div>

          {/* Subtab 1: Departments */}
          {orgSubTab === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(departments || []).map((dept) => {
                const manager = (employees || []).find(e => e.id === dept.managerId);
                const parentDept = (departments || []).find(d => d.id === dept.parentId);
                const deptMembers = (employees || []).filter(e => e.departmentId === dept.id);

                return (
                  <div key={dept.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {dept.code}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">{dept.name}</h4>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Thuộc: <strong>{parentDept ? parentDept.name : 'Ban Giám Đốc (Root)'}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingDepartment(dept)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Xem chi tiết phòng ban"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeptForm({
                              id: dept.id, code: dept.code, name: dept.name,
                              managerId: dept.managerId || '', parentId: dept.parentId || ''
                            });
                            setShowDeptModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa phòng ban"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa phòng ban"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400">Trưởng đơn vị: </span>
                        <strong className="text-slate-800">{manager?.fullName || 'Chưa gán'}</strong>
                      </div>
                      <div className="text-slate-500 font-medium">
                        Quy mô: <strong className="text-indigo-600">{deptMembers.length}</strong> nhân sự
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtab 2: Employees */}
          {orgSubTab === 'employees' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Mã NV</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Phòng ban</th>
                      <th className="py-3 px-4">Loại HĐ</th>
                      <th className="py-3 px-4">Vai trò RBAC</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(employees || []).map((emp) => {
                      const dept = (departments || []).find(d => d.id === emp.departmentId);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">{emp.employeeCode}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{emp.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{dept?.name || 'Chưa gán'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {emp.contractType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              emp.appRole === 'HR_ADMIN' ? 'bg-purple-100 text-purple-800' :
                              emp.appRole === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {emp.appRole}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {emp.isActive ? 'HOẠT ĐỘNG' : 'KHÓA'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingEmployee(emp)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-[11px] flex items-center gap-1"
                                title="Xem hồ sơ & chi tiết"
                              >
                                <Eye className="w-3 h-3" /> Chi tiết
                              </button>
                              <button
                                onClick={() => {
                                  setEmpForm({
                                    id: emp.id, employeeCode: emp.employeeCode, fullName: emp.fullName, email: emp.email,
                                    departmentId: emp.departmentId || '', directManagerId: emp.directManagerId || '',
                                    contractType: emp.contractType, appRole: emp.appRole, isActive: emp.isActive
                                  });
                                  setShowEmpModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-[11px]"
                              >
                                Sửa / Đổi quyền
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Ngừng hoạt động nhân viên"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 3: Device Binding */}
          {orgSubTab === 'devices' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
                <span>Danh Sách Thiết Bị Di Động Chấm Công Được Cấp Phép (Anti-Buddy Punching)</span>
                <span className="text-xs text-slate-500 font-normal">Chỉ thiết bị ACTIVE mới được phép gửi mã chấm công</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Nhân sự</th>
                      <th className="py-3 px-4">Tên thiết bị</th>
                      <th className="py-3 px-4">Nền tảng</th>
                      <th className="py-3 px-4">Mã Thiết Bị (Token)</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(allDevices || []).map((dev) => {
                      const emp = (employees || []).find(e => e.id === dev.employeeId);
                      return (
                        <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{emp?.fullName || dev.employeeId}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{emp?.employeeCode}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{dev.deviceName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                              {dev.platform}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {dev.deviceToken?.substring(0, 16)}...
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dev.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {dev.status === 'ACTIVE' ? 'ĐANG KÍCH HOẠT' : 'ĐÃ THU HỒI'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingDevice(dev)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Chi tiết
                              </button>
                              {dev.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleRevokeDevice(dev.id)}
                                  disabled={loading}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                                >
                                  Thu hồi máy cũ
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateDevice(dev.id)}
                                  disabled={loading}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                                >
                                  Kích hoạt lại
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Ca làm & Quy định & Ngày lễ */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-600" />
                Cấu Hình Ca Làm Việc, Quy Chế Hạn Ngạch & Lịch Nghỉ Lễ
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bộ quy tắc được Policy Engine kiểm tra tự động trước khi cho phép nhân viên nộp đơn
              </p>
            </div>

            <div className="flex items-center gap-2">
              {policySubTab === 'shifts' && (
                <button
                  onClick={() => {
                    setShiftForm({
                      id: '', shiftCode: 'CA_MOI_' + Math.floor(Math.random() * 100),
                      shiftName: 'Ca làm việc mới', shiftType: 'FIXED',
                      startTime: '08:30:00', endTime: '17:30:00', lunchBreakStart: '12:00:00', lunchBreakEnd: '13:00:00',
                      standardWorkHours: 8.0, isActive: true
                    });
                    setShowShiftModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Ca Làm
                </button>
              )}
              {policySubTab === 'holidays' && (
                <button
                  onClick={() => {
                    setHolidayForm({
                      id: '', holidayYear: 2026, holidayName: '', startDate: '', endDate: '', isPaid: true
                    });
                    setShowHolidayModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Ngày Lễ
                </button>
              )}
            </div>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
            <button
              onClick={() => setPolicySubTab('rules')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                policySubTab === 'rules' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Sliders className="w-4 h-4" /> Bộ Quy Tắc Doanh Nghiệp ({(policies || []).length})
            </button>
            <button
              onClick={() => setPolicySubTab('shifts')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                policySubTab === 'shifts' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4" /> Ca Làm Việc ({(shifts || []).length})
            </button>
            <button
              onClick={() => setPolicySubTab('holidays')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 ${
                policySubTab === 'holidays' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" /> Lịch Nghỉ Lễ ({(holidays || []).length})
            </button>
          </div>

          {/* Subtab 1: Policy Rules */}
          {policySubTab === 'rules' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(policies || []).map((p) => {
                let parsed = {};
                try { parsed = JSON.parse(p.parameters); } catch(e) {}
                return (
                  <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                          {p.ruleCategory}
                        </span>
                        <div className="text-xs text-slate-500 mt-1">
                          Áp dụng: <strong>{p.targetType} = {p.targetValue}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPolicyForm({
                            id: p.id, ruleCategory: p.ruleCategory, targetValue: p.targetValue,
                            parameters: p.parameters, effectiveFrom: p.effectiveFrom
                          });
                          setShowPolicyModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Chỉnh sửa tham số"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 font-mono text-slate-700">
                      {Object.entries(parsed).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500 font-sans">{k}:</span>
                          <strong className="text-slate-900">{String(v)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Hiệu lực từ: {p.effectiveFrom}</span>
                      <span>Trạng thái: Đang áp dụng</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtab 2: Work Shifts */}
          {policySubTab === 'shifts' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(shifts || []).map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s.shiftCode}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingShift(s)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Xem chi tiết ca làm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setShiftForm({
                            id: s.id, shiftCode: s.shiftCode, shiftName: s.shiftName, shiftType: s.shiftType,
                            startTime: s.startTime, endTime: s.endTime, lunchBreakStart: s.lunchBreakStart, lunchBreakEnd: s.lunchBreakEnd,
                            standardWorkHours: s.standardWorkHours, isActive: s.isActive
                          });
                          setShowShiftModal(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Chỉnh sửa ca làm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteShift(s.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa ca làm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{s.shiftName}</div>
                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Giờ làm:</span>
                      <strong className="font-mono text-indigo-700">{s.startTime} → {s.endTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Nghỉ trưa:</span>
                      <strong className="font-mono">{s.lunchBreakStart} → {s.lunchBreakEnd}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Công chuẩn:</span>
                      <strong>{s.standardWorkHours} giờ/ngày</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 3: Holidays */}
          {policySubTab === 'holidays' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(holidays || []).map((h) => (
                <div key={h.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold text-[10px] border border-pink-200">
                      Năm {h.holidayYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        HƯỞNG LƯƠNG 100%
                      </span>
                      <button
                        onClick={() => setViewingHoliday(h)}
                        className="p-1 rounded text-slate-400 hover:text-pink-600 hover:bg-pink-50"
                        title="Xem chi tiết ngày lễ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHoliday(h.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa ngày lễ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{h.holidayName}</div>
                  <div className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
                    Thời gian nghỉ: <strong className="text-slate-800">{h.startDate}</strong> {h.endDate !== h.startDate ? `→ ${h.endDate}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Mở Kỳ Công Mới */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Mở Kỳ Công Mới (Payroll Period)</h3>
              <button onClick={() => setShowPeriodModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreatePeriod} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã kỳ công:</label>
                <input
                  type="text" required
                  value={periodForm.periodCode}
                  onChange={(e) => setPeriodForm({ ...periodForm, periodCode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  placeholder="KY_12_2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Từ ngày:</label>
                  <input
                    type="date" required
                    value={periodForm.startDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                  <input
                    type="date" required
                    value={periodForm.endDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPeriodModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Lưu Kỳ Công</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Xử Lý Khiếu Nại Công */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {disputeAction.action === 'APPROVE' ? 'Chấp Thuận & Hồi Tố Bù Công' : 'Từ Chối Đơn Khiếu Nại'}
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleResolveDispute} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <div>Ngày khiếu nại: <strong>{disputeAction.dispute?.disputedDate}</strong></div>
                <div className="mt-1">Lý do: <em>"{disputeAction.dispute?.reason}"</em></div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Quyết định của HR:</label>
                <textarea
                  rows={3} required
                  value={disputeAction.notes}
                  onChange={(e) => setDisputeAction({ ...disputeAction, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowDisputeModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white font-bold ${disputeAction.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                  Xác Nhận Xử Lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Thêm / Sửa Phòng Ban */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">{deptForm.id ? 'Sửa Phòng Ban' : 'Thêm Phòng Ban Mới'}</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã phòng ban:</label>
                <input
                  type="text" required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  placeholder="IT_DEPT"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên phòng ban:</label>
                <input
                  type="text" required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  placeholder="Ban Công Nghệ"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Trưởng phòng:</label>
                <select
                  value={deptForm.managerId}
                  onChange={(e) => setDeptForm({ ...deptForm, managerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Chọn trưởng phòng --</option>
                  {(employees || []).map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng ban cha:</label>
                <select
                  value={deptForm.parentId}
                  onChange={(e) => setDeptForm({ ...deptForm, parentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Không có (Thuộc Ban Giám Đốc) --</option>
                  {(departments || []).filter(d => d.id !== deptForm.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Lưu Phòng Ban</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Thêm / Sửa Nhân Viên */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">{empForm.id ? 'Sửa Nhân Viên & Cấp Quyền' : 'Thêm Nhân Viên Mới'}</h3>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEmp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã nhân viên:</label>
                  <input
                    type="text" required
                    value={empForm.employeeCode}
                    onChange={(e) => setEmpForm({ ...empForm, employeeCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên:</label>
                  <input
                    type="text" required
                    value={empForm.fullName}
                    onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email:</label>
                <input
                  type="email" required
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng ban:</label>
                  <select
                    value={empForm.departmentId}
                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quản lý trực tiếp:</label>
                  <select
                    value={empForm.directManagerId}
                    onChange={(e) => setEmpForm({ ...empForm, directManagerId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Không có --</option>
                    {(employees || []).filter(e => e.id !== empForm.id).map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại hợp đồng:</label>
                  <select
                    value={empForm.contractType}
                    onChange={(e) => setEmpForm({ ...empForm, contractType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="OFFICIAL">Chính thức (OFFICIAL)</option>
                    <option value="PROBATION">Thử việc (PROBATION)</option>
                    <option value="INTERN">Thực tập (INTERN)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò (Role):</label>
                  <select
                    value={empForm.appRole}
                    onChange={(e) => setEmpForm({ ...empForm, appRole: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="EMPLOYEE">Nhân viên (EMPLOYEE)</option>
                    <option value="MANAGER">Quản lý (MANAGER)</option>
                    <option value="HR_ADMIN">Quản trị HR (HR_ADMIN)</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Lưu Nhân Viên</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Chỉnh Sửa Quy Tắc (Policy Rule) */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Chỉnh Sửa Tham Số Quy Tắc ({policyForm.ruleCategory})</h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSavePolicy} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tham số cấu hình (JSON Parameters):</label>
                <textarea
                  rows={5} required
                  value={policyForm.parameters}
                  onChange={(e) => setPolicyForm({ ...policyForm, parameters: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu hiệu lực:</label>
                <input
                  type="date" required
                  value={policyForm.effectiveFrom}
                  onChange={(e) => setPolicyForm({ ...policyForm, effectiveFrom: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPolicyModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Lưu Quy Tắc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Thêm/Sửa Ca Làm Việc */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">{shiftForm.id ? 'Sửa Ca Làm Việc' : 'Thêm Ca Làm Mới'}</h3>
              <button onClick={() => setShowShiftModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveShift} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã ca:</label>
                  <input
                    type="text" required
                    value={shiftForm.shiftCode}
                    onChange={(e) => setShiftForm({ ...shiftForm, shiftCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên ca:</label>
                  <input
                    type="text" required
                    value={shiftForm.shiftName}
                    onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ vào ca:</label>
                  <input
                    type="text" required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    placeholder="08:30:00"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ ra ca:</label>
                  <input
                    type="text" required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    placeholder="17:30:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nghỉ trưa từ:</label>
                  <input
                    type="text"
                    value={shiftForm.lunchBreakStart}
                    onChange={(e) => setShiftForm({ ...shiftForm, lunchBreakStart: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    placeholder="12:00:00"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đến:</label>
                  <input
                    type="text"
                    value={shiftForm.lunchBreakEnd}
                    onChange={(e) => setShiftForm({ ...shiftForm, lunchBreakEnd: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    placeholder="13:00:00"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số giờ công chuẩn (giờ):</label>
                <input
                  type="number" step="0.5" required
                  value={shiftForm.standardWorkHours}
                  onChange={(e) => setShiftForm({ ...shiftForm, standardWorkHours: parseFloat(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowShiftModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Lưu Ca Làm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Thêm Ngày Lễ */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Thêm Ngày Nghỉ Lễ Doanh Nghiệp</h3>
              <button onClick={() => setShowHolidayModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveHoliday} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên ngày lễ:</label>
                <input
                  type="text" required
                  value={holidayForm.holidayName}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holidayName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  placeholder="Tết Dương Lịch 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Từ ngày:</label>
                  <input
                    type="date" required
                    value={holidayForm.startDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                  <input
                    type="date" required
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowHolidayModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold">Lưu Ngày Lễ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 7: GOOGLE WORKSPACE (GMAIL & GOOGLE CHAT INTEGRATION - PHASE 2) */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-red-50 via-white to-blue-50 border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-100 text-red-600 font-bold">
                    <Mail className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tích Hợp Toàn Diện Google Workspace (Gmail & Google Chat)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Phase 2 Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  Duyệt đơn siêu tốc 1 chạm (One-Click Approval) từ Gmail, nhận cảnh báo vi phạm GPS tức thời vào Google Chat Space, phát bản tin điểm danh sáng 09:00 tự động.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendTestChat}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  Bắn Chat Card Test
                </button>
                <button
                  onClick={handleTriggerDailyBulletin}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Bản Tin Điểm Danh 09:00
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Form & Live Interactive Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Configuration Inputs */}
            <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Cấu Hình Kết Nối (Gmail SMTP & Webhooks)
              </h4>
              <p className="text-xs text-slate-500">
                Có thể dùng Gmail cá nhân với Mật khẩu ứng dụng 16 ký tự hoặc tài khoản Google Workspace công ty.
              </p>

              <form onSubmit={handleSaveGoogleConfig} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gmail SMTP Host:</label>
                    <input
                      type="text"
                      value={googleConfig.gmailHost || 'smtp.gmail.com'}
                      onChange={(e) => setGoogleConfig({ ...googleConfig, gmailHost: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cổng SMTP (Port):</label>
                    <input
                      type="number"
                      value={googleConfig.gmailPort || 587}
                      onChange={(e) => setGoogleConfig({ ...googleConfig, gmailPort: parseInt(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Người Gửi (Username):</label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com hoặc hr@smartcorp.com"
                    value={googleConfig.gmailUsername || ''}
                    onChange={(e) => setGoogleConfig({ ...googleConfig, gmailUsername: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex justify-between">
                    <span>Mật khẩu ứng dụng (Google App Password - 16 ký tự):</span>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                      Lấy mã <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập 16 ký tự Mật khẩu ứng dụng..."
                    value={googleConfig.gmailAppPassword || ''}
                    onChange={(e) => setGoogleConfig({ ...googleConfig, gmailAppPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    *Nếu để trống, hệ thống tự động chạy ở chế độ Mô phỏng (Simulated Mode) để thử nghiệm.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Chat Webhook Space Chung (#chamcong-thongbao-chung):
                  </label>
                  <input
                    type="url"
                    placeholder="https://chat.googleapis.com/v1/spaces/XXXX/messages?key=..."
                    value={googleConfig.generalWebhookUrl || ''}
                    onChange={(e) => setGoogleConfig({ ...googleConfig, generalWebhookUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Chat Webhook Space Cảnh Báo (#hr-security-alerts):
                  </label>
                  <input
                    type="url"
                    placeholder="https://chat.googleapis.com/v1/spaces/YYYY/messages?key=..."
                    value={googleConfig.alertsWebhookUrl || ''}
                    onChange={(e) => setGoogleConfig({ ...googleConfig, alertsWebhookUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Lưu Cấu Hình
                  </button>
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-600" /> Test Mail
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Interactive Google Chat Card v2 Simulator */}
            <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  Mô Phỏng Trực Quan Thẻ Google Chat Card v2
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Interactive Preview</span>
              </div>

              {/* Chat Window Frame */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 pb-2 border-b border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Google Chat • Space: #chamcong-thongbao-chung</span>
                </div>

                {/* Simulated Interactive Card */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-xs">
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-100 flex items-center space-x-3">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">ĐƠN CẦN PHÊ DUYỆT: WFH</div>
                      <div className="text-[11px] text-slate-500">Lê Hoàng Nam (IT002 - Software Engineer)</div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 text-slate-700 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Thời gian:</span>
                      <strong className="text-slate-900">27/11/2026 (08:30 - 17:30)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Quota WFH tháng:</span>
                      <strong className="text-violet-600 font-bold">Còn 3 / 4 ngày WFH</strong>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-400">Lý do:</span>
                      <div className="mt-0.5 text-slate-800 italic">"Bảo dưỡng định kỳ đường ống nước chung cư, xin phép làm online."</div>
                    </div>
                  </div>

                  {/* Interactive Button Group */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => alert("✅ Thử nghiệm tương tác: Nút Phê Duyệt trên Google Chat Card đã kích hoạt thành công!")}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Phê Duyệt Nhanh
                    </button>
                    <button
                      onClick={() => alert("❌ Thử nghiệm tương tác: Nút Từ Chối trên Google Chat Card đã kích hoạt!")}
                      className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Từ Chối
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic text-center">
                  *Người nhận có thể click nút trực tiếp ngay trong ứng dụng Google Chat trên điện thoại hoặc máy tính.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Audit Log Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Nhật Ký Thông Báo Google Workspace Gần Đây ({notificationLogs.length} bản ghi)
              </span>
              <button onClick={loadData} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Làm mới log
              </button>
            </div>

            {notificationLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Chưa có thông báo nào được phát đi. Hãy thử bấm các nút test phía trên.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-3">Kênh</th>
                      <th className="py-3 px-3">Loại sự kiện</th>
                      <th className="py-3 px-4">Tiêu đề / Nội dung</th>
                      <th className="py-3 px-3">Người nhận / Space</th>
                      <th className="py-3 px-3 text-center">Trạng thái</th>
                      <th className="py-3 px-3 text-center">Action Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notificationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.channel === 'GMAIL' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {log.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{log.type}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate" title={log.title}>
                          {log.title}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{log.recipient}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' :
                            log.status === 'SIMULATED' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status === 'SENT' ? 'ĐÃ GỬI' : log.status === 'SIMULATED' ? 'MÔ PHỎNG' : 'THẤT BẠI'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {log.actionUrl ? (
                            <a
                              href={log.actionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              Thử Click <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING EMPLOYEE */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Hồ Sơ Nhân Sự Chi Tiết</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{viewingEmployee.employeeCode}</p>
                </div>
              </div>
              <button onClick={() => setViewingEmployee(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Họ và tên:</span>
                  <strong className="text-slate-800 text-sm">{viewingEmployee.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email công ty:</span>
                  <span className="text-slate-700 font-medium font-mono text-[11px]">{viewingEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phòng ban:</span>
                  <strong className="text-indigo-600">
                    {(departments || []).find(d => d.id === viewingEmployee.departmentId)?.name || 'Chưa gán'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quản lý trực tiếp:</span>
                  <span className="text-slate-800 font-medium">
                    {(employees || []).find(e => e.id === viewingEmployee.directManagerId)?.fullName || 'Ban Giám Đốc'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Loại hợp đồng:</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    {viewingEmployee.contractType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vai trò RBAC:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    {viewingEmployee.appRole}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 font-bold text-xs block mb-1.5">Thiết bị chấm công gắn kèm (Hardware Binding):</span>
                {(() => {
                  const dev = (allDevices || []).find(d => d.employeeId === viewingEmployee.id);
                  return dev ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-900">{dev.deviceName} ({dev.platform})</div>
                        <div className="font-mono text-[10px] text-emerald-700">Token: {dev.deviceToken?.substring(0, 20)}...</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                        {dev.status}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-center italic">
                      Chưa kích hoạt thiết bị di động nào
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING DEPARTMENT */}
      {viewingDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Phòng Ban</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Mã: {viewingDepartment.code}</p>
                </div>
              </div>
              <button onClick={() => setViewingDepartment(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên đơn vị:</span>
                  <strong className="text-slate-900 text-sm">{viewingDepartment.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trực thuộc:</span>
                  <span className="font-medium text-slate-700">
                    {(departments || []).find(d => d.id === viewingDepartment.parentId)?.name || 'Ban Giám Đốc (Root)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trưởng phòng:</span>
                  <strong className="text-indigo-600">
                    {(employees || []).find(e => e.id === viewingDepartment.managerId)?.fullName || 'Chưa gán'}
                  </strong>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-2">Danh sách thành viên trực thuộc:</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {(() => {
                    const members = (employees || []).filter(e => e.departmentId === viewingDepartment.id);
                    if (members.length === 0) {
                      return <p className="text-slate-400 italic text-center py-4">Chưa có nhân sự nào trong phòng này</p>;
                    }
                    return members.map(m => (
                      <div key={m.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{m.fullName}</span>
                          <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({m.employeeCode})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {m.appRole}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewingDepartment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING DEVICE */}
      {viewingDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Thiết Bị Di Động</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {viewingDevice.id?.substring(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setViewingDevice(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên thiết bị:</span>
                  <strong className="text-slate-900">{viewingDevice.deviceName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hệ điều hành:</span>
                  <span className="font-mono font-bold text-indigo-700">{viewingDevice.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ sở hữu:</span>
                  <strong className="text-slate-800">
                    {(employees || []).find(e => e.id === viewingDevice.employeeId)?.fullName || viewingDevice.employeeId}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    viewingDevice.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {viewingDevice.status === 'ACTIVE' ? 'ĐANG KÍCH HOẠT' : 'ĐÃ THU HỒI'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Device Token (Khóa định danh phần cứng):</span>
                <div className="p-2.5 rounded-xl bg-slate-100 font-mono text-[10px] text-slate-700 break-all select-all">
                  {viewingDevice.deviceToken}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
              {viewingDevice.status === 'ACTIVE' ? (
                <button
                  onClick={() => {
                    handleRevokeDevice(viewingDevice.id);
                    setViewingDevice(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Thu Hồi Thiết Bị Này
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleActivateDevice(viewingDevice.id);
                    setViewingDevice(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Kích Hoạt Lại Thiết Bị
                </button>
              )}
              <button
                onClick={() => setViewingDevice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING SHIFT */}
      {viewingShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Ca Làm Việc</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{viewingShift.shiftCode}</p>
                </div>
              </div>
              <button onClick={() => setViewingShift(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên ca:</span>
                  <strong className="text-slate-900">{viewingShift.shiftName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại ca:</span>
                  <span className="font-bold text-indigo-700">{viewingShift.shiftType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian làm việc:</span>
                  <strong className="font-mono text-indigo-600">{viewingShift.startTime} → {viewingShift.endTime}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khoảng nghỉ trưa:</span>
                  <span className="font-mono text-slate-700">{viewingShift.lunchBreakStart} → {viewingShift.lunchBreakEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Công chuẩn:</span>
                  <strong className="text-emerald-700">{viewingShift.standardWorkHours} giờ / ngày</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {viewingShift.isActive ? 'ĐANG ÁP DỤNG' : 'TẠM DỪNG'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewingShift(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING HOLIDAY */}
      {viewingHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Ngày Nghỉ Lễ</h3>
                  <p className="text-[11px] text-slate-500">Năm {viewingHoliday.holidayYear}</p>
                </div>
              </div>
              <button onClick={() => setViewingHoliday(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên ngày lễ:</span>
                  <strong className="text-slate-900 text-sm">{viewingHoliday.holidayName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian nghỉ:</span>
                  <strong className="text-indigo-700">{viewingHoliday.startDate} {viewingHoliday.endDate !== viewingHoliday.startDate ? `→ ${viewingHoliday.endDate}` : ''}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chế độ lương:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    HƯỞNG NGUYÊN 100% LƯƠNG
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewingHoliday(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING REQUEST */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Đơn Xin Phép & Hạn Ngạch</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{viewingRequest.requestCode}</p>
                </div>
              </div>
              <button onClick={() => setViewingRequest(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nhân viên gửi:</span>
                  <strong className="text-slate-900">{viewingRequest.employeeName} ({viewingRequest.employeeCode})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại đơn:</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 text-[10px]">
                    {viewingRequest.requestType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian nghỉ / WFH:</span>
                  <strong className="text-slate-800">{viewingRequest.fromDate} → {viewingRequest.toDate}</strong>
                </div>
                {viewingRequest.durationMinutes && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời lượng:</span>
                    <strong className="text-slate-800">{viewingRequest.durationMinutes} phút</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-[10px]">
                    {viewingRequest.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">Lý do xin phép:</span>
                <p className="text-slate-800 italic">"{viewingRequest.reason}"</p>
              </div>

              {viewingRequest.requestType === 'SICK_LEAVE' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Chứng từ đính kèm chuẩn mẫu BHXH C65-HD đã được tải lên và xác thực.</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleReviewRequest(viewingRequest.id, 'APPROVE');
                    setViewingRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Duyệt Đơn
                </button>
                <button
                  onClick={() => {
                    handleReviewRequest(viewingRequest.id, 'REJECT');
                    setViewingRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Từ Chối
                </button>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING EMERGENCY */}
      {viewingEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Yêu Cầu Chấm Công Khẩn Cấp</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {viewingEmergency.id?.substring(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setViewingEmergency(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian gửi:</span>
                  <strong className="text-slate-900">{new Date(viewingEmergency.punchTime).toLocaleString('vi-VN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hình thức chấm:</span>
                  <span className="font-bold text-indigo-700">{viewingEmergency.verificationMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tọa độ GPS:</span>
                  <span className="font-mono text-slate-800">
                    {viewingEmergency.latitude && viewingEmergency.longitude
                      ? `${viewingEmergency.latitude.toFixed(6)}, ${viewingEmergency.longitude.toFixed(6)}`
                      : 'Không có dữ liệu GPS'}
                  </span>
                </div>
                {viewingEmergency.latitude && viewingEmergency.longitude && (
                  <div className="flex justify-end">
                    <a
                      href={`https://www.google.com/maps?q=${viewingEmergency.latitude},${viewingEmergency.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Xem vị trí trên Google Maps
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">Lý do khẩn cấp:</span>
                <p className="text-slate-800 italic">"{viewingEmergency.emergencyReason}"</p>
              </div>

              {viewingEmergency.flags && viewingEmergency.flags.includes('FLAG_LOCATION_MISMATCH') && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-bold">Cảnh báo sai lệch GPS: Tọa độ gửi lên cách văn phòng công ty vượt mức an toàn (&gt; 100m)</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleReviewEmergency(viewingEmergency.id, 'APPROVE');
                    setViewingEmergency(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Chấp Thuận
                </button>
                <button
                  onClick={() => {
                    handleReviewEmergency(viewingEmergency.id, 'REJECT');
                    setViewingEmergency(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Từ Chối
                </button>
              </div>
              <button
                onClick={() => setViewingEmergency(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL: VIEWING DISPUTE */}
      {viewingDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Khiếu Nại Bảng Công 48h</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {viewingDispute.id?.substring(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setViewingDispute(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày công khiếu nại:</span>
                  <strong className="text-slate-900 text-sm">{viewingDispute.disputedDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian nộp đơn:</span>
                  <span className="text-slate-700">{new Date(viewingDispute.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    viewingDispute.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    viewingDispute.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingDispute.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">Lý do của nhân viên:</span>
                <p className="text-slate-800 italic">"{viewingDispute.reason}"</p>
              </div>

              {viewingDispute.hrResponse && (
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                  <span className="font-bold block mb-1">Phản hồi của HR:</span>
                  <p>{viewingDispute.hrResponse}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
              {viewingDispute.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDisputeAction({ dispute: viewingDispute, action: 'APPROVE', notes: 'HR đã xác nhận dữ liệu và bù 1 ngày công vào kỳ sau' });
                      setShowDisputeModal(true);
                      setViewingDispute(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Chấp Thuận & Bù Công
                  </button>
                  <button
                    onClick={() => {
                      setDisputeAction({ dispute: viewingDispute, action: 'REJECT', notes: 'Từ chối: Dữ liệu camera không ghi nhận check-in' });
                      setShowDisputeModal(true);
                      setViewingDispute(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    Từ Chối
                  </button>
                </div>
              ) : null}
              <button
                onClick={() => setViewingDispute(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs ml-auto"
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
