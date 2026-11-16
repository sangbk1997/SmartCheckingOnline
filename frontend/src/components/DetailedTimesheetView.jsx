import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  Download, Filter, AlertCircle, CheckCircle2, Home, 
  HelpCircle, Eye, ShieldAlert, Award, FileText, ArrowRight,
  User, Check, X, Search, Sparkles
} from 'lucide-react';

export default function DetailedTimesheetView({ 
  currentUser, 
  isManagerView = false, 
  allEmployees = [],
  onRequestDispute 
}) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(11); // Tháng 11
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table' | 'yearly'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentUser?.id || '');
  const [calendarData, setCalendarData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');

  // Fetch Monthly Calendar Data
  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const targetEmp = selectedEmployeeId || currentUser?.id || '';
      const url = `/api/v1/timesheets/calendar?year=${selectedYear}&month=${selectedMonth}&employeeId=${targetEmp}`;
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCalendarData(data.data);
      }
    } catch (err) {
      console.error('Fetch calendar error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Yearly Overview Data
  const fetchYearly = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const targetEmp = selectedEmployeeId || currentUser?.id || '';
      const url = `/api/v1/timesheets/yearly-overview?year=${selectedYear}&employeeId=${targetEmp}`;
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setYearlyData(data.data);
      }
    } catch (err) {
      console.error('Fetch yearly error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'yearly') {
      fetchYearly();
    } else {
      fetchCalendar();
    }
  }, [selectedYear, selectedMonth, selectedEmployeeId, viewMode]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Helper: status colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NORMAL':
        return { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', label: 'Đủ công' };
      case 'LATE':
        return { bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30', label: 'Đi muộn' };
      case 'WFH':
        return { bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30', label: 'Làm WFH' };
      case 'LEAVE':
        return { bg: 'bg-sky-500/10 text-sky-600 border-sky-500/30', label: 'Nghỉ phép' };
      case 'SICK':
        return { bg: 'bg-purple-500/10 text-purple-600 border-purple-500/30', label: 'Nghỉ ốm' };
      case 'HOLIDAY':
        return { bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30', label: 'Nghỉ lễ' };
      case 'WEEKEND':
        return { bg: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Cuối tuần' };
      case 'ABSENT':
        return { bg: 'bg-red-500/10 text-red-600 border-red-500/30', label: 'Vắng' };
      default:
        return { bg: 'bg-slate-50 text-slate-400 border-slate-200', label: 'Chưa tới' };
    }
  };

  const filteredEmployees = allEmployees.filter(e => 
    e.fullName?.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchEmployeeQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Viewmode Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Year & Month Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-none hover:shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 font-bold text-slate-800 text-sm whitespace-nowrap">
                Tháng {selectedMonth} / {selectedYear}
              </div>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-none hover:shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Year Picker */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2025}>Năm 2025</option>
              <option value={2026}>Năm 2026 (Hiện tại)</option>
              <option value={2027}>Năm 2027</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch Tháng (30 Ngày)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bảng Chi Tiết Từng Ngày
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'yearly' 
                  ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng Quan 12 Tháng
            </button>
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                window.open(`/api/v1/timesheets/admin/periods/p-2026-11/export-csv`, '_blank');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Xuất Excel (UTF-8 BOM)
            </button>
          </div>
        </div>

        {/* Manager/HR: Select Employee to View */}
        {isManagerView && (
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Xem Bảng Công Của:
              </span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full md:w-80 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {allEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    [{emp.employeeCode}] {emp.fullName} - {emp.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Đang xem bảng công nhân sự: <strong className="text-slate-800">{calendarData?.employeeName || 'Toàn quyền quản lý'}</strong> ({calendarData?.employeeCode})
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards for the Month (When not in Yearly mode) */}
      {viewMode !== 'yearly' && calendarData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Công Chuẩn</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {calendarData.summary.standardWorkDays}
            </div>
            <span className="text-[10px] text-slate-400">ngày làm việc</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <div className="text-xs text-emerald-700 font-semibold">Công Đạt Được</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {calendarData.summary.actualWorkDays}
            </div>
            <span className="text-[10px] text-emerald-600/80 font-medium">
              Tỷ lệ: {calendarData.summary.attendanceRatePercent}%
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
            <div className="text-xs text-indigo-700 font-semibold">Làm WFH</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {calendarData.summary.wfhDays}
            </div>
            <span className="text-[10px] text-indigo-500">ngày từ xa</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-sm">
            <div className="text-xs text-sky-700 font-semibold">Nghỉ Phép Có Lương</div>
            <div className="text-2xl font-bold text-sky-600 mt-1">
              {calendarData.summary.paidLeaveDays}
            </div>
            <span className="text-[10px] text-sky-500">ngày phép năm/ốm</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
            <div className="text-xs text-amber-700 font-semibold">Đi Muộn</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {calendarData.summary.lateMinutesTotal}<span className="text-xs font-normal text-slate-400">p</span>
            </div>
            <span className="text-[10px] text-amber-600 font-medium">
              {calendarData.summary.lateDaysCount} lần đi muộn
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm">
            <div className="text-xs text-rose-700 font-semibold">Vắng Không Phép</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {calendarData.summary.absentDaysCount}
            </div>
            <span className="text-[10px] text-rose-500">ngày chưa chấm</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-violet-200 shadow-sm">
            <div className="text-xs text-violet-700 font-semibold">Tăng Ca (OT)</div>
            <div className="text-2xl font-bold text-violet-600 mt-1">
              {calendarData.summary.otHoursTotal}<span className="text-xs font-normal text-slate-400">h</span>
            </div>
            <span className="text-[10px] text-violet-500">sau 17:30</span>
          </div>
        </div>
      )}

      {/* VIEW 1: 30-DAY MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Thứ 2</span>
            <span>Thứ 3</span>
            <span>Thứ 4</span>
            <span>Thứ 5</span>
            <span>Thứ 6</span>
            <span className="text-rose-500">Thứ 7</span>
            <span className="text-rose-500">Chủ Nhật</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {calendarData?.days?.map((day, idx) => {
              const badge = getStatusBadge(day.status);
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDayDetail(day)}
                  className={`min-h-[110px] p-2.5 bg-white hover:bg-indigo-50/40 transition-colors cursor-pointer flex flex-col justify-between ${
                    day.isWeekend ? 'bg-slate-50/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      day.isWeekend ? 'text-slate-400' : 'text-slate-800'
                    }`}>
                      {day.dayNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Punch times or status note */}
                  <div className="my-1.5 space-y-0.5 text-[11px]">
                    {day.checkInTime && (
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <span className="text-[10px] text-slate-400">Vào:</span>
                        <span className={day.lateMinutes > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700'}>
                          {day.checkInTime}
                        </span>
                      </div>
                    )}
                    {day.checkOutTime && (
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <span className="text-[10px] text-slate-400">Ra:</span>
                        <span className="text-slate-700">{day.checkOutTime}</span>
                      </div>
                    )}
                    {day.holidayName && (
                      <p className="text-[10px] text-rose-600 font-medium truncate" title={day.holidayName}>
                        🎉 {day.holidayName}
                      </p>
                    )}
                  </div>

                  {/* Footer of day cell */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Công: <strong className="text-slate-700">{day.workUnit}</strong></span>
                    {day.hasDispute && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5" title="Đã có khiếu nại">
                        ⚠️ Khiếu nại
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Thứ</th>
                  <th className="py-3 px-4">Ca Làm Việc</th>
                  <th className="py-3 px-4">Giờ Vào (Check-in)</th>
                  <th className="py-3 px-4">Giờ Ra (Check-out)</th>
                  <th className="py-3 px-4">Tổng Giờ</th>
                  <th className="py-3 px-4">Đi Muộn</th>
                  <th className="py-3 px-4">Công Quy Đổi</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calendarData?.days?.map((day, idx) => {
                  const badge = getStatusBadge(day.status);
                  return (
                    <tr 
                      key={idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        day.isWeekend ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {day.date}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${day.isWeekend ? 'text-rose-500' : 'text-slate-600'}`}>
                        {day.dayOfWeek}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {day.shiftName}
                      </td>
                      <td className="py-3 px-4">
                        {day.checkInTime ? (
                          <span className={`font-mono font-semibold ${
                            day.lateMinutes > 0 ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {day.checkInTime}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {day.checkOutTime ? (
                          <span className="font-mono text-slate-700">{day.checkOutTime}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {day.durationHours > 0 ? `${day.durationHours}h` : '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {day.lateMinutes > 0 ? (
                          <span className="text-amber-600">+{day.lateMinutes}p</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {day.workUnit} công
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDayDetail(day)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors"
                          >
                            Chi Tiết
                          </button>
                          {!day.isWeekend && day.status !== 'NORMAL' && (
                            <button
                              onClick={() => {
                                if (onRequestDispute) {
                                  onRequestDispute(day.date);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-[11px] transition-colors"
                            >
                              Khiếu Nại
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

      {/* VIEW 3: 12-MONTH YEARLY OVERVIEW */}
      {viewMode === 'yearly' && (
        <div className="space-y-6">
          {/* Yearly Grand Summary */}
          {yearlyData?.summary && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Báo Cáo Tổng Hợp Năm {selectedYear}
                </span>
                <h3 className="text-2xl font-bold mt-1">
                  {yearlyData.employeeName} ({yearlyData.employeeCode})
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Đánh giá chuyên cần, ngày công thực tế, WFH và ngày phép trong suốt 12 tháng
                </p>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur">
                  <div className="text-xs text-slate-300 font-medium">Tổng Công Đạt</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">
                    {yearlyData.summary.totalActualDays}
                  </div>
                  <div className="text-[10px] text-slate-400">/ {yearlyData.summary.totalStandardDays} công chuẩn</div>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur">
                  <div className="text-xs text-slate-300 font-medium">Tỷ Lệ Chuyên Cần</div>
                  <div className="text-3xl font-extrabold text-indigo-300 mt-0.5">
                    {yearlyData.summary.yearlyAttendanceRatePercent}%
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Xuất sắc</div>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur">
                  <div className="text-xs text-slate-300 font-medium">Tổng Phút Muộn</div>
                  <div className="text-3xl font-extrabold text-amber-400 mt-0.5">
                    {yearlyData.summary.totalLateMinutes}<span className="text-sm font-normal text-slate-300">p</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Cả năm</div>
                </div>
              </div>
            </div>
          )}

          {/* 12 Months Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {yearlyData?.months?.map((m) => (
              <div 
                key={m.month}
                onClick={() => {
                  setSelectedMonth(m.month);
                  setViewMode('calendar');
                }}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                  m.month === selectedMonth 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {m.monthName}
                    </h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.attendanceRatePercent}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Công thực tế:</span>
                      <strong className="text-slate-900">{m.actualWorkDays} / {m.standardWorkDays} công</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Làm WFH:</span>
                      <span className="text-indigo-600 font-semibold">{m.wfhDays} ngày</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Nghỉ phép:</span>
                      <span className="text-sky-600 font-semibold">{m.paidLeaveDays} ngày</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Đi muộn:</span>
                      <span className={m.lateMinutesTotal > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                        {m.lateMinutesTotal} phút
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Xem lịch chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAY DETAIL & TIMELINE MODAL */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                  {selectedDayDetail.dayNumber}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Chi Tiết Ngày {selectedDayDetail.date} ({selectedDayDetail.dayOfWeek})
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedDayDetail.shiftName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Status Badge Banner */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${getStatusBadge(selectedDayDetail.status).bg}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {selectedDayDetail.statusLabel}
                  </span>
                </div>
                <span className="font-extrabold text-sm">
                  {selectedDayDetail.workUnit} Công
                </span>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                  Nhật Ký Chấm Công (Timeline)
                </h5>

                {/* Check In Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Vào Ca (Check-in)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedDayDetail.checkInTime || 'Chưa ghi nhận'}
                    </span>
                  </div>
                  {selectedDayDetail.checkInTime && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <div>Hình thức: <strong className="text-slate-700">{selectedDayDetail.punchMethod}</strong></div>
                      <div>Đi muộn: <strong className={selectedDayDetail.lateMinutes > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                        {selectedDayDetail.lateMinutes > 0 ? `${selectedDayDetail.lateMinutes} phút` : 'Đúng giờ'}
                      </strong></div>
                    </div>
                  )}
                </div>

                {/* Check Out Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Ra Ca (Check-out)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedDayDetail.checkOutTime || 'Chưa ghi nhận'}
                    </span>
                  </div>
                  {selectedDayDetail.checkOutTime && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <div>Tổng giờ làm: <strong className="text-slate-700">{selectedDayDetail.durationHours} giờ</strong></div>
                      <div>Tăng ca: <strong className="text-violet-600">{selectedDayDetail.durationHours > 8.5 ? `${Math.round((selectedDayDetail.durationHours - 8.5)*10)/10}h OT` : '0h'}</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dispute Section */}
              {selectedDayDetail.hasDispute ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Khiếu nại đang xử lý ({selectedDayDetail.disputeStatus})
                  </div>
                  <p className="text-slate-600">Lý do: {selectedDayDetail.disputeReason}</p>
                </div>
              ) : (
                !selectedDayDetail.isWeekend && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedDayDetail(null);
                        if (onRequestDispute) {
                          onRequestDispute(selectedDayDetail.date);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Gửi Khiếu Nại Bù Công Ngày Này
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
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

