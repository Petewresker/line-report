'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, Clock, MapPin, ExternalLink, AlertCircle, AlertTriangle, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

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
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')
  const [cases, setCases] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cases?admin=true`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        setCases(items)
        if (items.length > 0) setSelected(items[0])
      })
      .catch(console.error)
  }, [])

  const stats = [
    { label: 'Total',       value: cases.length,                                           labelColor: '#111' },
    { label: 'Pending',     value: cases.filter(c => c.status === 'PENDING').length,       labelColor: '#F59E0B' },
    { label: 'In progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length,   labelColor: '#3B82F6' },
    { label: 'Success',     value: cases.filter(c => c.status === 'FINISHED').length,      labelColor: '#10B981' },
  ]

  const filtered = cases.filter((c) => {
    const statusFilter = FILTER_TO_STATUS[activeFilter]
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchSearch = c.title?.includes(searchQuery) || c.caseId?.includes(searchQuery)
    return matchStatus && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName="Johny Eve" />
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
            .left-scroll::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 8px; }
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
              {filtered.map((item) => {
                const s = STATUS_MAP[item.status] ?? { bg: '#f0f0f0', text: '#555', label: item.status }
                const isSelected = selected?.caseId === item.caseId
                return (
                  <div key={item.caseId} onClick={() => setSelected(item)}
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
                        {(() => {
                          const count = cases.filter(c =>
                            c.title === item.title &&
                            haversine(item.lat, item.lon, c.lat, c.lon) <= RADIUS_M
                          ).length
                          const { Icon, color, bg, label } = getReportIndicator(count)
                          return (
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: bg, color, fontWeight: '600', fontSize: '0.72rem' }}>
                              <Icon size={12} />
                              {label} คน
                            </span>
                          )
                        })()}
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
                  <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1.25rem' }}>{selected.caseId}</p>

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
                  <button style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
                    background: '#10B981', color: '#fff', fontSize: '0.95rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                  >
                    ส่งข้อมูล
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
    </div>
  )
}
