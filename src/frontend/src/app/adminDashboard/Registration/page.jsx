'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const mockRegistrations = [
  { id: 1, firstName: 'มาชาโยชิ', lastName: 'ซัน', phone: '0967561691', department: 'Electric M86', status: 'pending' },
  { id: 2, firstName: 'มาชาโยชิ', lastName: 'ซัน', phone: '0967561691', department: 'Electric M86', status: 'pending' },
  { id: 3, firstName: 'มาชาโยชิ', lastName: 'ซัน', phone: '0967561691', department: 'Electric M86', status: 'pending' },
  { id: 4, firstName: 'มาชาโยชิ', lastName: 'ซัน', phone: '0967561691', department: 'Electric M86', status: 'pending' },
]

export default function RegistrationPage() {
  const [items, setItems] = useState(mockRegistrations)
  const [selected, setSelected] = useState(mockRegistrations[0])
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAction = (id, action) => {
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, status: action } : item)
    )
    if (selected?.id === id) {
      setSelected((prev) => ({ ...prev, status: action }))
    }
  }

  const statusLabel = { approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธแล้ว' }
  const statusColor = { approved: '#10B981', rejected: '#EF4444' }
  const statusBg   = { approved: '#D1FAE5', rejected: '#FEE2E2' }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar accountName="Johny Eve" />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111' }}>
            Approving agency for LINE LIFF application
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>

            {/* Left — List */}
            <div style={{
              background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              overflow: 'auto', display: 'flex', flexDirection: 'column',
            }}>
              {items.map((item) => {
                const isSelected = selected?.id === item.id
                return (
                  <div
                    key={item.id}
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
                    <img src="/card.png" alt="id-card" style={{ width: '110px', height: '75px', objectFit: 'contain', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '0.3rem' }}>
                        {item.firstName} {item.lastName}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#aaa' }}>{item.department}</p>
                    </div>
                    {item.status !== 'pending' && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                        borderRadius: '20px', background: statusBg[item.status], color: statusColor[item.status],
                        flexShrink: 0,
                      }}>
                        {statusLabel[item.status]}
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
                      src="/card.png"
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
                        <span style={{ fontWeight: '500' }}>{selected.firstName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>นามสกุล</span>
                        <span style={{ fontWeight: '500' }}>{selected.lastName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>เบอร์โทรศัพท์</span>
                        <span style={{ fontWeight: '500' }}>{selected.phone}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#aaa', width: '100px', flexShrink: 0 }}>หน่วยงาน</span>
                        <span style={{ fontWeight: '500' }}>{selected.department}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    {selected.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(selected.id, 'rejected')}
                          style={{
                            flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none',
                            background: '#EF4444', color: '#fff', fontSize: '0.9rem',
                            fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(selected.id, 'approved')}
                          style={{
                            flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none',
                            background: '#10B981', color: '#fff', fontSize: '0.9rem',
                            fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <div style={{
                        flex: 1, padding: '0.7rem', borderRadius: '8px', textAlign: 'center',
                        background: statusBg[selected.status], color: statusColor[selected.status],
                        fontSize: '0.9rem', fontWeight: '600',
                      }}>
                        {statusLabel[selected.status]}
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
            src="/card.png"
            alt="id-card-full"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
          />
        </div>
      )}

    </div>
  )
}
