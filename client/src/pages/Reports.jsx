import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiBarChart2, FiTrendingUp, FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed'];

export default function Reports() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/dashboard/reports?period=${period}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const pieData = data ? [
    { name: 'مكتملة', value: data.completedAppointments },
    { name: 'أخرى', value: Math.max(0, data.totalAppointments - data.completedAppointments) },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">التقارير والإحصائيات</h1>
          <p className="page-subtitle">تحليل شامل لأداء العيادة</p>
        </div>
        <div className="tab-list" style={{ marginBottom: 0, width: 'auto' }}>
          {[['day', 'يوم'], ['week', 'أسبوع'], ['month', 'شهر'], ['year', 'سنة']].map(([v, l]) => (
            <button key={v} className={`tab-btn${period === v ? ' active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : !data ? <p>لا توجد بيانات</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { icon: <FiDollarSign />, label: 'إجمالي الإيرادات', value: `${(data.totalRevenue || 0).toLocaleString()} ج.م`, color: 'green' },
              { icon: <FiCalendar />, label: 'إجمالي المواعيد', value: data.totalAppointments || 0, color: 'blue' },
              { icon: <FiCalendar />, label: 'مواعيد مكتملة', value: data.completedAppointments || 0, color: 'purple' },
              { icon: <FiUsers />, label: 'مرضى جدد', value: data.newPatients || 0, color: 'orange' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <h3 className="section-title"><FiTrendingUp /> الإيرادات اليومية</h3>
              {data.revenueByDay?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.revenueByDay}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Cairo' }} tickFormatter={d => d.split('-').slice(1).join('/')} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'Cairo' }} />
                    <Tooltip formatter={(v) => [`${v.toLocaleString()} ج.م`, 'الإيرادات']} labelStyle={{ fontFamily: 'Cairo' }} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><p>لا توجد بيانات</p></div>}
            </div>

            <div className="card">
              <h3 className="section-title"><FiBarChart2 /> توزيع المواعيد</h3>
              {data.totalAppointments > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><p>لا توجد مواعيد</p></div>}
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="section-title">ملخص الفترة</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'متوسط الإيراد اليومي', value: data.revenueByDay?.length ? `${Math.round(data.totalRevenue / data.revenueByDay.length).toLocaleString()} ج.م` : '0 ج.م' },
                { label: 'نسبة إتمام المواعيد', value: data.totalAppointments ? `${Math.round(data.completedAppointments / data.totalAppointments * 100)}%` : '0%' },
                { label: 'متوسط المرضى الجدد', value: data.newPatients || 0 },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>{item.value}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
