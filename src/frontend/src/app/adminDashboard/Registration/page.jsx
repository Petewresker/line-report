'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function RegistrationPage() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAgencies()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const fetchAgencies = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies`)
      const data = await res.json()
      const pending = (data.agencies || []).filter((a) => a.Status === 'PENDING_REVIEW')
      setItems(pending)
      if (pending.length > 0) setSelected(pending[0])
    } catch (err) {
      console.error('Failed to fetch agencies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (agencyId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies/${agencyId}/approve`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setItems((prev) => prev.map((item) => item.AgencyID === agencyId ? { ...item, Status: 'ACTIVE' } : item))
      if (selected?.AgencyID === agencyId) setSelected((prev) => ({ ...prev, Status: 'ACTIVE' }))
    } catch (err) {
      console.error('Approve failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (agencyId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies/${agencyId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const remaining = items.filter((item) => item.AgencyID !== agencyId)
      setItems(remaining)
      setSelected(remaining.length > 0 ? remaining[0] : null)
    } catch (err) {
      console.error('Reject failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const statusLabel = { ACTIVE: 'อนุมัติแล้ว' }
  const statusColor = { ACTIVE: '#10B981' }
  const statusBg   = { ACTIVE: '#D1FAE5' }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName="Johny Eve" />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111' }}>
            Approving agency for LINE LIFF application
          </h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#aaa' }}>
              กำลังโหลด...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>

              {/* Left — List */}
              <div style={{
                background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                overflow: 'auto', display: 'flex', flexDirection: 'column',
              }}>
                {items.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#bbb', fontSize: '0.9rem', padding: '2rem' }}>
                    ไม่มีคำขอที่รอการอนุมัติ
                  </div>
                ) : items.map((item) => {
                  const isSelected = selected?.AgencyID === item.AgencyID
                  return (
                    <div
                      key={item.AgencyID}
                      onClick={() => setSelected(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem', cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s',
                        background: isSelected ? '#F0F9FF' : '#fff',
                        borderLeft: isSelected ? '3px solid #3B82F6' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                    >
                      <img
                        src={item.ImageUrl || '/card.png'}
                        alt="id-card"
                        style={{ width: '110px', height: '75px', objectFit: 'cover', flexShrink: 0, borderRadius: '6px', border: '1px solid #e5e5e5' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '0.3rem' }}>
                          {item.Name} {item.Surname}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>{item.AgencyName}</p>
                      </div>
                      {item.Status !== 'PENDING_REVIEW' && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                          borderRadius: '20px', background: statusBg[item.Status], color: statusColor[item.Status],
                          flexShrink: 0,
                        }}>
                          {statusLabel[item.Status]}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Right — Detail */}
              <div style={{
                background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                overflow: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
              }}>
                {selected ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={selected.ImageUrl || '/card.png'}
                        alt="id-card"
                        onClick={() => setLightbox(true)}
                        style={{ width: '280px', objectFit: 'contain', border: '1.5px solid #e5e5e5', borderRadius: '16px', padding: '0.75rem', cursor: 'zoom-in' }}
                      />
                    </div>

                    <div>
                      <p style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>ข้อมูลส่วนบุคคล</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '1rem', color: '#444' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>ชื่อ</span>
                          <span style={{ fontWeight: '500' }}>{selected.Name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>นามสกุล</span>
                          <span style={{ fontWeight: '500' }}>{selected.Surname}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>เบอร์โทรศัพท์</span>
                          <span style={{ fontWeight: '500' }}>{selected.PhoneNumber}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>หน่วยงาน</span>
                          <span style={{ fontWeight: '500' }}>{selected.AgencyName}</span>
                        </div>
                        {selected.Email && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>อีเมล</span>
                            <span style={{ fontWeight: '500' }}>{selected.Email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                      {selected.Status === 'PENDING_REVIEW' ? (
                        <>
                          <button
                            onClick={() => handleReject(selected.AgencyID)}
                            disabled={actionLoading}
                            style={{
                              flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none',
                              background: actionLoading ? '#fca5a5' : '#EF4444', color: '#fff', fontSize: '0.9rem',
                              fontWeight: '600', cursor: actionLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.background = '#DC2626' }}
                            onMouseLeave={(e) => { if (!actionLoading) e.currentTarget.style.background = '#EF4444' }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(selected.AgencyID)}
                            disabled={actionLoading}
                            style={{
                              flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none',
                              background: actionLoading ? '#6ee7b7' : '#10B981', color: '#fff', fontSize: '0.9rem',
                              fontWeight: '600', cursor: actionLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.background = '#059669' }}
                            onMouseLeave={(e) => { if (!actionLoading) e.currentTarget.style.background = '#10B981' }}
                          >
                            Approve
                          </button>
                        </>
                      ) : (
                        <div style={{
                          flex: 1, padding: '0.7rem', borderRadius: '8px', textAlign: 'center',
                          background: statusBg[selected.Status], color: statusColor[selected.Status],
                          fontSize: '0.9rem', fontWeight: '600',
                        }}>
                          {statusLabel[selected.Status]}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.9rem' }}>
                    เลือกรายการเพื่อดูรายละเอียด
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, cursor: 'zoom-out',
          }}
        >
          <img
            src={selected?.ImageUrl || '/card.png'}
            alt="id-card-full"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
          />
        </div>
      )}

    </div>
  )
}
