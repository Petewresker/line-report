'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MoreVertical, Search, TrendingUp, MapPin, RefreshCw, Download, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import liff from '@line/liff'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { authenticate, verify } from '../../utils/authenkit'

const HeatMap = dynamic(() => import('../../components/HeatMap'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8edf2', color: '#94a3b8', fontSize: '0.9rem' }}>
    กำลังโหลดแผนที่...
  </div>
) })

const ISSUE_COLORS = ['#EF4444', '#8B5CF6', '#3B82F6', '#F59E0B', '#10B981']

const thaiMonth = (yearMonth) => {
  const names = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const m = parseInt(yearMonth.split('-')[1], 10)
  return names[m - 1] || yearMonth
}

const getCountBadge = (count) => {
  if (count >= 10) return { bg: '#FCE7F3', text: '#BE185D' }
  if (count >= 5)  return { bg: '#EDE9FE', text: '#7C3AED' }
  return               { bg: '#D1FAE5', text: '#065F46' }
}

const exportCSV = (data) => {
  const headers = ['Title', 'Location', 'Count']
  const rows = data.map((c) => [c.title, `${c.lat?.toFixed(4)}, ${c.lon?.toFixed(4)}`, c.count])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'duplicate_cases.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AnalysisPage() {
  const [auth, setAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [showUnauthorized, setShowUnauthorized] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCenter, setSearchCenter] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [topIssues, setTopIssues]     = useState([])
  const [hotspots, setHotspots]       = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [duplicates, setDuplicates]   = useState([])
  const [totalCases, setTotalCases]   = useState(0)

  // ── LIFF Init + Admin Check ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'

        if (isLocalhost && devUserId) {
          setAuth({ userId: devUserId, name: 'Dev User' })
          return
        }

        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_PROBLEM_SEEKER })
        if (!liff.isLoggedIn()) { liff.login(); return }

        if (!localStorage.getItem('TU_Smart_Service JWT Token')) {
          await authenticate({ idToken: liff.getIDToken() })
        }

        const verifyData = await verify('admin')
        if (verifyData?.user?.role === 'admin') {
          setAuth({ userId: verifyData.user.userId, name: verifyData.user.name })
        } else {
          setShowUnauthorized(true)
        }
      } catch (err) {
        setAuthError(err?.message ?? 'LIFF initialization failed')
      } finally {
        setAuthLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!auth) return
    const api = process.env.NEXT_PUBLIC_API_URL

    // Top 5 + Duplicate — ใช้ /cases ชุดเดียว
    fetch(`${api}/cases`, { headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${localStorage.getItem("TU_Smart_Service JWT Token")}` } })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        setTotalCases(items.length)

        const titleMap = {}
        items.forEach((item) => {
          if (!item.title) return
          if (!titleMap[item.title]) titleMap[item.title] = { title: item.title, count: 0 }
          titleMap[item.title].count++
        })
        const grouped = Object.values(titleMap).sort((a, b) => b.count - a.count)
        setTopIssues(grouped.slice(0, 5).map((item, idx) => ({ ...item, color: ISSUE_COLORS[idx] })))
        setDuplicates(grouped.filter((i) => i.count > 1).slice(0, 8))
      })
      .catch(console.error)

    // Heatmap
    fetch(`${api}/cases/hotspots`, { headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${localStorage.getItem("TU_Smart_Service JWT Token")}` } })
      .then((r) => r.json())
      .then((data) => setHotspots((Array.isArray(data) ? data : []).filter((p) => p.lat != null && p.lon != null)))
      .catch(console.error)

    // Monthly
    fetch(`${api}/cases/monthly`, { headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${localStorage.getItem("TU_Smart_Service JWT Token")}` } })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        setMonthlyData(items.map((d) => ({ month: thaiMonth(d.month), cases: d.count })))
      })
      .catch(console.error)
  }, [auth])

  const handleSearch = async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearchLoading(true)
    setSearchError('')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'th,en' },
      })
      const data = await res.json()
      if (!data.length) { setSearchError('ไม่พบสถานที่'); return }
      setSearchCenter({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) })
    } catch {
      setSearchError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSearchLoading(false)
    }
  }

  const issueTotal = topIssues.reduce((s, i) => s + i.count, 0)

  if (showUnauthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFE2C2' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem 2rem', width: '340px', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={32} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111', margin: 0 }}>ไม่มีสิทธิ์เข้าถึง</h2>
          <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.6', margin: 0 }}>คุณไม่มีสิทธิ์เข้าใช้งานหน้านี้<br />กรุณาติดต่อผู้ดูแลระบบ</p>
          <button onClick={() => window.history.back()} style={{ marginTop: '0.5rem', padding: '0.65rem 2rem', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>ย้อนกลับ</button>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFE2C2' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFE2C2', padding: '2rem' }}>
        <p style={{ color: '#EF4444', fontSize: '0.9rem', textAlign: 'center' }}>{authError}</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName={auth?.name ?? 'Admin'} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Left — Top 5 */}
            <div style={{
              width: '280px', height: '480px', flexShrink: 0, background: '#fff',
              borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              padding: '1.25rem', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>Top 5 Reported Issues</h2>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px' }}>
                    <MoreVertical size={18} />
                  </button>
                  {menuOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: '0.4rem 0', zIndex: 10, minWidth: '130px' }}>
                      {['ดูทั้งหมด', 'Export CSV', 'รีเฟรช'].map((opt) => (
                        <button key={opt} onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.45rem 1rem', background: 'none', border: 'none', fontSize: '0.82rem', color: '#333', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >{opt}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topIssues.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#bbb' }}>กำลังโหลด...</p>
                ) : topIssues.map((issue, idx) => {
                  const pct = issueTotal > 0 ? Math.round((issue.count / issueTotal) * 100) : 0
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#333' }}>{issue.title}</span>
                        <span style={{ fontSize: '0.78rem', color: issue.color, fontWeight: '600' }}>
                          {(issue.count ?? 0).toLocaleString()} รายการ ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '99px', background: '#f0f0f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: issue.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/analysis_capi.png" alt="capibara" style={{ width: '70%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Right — Heatmap */}
            <div style={{ flex: 1, background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '480px' }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${searchError ? '#FCA5A5' : '#e5e5e5'}`, borderRadius: '8px', padding: '0.45rem 0.85rem' }}>
                    <Search size={15} color="#aaa" />
                    <input
                      type="text"
                      placeholder="บริเวณที่ต้องการตรวจสอบ (เช่น มหาวิทยาลัย, ซอย, ถนน ...)"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%', color: '#333' }}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    style={{ padding: '0.45rem 1.25rem', borderRadius: '8px', border: '1.5px solid #3B82F6', background: '#fff', color: '#3B82F6', fontSize: '0.85rem', fontWeight: '600', cursor: searchLoading ? 'not-allowed' : 'pointer', opacity: searchLoading ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => { if (!searchLoading) { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#fff' } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#3B82F6' }}
                  >{searchLoading ? 'กำลังค้นหา...' : 'ค้นหา'}</button>
                </div>
                {searchError && <p style={{ fontSize: '0.78rem', color: '#EF4444', margin: 0, paddingLeft: '0.25rem' }}>{searchError}</p>}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <HeatMap points={hotspots} flyTo={searchCenter} />
              </div>
            </div>
          </div>

          {/* Monthly Report */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden', width: '100%' }}>
            <div style={{ flex: 1, padding: '1.5rem 1.5rem 1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111', marginBottom: '0.15rem' }}>Monthly Report</h2>
              <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '1.25rem' }}>สรุปภาพรวมรายเดือน</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [v.toLocaleString(), 'รายการ']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: '0.8rem' }} />
                  <Line type="monotone" dataKey="cases" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 4, fill: '#EC4899', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '180px', flexShrink: 0, borderLeft: '1px solid #f0f0f0', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#aaa', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>TOTAL CASE</p>
                <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111', lineHeight: 1 }}>{totalCases.toLocaleString()}</p>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#aaa', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>MONTHLY TREND</p>
                <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3B82F6', lineHeight: 1 }}>{monthlyData.length} เดือน</p>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: '600', color: '#10B981' }}>
                  <TrendingUp size={14} /> Live Data
                </p>
              </div>
            </div>
          </div>

          {/* Duplicate Case Analysis */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '0.15rem' }}>Duplicate Case Analysis</h2>
                <p style={{ fontSize: '0.78rem', color: '#aaa' }}>วิเคราะห์เคสซ้ำ</p>
              </div>
              <button onClick={() => exportCSV(duplicates)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '8px', border: '1.5px solid #e5e5e5', background: '#fff', color: '#555', fontSize: '0.82rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#3B82F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#555' }}
              ><Download size={14} /> Export CSV</button>
            </div>

            {duplicates.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#bbb', textAlign: 'center', padding: '2rem' }}>
                {totalCases === 0 ? 'กำลังโหลด...' : 'ไม่มีเคสซ้ำ'}
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {duplicates.map((c, idx) => {
                  const badge = getCountBadge(c.count)
                  return (
                    <div key={idx} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'box-shadow 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{c.count} เคส</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '20px', background: badge.bg, color: badge.text, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <RefreshCw size={10} /> {c.count} Times
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111', lineHeight: '1.3' }}>{c.title}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
