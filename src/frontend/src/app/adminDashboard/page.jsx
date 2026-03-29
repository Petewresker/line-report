'use client'

import { useState, useEffect, useMemo } from 'react'
import liff from '@line/liff'
import { Search, Calendar, Clock, MapPin, ExternalLink, AlertCircle, AlertTriangle, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const API = process.env.NEXT_PUBLIC_API_URL

const filterTabs = ['ทั้งหมด', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น']

const FILTER_TO_STATUS = {
  'รอดำเนินการ': 'PENDING',
  'กำลังดำเนินการ': 'IN_PROGRESS',
  'เสร็จสิ้น': 'FINISHED',
}

const RADIUS_M = 500

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const formatTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}


const getReportIndicator = (count) => {
  if (count > 10) return { Icon: AlertCircle,  color: '#EF4444', bg: '#FEE2E2', label: count }
  if (count >= 5)  return { Icon: AlertTriangle, color: '#F59E0B', bg: '#FEF3C7', label: count }
  return            { Icon: Eye,           color: '#3B82F6', bg: '#DBEAFE', label: count }
}

const STATUS_MAP = {
  PENDING:     { bg: '#FEF3C7', text: '#92400E', label: 'รอดำเนินการ' },
  FORWARD:     { bg: '#EDE9FE', text: '#6D28D9', label: 'กำลังส่งมอบ' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF', label: 'กำลังดำเนินการ' },
  FINISHED:    { bg: '#D1FAE5', text: '#065F46', label: 'เสร็จสิ้น' },
}

export default function AdminDashboard() {
  const [auth, setAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const [activeFilter, setActiveFilter] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')
  const [cases, setCases] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [loadingAgencies, setLoadingAgencies] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupCursors, setGroupCursors] = useState({})

  // ── LIFF Init + Admin Check ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_PROBLEM_SEEKER })
        if (!liff.isLoggedIn()) { liff.login(); return }

        const profile = await liff.getProfile()

        const res = await fetch(`${API}/admin/me`, {
          headers: { userid: profile.userId },
        })
        if (!res.ok) {
          setAuthError('คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้')
          setAuthLoading(false)
          return
        }

        const { admin } = await res.json()
        setAuth({ userId: profile.userId, name: admin.Name })
      } catch (err) {
        setAuthError(err?.message ?? 'LIFF initialization failed')
      } finally {
        setAuthLoading(false)
      }
    }
    init()
  }, [])

  // ── Fetch Cases (หลัง auth) ────────────────────────────────────────────────
  useEffect(() => {
    if (!auth) return
    fetch(`${API}/cases?admin=true`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        setCases(items)
        if (items.length > 0) setSelected(items[0])
      })
      .catch(console.error)
  }, [auth])

  // หา caseIds ทั้งหมดที่เป็น duplicate ของ case ที่เลือก (title เดียวกัน + อยู่ใน radius)
  const getRelatedCaseIds = (item) =>
    cases
      .filter(c => c.title === item.title && haversine(item.lat, item.lon, c.lat, c.lon) <= RADIUS_M)
      .map(c => c.caseId)

  const openModal = () => {
    setSelectedAgency(null)
    setShowModal(true)
    setLoadingAgencies(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies`)
      .then(r => r.json())
      .then(data => {
        const active = Array.isArray(data.agencies) ? data.agencies.filter(a => a.Status === 'ACTIVE') : []
        // group by AgencyName
        const groupMap = {}
        for (const a of active) {
          const name = a.AgencyName || 'ไม่ระบุ'
          if (!groupMap[name]) groupMap[name] = []
          groupMap[name].push(a)
        }
        setAgencies(Object.entries(groupMap).map(([name, members]) => ({ name, members })))
      })
      .catch(console.error)
      .finally(() => setLoadingAgencies(false))
  }

  const handleSubmit = async () => {
    if (!selectedAgency || !selected) return
    setSubmitting(true)
    try {
      const caseIds = getRelatedCaseIds(selected)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/cases/${selected.caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName: selectedAgency.name, caseIds }),
      })
      setCases(prev => prev.map(c => caseIds.includes(c.caseId) ? { ...c, status: 'FORWARD' } : c))
      setSelected(prev => prev ? { ...prev, status: 'FORWARD' } : prev)
      setShowModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const stats = [
    { label: 'Total',       value: cases.length,                                           labelColor: '#111' },
    { label: 'Pending',     value: cases.filter(c => c.status === 'PENDING').length,       labelColor: '#F59E0B' },
    { label: 'In progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length,   labelColor: '#3B82F6' },
    { label: 'Success',     value: cases.filter(c => c.status === 'FINISHED').length,      labelColor: '#10B981' },
  ]

  const filtered = useMemo(() => cases.filter((c) => {
    const statusFilter = FILTER_TO_STATUS[activeFilter]
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchSearch = c.title?.includes(searchQuery) || c.caseId?.includes(searchQuery)
    return matchStatus && matchSearch
  }), [cases, activeFilter, searchQuery])

  const groups = useMemo(() => {
    const assigned = new Set()
    const result = []
    for (const item of filtered) {
      if (assigned.has(item.caseId)) continue
      const group = filtered.filter(c =>
        c.title === item.title && haversine(item.lat, item.lon, c.lat, c.lon) <= RADIUS_M
      )
      group.forEach(c => assigned.add(c.caseId))
      result.push(group)
    }
    return result
  }, [filtered])

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
    <div style={{ minHeight: '100vh', background: '#FFE2C2', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName={auth?.name ?? 'Admin'} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{
                background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1rem', color: stat.labelColor, fontWeight: '500' }}>{stat.label}</span>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: '#111', display: 'block', textAlign: 'right' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '0.6rem 1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingRight: '0.75rem', borderRight: '1px solid #e5e5e5', color: '#555', fontSize: '0.875rem', fontWeight: '500' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </div>
            {filterTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveFilter(tab)} style={{
                padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: activeFilter === tab ? '600' : '400',
                background: activeFilter === tab ? '#f0f0f0' : 'transparent',
                color: activeFilter === tab ? '#111' : '#666', transition: 'all 0.15s',
              }}>
                {tab}
              </button>
            ))}
            <div style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', border: '1px solid #e5e5e5', borderRadius: '8px', minWidth: '340px',
            }}>
              <Search size={15} color="#aaa" />
              <input type="text" placeholder="ค้นหา..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: '100%', color: '#333' }}
              />
            </div>
          </div>

          <style>{`
            .left-scroll::-webkit-scrollbar { width: 6px; }
            .left-scroll::-webkit-scrollbar-track { background: #FFE2C2; border-radius: 8px; }
            .left-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 8px; }
            .left-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}</style>

          {/* Two-panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0, alignItems: 'start' }}>

            {/* Left — List */}
            <div className="left-scroll" style={{
              background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              overflowY: 'auto', display: 'flex', flexDirection: 'column', maxHeight: '72vh',
            }}>
              {groups.map((group) => {
                const groupKey = group[0].caseId
                const cursor = Math.min(groupCursors[groupKey] ?? 0, group.length - 1)
                const item = group[cursor]
                const s = STATUS_MAP[item.status] ?? { bg: '#f0f0f0', text: '#555', label: item.status }
                const isSelected = group.some(c => c.caseId === selected?.caseId)
                const count = cases.filter(c =>
                  c.title === item.title && haversine(item.lat, item.lon, c.lat, c.lon) <= RADIUS_M
                ).length
                const { Icon, color, bg, label } = getReportIndicator(count)
                return (
                  <div key={groupKey} onClick={() => setSelected(item)}
                    style={{
                      display: 'flex', gap: '0.85rem', padding: '1rem 1.25rem', cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s',
                      background: isSelected ? '#F0F9FF' : '#fff',
                      borderLeft: isSelected ? '3px solid #3B82F6' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '90px', height: '65px', borderRadius: '8px', flexShrink: 0,
                      background: '#f0f0f0', overflow: 'hidden',
                    }}>
                      <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.1rem' }}>
                            {item.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#999' }}>{item.caseId}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '20px', background: s.bg, color: s.text, whiteSpace: 'nowrap', marginLeft: '0.5rem', flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#777', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '0.4rem' }}>
                        {item.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.72rem', color: '#aaa' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={11} /> {formatDate(item.createdAt)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={11} /> {formatTime(item.createdAt)}
                        </span>
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: bg, color, fontWeight: '600', fontSize: '0.72rem' }}>
                          <Icon size={12} />
                          {label} คน
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right — Detail */}
            <div style={{
              background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              padding: '1.5rem', alignSelf: 'start',
            }}>
              {selected ? (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', flex: 1 }}>{selected.title}</h2>
                    {(() => {
                      const ss = STATUS_MAP[selected.status] ?? { bg: '#f0f0f0', text: '#555', label: selected.status }
                      return (
                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '20px', background: ss.bg, color: ss.text, whiteSpace: 'nowrap', marginLeft: '0.75rem', flexShrink: 0 }}>
                          {ss.label}
                        </span>
                      )
                    })()}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.75rem' }}>{selected.caseId}</p>

                  {/* Group navigation */}
                  {(() => {
                    const grp = groups.find(g => g.some(c => c.caseId === selected.caseId))
                    if (!grp || grp.length <= 1) return null
                    const grpKey = grp[0].caseId
                    const idx = grp.findIndex(c => c.caseId === selected.caseId)
                    const go = (dir) => {
                      const next = (idx + dir + grp.length) % grp.length
                      setGroupCursors(prev => ({ ...prev, [grpKey]: next }))
                      setSelected(grp[next])
                    }
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <button onClick={() => go(-1)} style={{
                          width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db',
                          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#555', fontSize: '1rem', padding: 0, flexShrink: 0,
                        }}>‹</button>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{idx + 1} / {grp.length} เคส</span>
                        <button onClick={() => go(1)} style={{
                          width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db',
                          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#555', fontSize: '1rem', padding: 0, flexShrink: 0,
                        }}>›</button>
                      </div>
                    )
                  })()}

                  {/* Images */}
                  {selected.imageUrl && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', background: '#f0f0f0' }}>
                        <img src={selected.imageUrl} alt="case" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none' }} />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem' }}>อธิบาย</h3>
                    <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.7' }}>{selected.description}</p>
                  </div>

                  {/* Location */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem' }}>ตำแหน่ง</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#555' }}>
                      <MapPin size={14} />
                      <span>{selected.lat}, {selected.lon}</span>
                      <a
                        href={`https://www.google.com/maps?q=${selected.lat},${selected.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '0.25rem', color: '#3B82F6' }}
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem' }}>ข้อมูลรายงาน</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#555' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} /> วันที่ {formatDate(selected.createdAt)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} /> {formatTime(selected.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button onClick={openModal} style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
                    background: '#10B981', color: '#fff', fontSize: '0.95rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                  >
                    ส่งข้อมูล ({selected ? getRelatedCaseIds(selected).length : 0} เคส)
                  </button>
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.9rem' }}>
                  เลือกรายการเพื่อดูรายละเอียด
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '1.75rem',
            width: '480px', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '0.25rem' }}>เลือกหน่วยงาน</h2>
            <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1.25rem' }}>
              ส่ง <b style={{ color: '#111' }}>{selected ? getRelatedCaseIds(selected).length : 0} เคส</b> ที่เกี่ยวข้องกับ "{selected?.title}"
            </p>

            {loadingAgencies ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa', fontSize: '0.875rem' }}>กำลังโหลด...</div>
            ) : agencies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa', fontSize: '0.875rem' }}>ไม่มีหน่วยงานที่พร้อมรับงาน</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto', marginBottom: '1.25rem' }}>
                {agencies.map((group) => {
                  const isChosen = selectedAgency?.name === group.name
                  return (
                    <div key={group.name} onClick={() => setSelectedAgency(group)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer',
                      border: `2px solid ${isChosen ? '#3B82F6' : '#e5e5e5'}`,
                      background: isChosen ? '#EFF6FF' : '#fff', transition: 'all 0.15s',
                    }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        🏢
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111', marginBottom: '0.1rem' }}>{group.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#999' }}>{group.members.length} คน</p>
                      </div>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isChosen ? '#3B82F6' : '#d1d5db'}`,
                        background: isChosen ? '#3B82F6' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isChosen && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '0.65rem', borderRadius: '10px',
                border: '1px solid #e5e5e5', background: '#fff',
                fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', color: '#555',
              }}>ยกเลิก</button>
              <button onClick={handleSubmit} disabled={!selectedAgency || submitting} style={{
                flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none',
                background: selectedAgency && !submitting ? '#10B981' : '#d1d5db',
                color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                cursor: selectedAgency && !submitting ? 'pointer' : 'not-allowed',
              }}>
                {submitting ? 'กำลังส่ง...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
