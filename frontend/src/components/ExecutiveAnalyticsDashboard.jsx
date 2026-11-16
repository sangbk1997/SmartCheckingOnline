import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Clock, AlertTriangle, 
  Home, Calendar, ShieldCheck, Download, RefreshCw, 
  ChevronRight, Building2, UserCheck, Award
} from 'lucide-react';

export default function ExecutiveAnalyticsDashboard({ currentUser }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today'); // 'today' | 'week' | 'month'

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/timesheets/admin/analytics', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            Executive HR & Attendance Analytics
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Dashboard Báo Cáo & Phân Tích Chuyên Sâu
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Tổng hợp dữ liệu hiện diện thời gian thực, đánh giá tỷ lệ chuyên cần theo phòng ban, theo dõi tình hình đi muộn và phân tích xu hướng biến động nhân sự.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm Mới
          </button>

          <button 
            onClick={() => {
              window.open('/api/v1/timesheets/admin/periods/p-2026-11/export-csv', '_blank');
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all"
          >
            <Download className="w-4 h-4" /> Xuất Báo Cáo Tổng Hợp
          </button>
        </div>
      </div>

      {/* 6 Top Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng Nhân Sự</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {analytics?.totalEmployees || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 100% Hoạt động
          </span>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Tỷ Lệ Đi Làm Hôm Nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {analytics?.attendanceRateToday || 0}%
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${analytics?.attendanceRateToday || 0}%` }}
            />
          </div>
        </div>

        {/* Present On Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Có Mặt Tại VP</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {analytics?.presentToday || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Check-in Kiosk QR</span>
        </div>

        {/* Late Checkins */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Đi Muộn Hôm Nay</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {analytics?.lateToday || 0}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1">Sau 08:40</span>
        </div>

        {/* WFH Today */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-semibold">Làm Từ Xa (WFH)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">
            {analytics?.wfhToday || 0}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1">Đã duyệt hợp lệ</span>
        </div>

        {/* Leave & Absent */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm bg-gradient-to-br from-white to-rose-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">Nghỉ Phép / Chưa Đến</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {analytics?.absentToday || 0}
          </div>
          <span className="text-[11px] text-rose-500 mt-1">Cần theo dõi</span>
        </div>
      </div>

      {/* Row 2: Department Presence Performance & 6-Month Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Attendance Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Tỷ Lệ Điểm Danh Theo Khối Phòng Ban
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Hôm nay</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {analytics?.departmentBreakdown?.map((dept, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {dept.name} <span className="text-slate-400 font-normal">({dept.code})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{dept.presentCount}/{dept.employeeCount} NV</span>
                    <strong className="text-indigo-600 font-extrabold text-sm">{dept.ratePercent}%</strong>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dept.ratePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Month Attendance Trend Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Xu Hướng Chuyên Cần 6 Tháng Gần Nhất
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tỷ lệ đúng giờ
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tỷ lệ đi muộn
              </span>
            </div>
          </div>

          {/* Visual Column Chart */}
          <div className="pt-6 pb-2 flex items-end justify-between gap-3 h-56 border-b border-slate-100 px-4">
            {analytics?.monthlyTrends?.map((trend, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {trend.attendanceRate}%
                </span>
                <div className="w-full max-w-[40px] flex items-end gap-1 h-full">
                  {/* Attendance Bar */}
                  <div 
                    className="w-1/2 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all group-hover:brightness-110"
                    style={{ height: `${trend.attendanceRate}%` }}
                    title={`Đúng giờ: ${trend.attendanceRate}%`}
                  />
                  {/* Late Bar */}
                  <div 
                    className="w-1/2 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all"
                    style={{ height: `${trend.lateRate * 8}%` }}
                    title={`Đi muộn: ${trend.lateRate}%`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1">
                  {trend.month}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center">
            Biểu đồ phản ánh tỷ lệ chuyên cần duy trì trên <strong>95%</strong> trong suốt 2 quý gần nhất.
          </p>
        </div>
      </div>

      {/* Row 3: Top Late Employees & Quota Policy Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Late Check-ins Attention List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                Theo Dõi Đi Muộn Trong Tháng (Cần Nhắc Nhở)
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Quy chế tối đa 60p
            </span>
          </div>

          <div className="space-y-3">
            {analytics?.topLateEmployees?.map((emp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200/60 text-amber-900 font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {emp.fullName} <span className="text-slate-400 font-normal">({emp.employeeCode})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">{emp.department}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-amber-600 text-xs">
                    +{emp.lateMinutes} phút muộn
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {emp.lateCount} lần trong tháng
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quota & Policy Compliance Engine */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Giám Sát Hạn Ngạch Quy Chế (Policy Engine)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Chấp hành tốt
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Tỷ lệ sử dụng Quỹ Phép Năm (Annual Leave)</span>
                <strong className="text-slate-900">32.5%</strong>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '32.5%' }} />
              </div>
              <p className="text-[11px] text-slate-400">
                Toàn công ty đã sử dụng 39/120 ngày phép lũy kế năm 2026.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Tỷ lệ sử dụng Hạn ngạch WFH (Tối đa 4 ngày/tháng)</span>
                <strong className="text-slate-900">48.0%</strong>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '48%' }} />
              </div>
              <p className="text-[11px] text-slate-400">
                Trung bình mỗi nhân sự khối IT sử dụng 1.9/4 ngày WFH được cấp.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

