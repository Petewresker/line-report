'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MoreVertical, Search, TrendingUp, MapPin, RefreshCw, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const HeatMap = dynamic(() => import('../../components/HeatMap'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8edf2', color: '#94a3b8', fontSize: '0.9rem' }}>
    กำลังโหลดแผนที่...
  </div>
) })

const monthlyData = [
  { month: 'ม.ค.', cases: 8200 },
  { month: 'ก.พ.', cases: 9400 },
  { month: 'มี.ค.', cases: 7800 },
  { month: 'เม.ย.', cases: 11200 },
  { month: 'พ.ค.', cases: 13500 },
  { month: 'มิ.ย.', cases: 10800 },
]

const duplicateCases = [
  { id: '#FIRE-A-201', title: 'เสาไฟฟ้าชำรุด', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 16 },
  { id: '#FIRE-A-202', title: 'ฝุ่นปากเสีย ปูนแตก', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-203', title: 'ฝุ่นปากเสีย ปูนแตก', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-204', title: 'ฝุ่นปากเสีย ปูนแตก', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-205', title: 'ไฟฟ้าดับ', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-206', title: 'ไฟฟ้าดับ', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-207', title: 'ไฟฟ้าดับ', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 8 },
  { id: '#FIRE-A-208', title: 'ท่อน้ำแตก', location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', count: 2 },
]

const getCountBadge = (count) => {
  if (count >= 16) return { bg: '#FCE7F3', text: '#BE185D' }
  if (count >= 8)  return { bg: '#EDE9FE', text: '#7C3AED' }
  return               { bg: '#D1FAE5', text: '#065F46' }
}

const exportCSV = (data) => {
  const headers = ['ID', 'Title', 'Location', 'Count']
  const rows = data.map(c => [c.id, c.title, c.location, c.count])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'duplicate_cases.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const topIssues = [
  { title: 'ความสะอาด', count: 3450, color: '#EF4444' },
  { title: 'ทางเท้า', count: 2840, color: '#8B5CF6' },
  { title: 'ถนน', count: 2100, color: '#3B82F6' },
  { title: 'แสงสว่าง', count: 1250, color: '#A855F7' },
  { title: 'ความปลอดภัย', count: 400, color: '#9CA3AF' },
]

const total = topIssues.reduce((sum, i) => sum + i.count, 0)

export default function AnalysisPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName="Johny Eve" />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Left — Top 5 */}
          <div style={{
            width: '280px',
            height: '480px',
            flexShrink: 0,
            background: '#fff',
            borderRadius: '14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>
                Top 5 Reported Issues
              </h2>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px' }}
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '1.5rem', background: '#fff',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    padding: '0.4rem 0', zIndex: 10, minWidth: '130px',
                  }}>
                    {['ดูทั้งหมด', 'Export CSV', 'รีเฟรช'].map((opt) => (
                      <button key={opt} onClick={() => setMenuOpen(false)} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.45rem 1rem', background: 'none', border: 'none',
                        fontSize: '0.82rem', color: '#333', cursor: 'pointer',
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Issue list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topIssues.map((issue) => {
                const pct = Math.round((issue.count / total) * 100)
                return (
                  <div key={issue.title}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#333' }}>{issue.title}</span>
                      <span style={{ fontSize: '0.78rem', color: issue.color, fontWeight: '600' }}>
                        {issue.count.toLocaleString()} รายการ ({pct}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '6px', borderRadius: '99px', background: '#f0f0f0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: issue.color,
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom image */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/analysis_capi.png" alt="capibara" style={{ width: '70%', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Right — Heatmap placeholder */}
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: '14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '480px',
          }}>
            {/* Search bar */}
            <div style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                border: '1px solid #e5e5e5', borderRadius: '8px', padding: '0.45rem 0.85rem',
              }}>
                <Search size={15} color="#aaa" />
                <input
                  type="text"
                  placeholder="บริเวณที่ต้องการตรวจสอบ (เช่น มหาวิทยาลัย, ซอย, ถนน ...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%', color: '#333' }}
                />
              </div>
              <button style={{
                padding: '0.45rem 1.25rem', borderRadius: '8px', border: '1.5px solid #3B82F6',
                background: '#fff', color: '#3B82F6', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#3B82F6' }}
              >
                ค้นหา
              </button>
            </div>

            {/* Heatmap */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <HeatMap />
            </div>
          </div>
          </div>

          {/* Monthly Report */}
          <div style={{
            background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex', overflow: 'hidden', width: '100%',
          }}>
            {/* Chart */}
            <div style={{ flex: 1, padding: '1.5rem 1.5rem 1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111', marginBottom: '0.15rem' }}>Monthly Report</h2>
              <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '1.25rem' }}>สรุปภาพรวมรายเดือน</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [v.toLocaleString(), 'รายการ']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: '0.8rem' }}
                  />
                  <Line type="monotone" dataKey="cases" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 4, fill: '#EC4899', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div style={{
              width: '180px', flexShrink: 0, borderLeft: '1px solid #f0f0f0',
              padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#aaa', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>TOTAL CASE</p>
                <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111', lineHeight: 1 }}>123,456</p>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#aaa', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>RESOLVED</p>
                <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3B82F6', lineHeight: 1 }}>15%</p>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: '600', color: '#10B981' }}>
                  <TrendingUp size={14} /> โตขึ้น 5%
                </p>
              </div>
            </div>
          </div>

          {/* Duplicate Case Analysis */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '0.15rem' }}>Duplicate Case Analysis</h2>
                <p style={{ fontSize: '0.78rem', color: '#aaa' }}>วิเคราะห์เคสซ้ำ</p>
              </div>
              <button
                onClick={() => exportCSV(duplicateCases)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem', borderRadius: '8px', border: '1.5px solid #e5e5e5',
                  background: '#fff', color: '#555', fontSize: '0.82rem', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#3B82F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#555' }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {duplicateCases.map((c) => {
                const badge = getCountBadge(c.count)
                return (
                  <div key={c.id} style={{
                    border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    transition: 'box-shadow 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#aaa' }}>ID: {c.id}</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.55rem',
                        borderRadius: '20px', background: badge.bg, color: badge.text,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        <RefreshCw size={10} /> {c.count} Times
                      </span>
                    </div>

                    {/* Title */}
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111', lineHeight: '1.3' }}>{c.title}</p>

                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', fontSize: '0.75rem', color: '#888' }}>
                      <MapPin size={12} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>{c.location}</span>
                    </div>

                    {/* View History */}
                    <button
                      style={{
                        marginTop: '0.25rem', background: 'none', border: 'none', padding: 0,
                        color: '#3B82F6', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}
                    >
                      View History →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
