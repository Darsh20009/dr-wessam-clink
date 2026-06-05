import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiAlertCircle, FiUserPlus, FiClock } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/dashboard/stats'),
      axios.get('/dashboard/reports?period=month'),
    ]).then(([statsRes, reportRes]) => {
      setStats(statsRes.data);
      setReportData(reportRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const statCards = [
    { label: 'إجمالي المرضى', value: stats?.totalPatients || 0, icon: <FiUsers />, color: 'blue' },
    { label: 'مرضى هذا الشهر', value: stats?.newThisMonth || 0, icon: <FiUserPlus />, color: 'green' },
    { label: 'مواعيد اليوم', value: stats?.todayAppointments || 0, icon: <FiCalendar />, color: 'orange' },
    { label: 'إيرادات الشهر', value: `${(stats?.monthlyRevenue || 0).toLocaleString()} ج.م`, icon: <FiDollarSign />, color: 'purple' },
    { label: 'المبالغ المستحقة', value: `${(stats?.totalOutstanding || 0).toLocaleString()} ج.م`, icon: <FiAlertCircle />, color: 'red' },
  ];

  const chartData = reportData?.revenueByDay?.slice(-14) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor/patients/new')}>
          <FiUserPlus /> مريض جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="section-title"><FiTrendingUp /> الإيرادات (آخر 14 يوم)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Cairo' }} tickFormatter={d => d.split('-').slice(1).join('/')} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
                <Tooltip formatter={(v) => [`${v.toLocaleString()} ج.م`, 'الإيرادات']} labelStyle={{ fontFamily: 'Cairo' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>لا توجد بيانات</p></div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="card">
          <h3 className="section-title"><FiClock /> المواعيد القادمة</h3>
          {stats?.upcomingAppointments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.upcomingAppointments.map((apt, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', background: '#f8fafc', borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '8px', color: '#2563eb' }}>
                    <FiCalendar />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{apt.patientId?.fullName || apt.patientName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {format(new Date(apt.date), 'EEEE d/M - h:mm a', { locale: ar })}
                    </div>
                  </div>
                  <span className="badge badge-info">{apt.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>لا توجد مواعيد قادمة</p></div>
          )}
          <button className="btn btn-secondary" style={{ marginTop: '16px', width: '100%' }} onClick={() => navigate('/doctor/appointments')}>
            عرض كل المواعيد
          </button>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="card">
        <h3 className="section-title"><FiTrendingUp /> ملخص الشهر</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {[
            { label: 'إجمالي الإيرادات', value: `${(reportData?.totalRevenue || 0).toLocaleString()} ج.م`, color: '#10b981' },
            { label: 'إجمالي المواعيد', value: reportData?.totalAppointments || 0, color: '#2563eb' },
            { label: 'مواعيد مكتملة', value: reportData?.completedAppointments || 0, color: '#7c3aed' },
            { label: 'مرضى جدد', value: reportData?.newPatients || 0, color: '#f59e0b' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
