'use client'

import { useState } from 'react'
import { Home, BarChart3, LogOut, Search, Bell, Filter, MapPin, Calendar, Clock, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

const mockData = [
  {
    id: 'AC2001',
    title: 'โต๊ะปูนรั่วเกิดไฟในโดมบริหารไฟไหม้',
    description: 'ทำงานอยู่บริเวณบร.2 เห็นโน๊ตบุ๊คของตึกโดมบริหารเก่าๆ ไฟไหม่น่ะค่ะ ที่มหาวิทยาลัยธรรมกาด ',
    status: 'รอดำเนินการ',
    date: '20/02/2569',
    time: '16:20',
    location: 'มหาวิทยาลัยเกษตรศาสตร์ จังหวัด 760001',
    images: ['/fire1.jpg', '/fire2.jpg', '/fire3.jpg']
  },
  {
    id: 'AC2002',
    title: 'โต๊ะปูนรั่วเกิดไฟในโดมบริหารไฟไหม้',
    description: 'ทำงานอยู่บริเวณบร.2 เห็นโน๊ตบุ๊คของตึกโดมบริหารเก่าๆ ไฟไหม่น่ะค่ะ ที่มหาวิทยาลัยธรรมกาด ',
    status: 'เสร็จสิ้น',
    date: '20/02/2569',
    time: '16:20',
    location: 'มหาวิทยาลัยเกษตรศาสตร์ จังหวัด 760001',
    images: ['/fire1.jpg']
  },
  {
    id: 'AC2003',
    title: 'โต๊ะปูนรั่วเกิดไฟในโดมบริหารไฟไหม้',
    description: 'ทำงานอยู่บริเวณบร.2 เห็นโน๊ตบุ๊คของตึกโดมบริหารเก่าๆ ไฟไหม่น่ะค่ะ ที่มหาวิทยาลัยธรรมกาด ',
    status: 'กำลังดำเนินการ',
    date: '20/02/2569',
    time: '16:20',
    location: 'มหาวิทยาลัยเกษตรศาสตร์ จังหวัด 760001',
    images: ['/fire1.jpg']
  },
]

export default function Dashboard() {
  const [selectedCase, setSelectedCase] = useState(mockData[0])
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { label: 'ทั้งหมด', value: 3, color: '#fff', textColor: '#333' },
    { label: 'รอดำเนินการ', value: 1, color: '#fff', dot: '#F59E0B' },
    { label: 'กำลังดำเนินการ', value: 1, color: '#fff', dot: '#3B82F6' },
    { label: 'เสร็จสิ้น', value: 2, color: '#fff', dot: '#10B981' },
  ]

  const getStatusStyle = (status) => {
    const styles = {
      'รอดำเนินการ': { bg: '#FEF3C7', text: '#92400E' },
      'กำลังดำเนินการ': { bg: '#DBEAFE', text: '#1E40AF' },
      'เสร็จสิ้น': { bg: '#D1FAE5', text: '#065F46' },
    }
    return styles[status] || styles['รอดำเนินการ']
  }

  const filteredData = mockData.filter(item => {
    const matchStatus = filterStatus === 'ทั้งหมด' || item.status === filterStatus
    const matchSearch = item.title.includes(searchQuery) || item.id.includes(searchQuery)
    return matchStatus && matchSearch
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6F8' }}>
      {/* Sidebar */}
      <aside style={{
        width: '256px',
        background: '#F5F6F8',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #E6E8EB'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1D4ED8', marginBottom: '4px' }}>
            Problem list
          </h1>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#595C5E', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
            DATA INSIGHTS
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: '#FFFFFF',
            boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.1)',
            color: '#1D4ED8',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            <Home size={18} />
            <span>Home</span>
          </Link>

          <Link href="/dashboard/analysis" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            <BarChart3 size={18} />
            <span>Analysis</span>
          </Link>
        </nav>

        <div style={{ borderTop: '1px solid #E6E8EB', paddingTop: '16px', marginTop: 'auto' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%'
          }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1, maxWidth: '448px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={14} style={{
                position: 'absolute',
                left: '16px',
                color: '#595C5E'
              }} />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 16px 10px 40px',
                  background: '#EFF1F3',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  color: '#595C5E',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={20} color="#64748B" />
            </button>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#E6E8EB',
              marginLeft: '8px'
            }} />
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '800',
              color: '#2C2F31',
              letterSpacing: '-0.75px',
              marginBottom: '8px'
            }}>
              Problem List
            </h1>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#595C5E' }}>
              จัดการและติดตามเหตุการณ์ที่แจ้งเข้ามา
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{
                background: stat.color,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: '1px solid rgba(171, 173, 175, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setFilterStatus(stat.label)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {stat.dot && <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: stat.dot
                  }} />}
                  <span style={{ fontSize: '14px', fontWeight: '500', color: stat.textColor || '#666' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: stat.textColor || '#333' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Panel - List */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)',
              height: 'calc(100vh - 400px)',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: '#EFF1F3',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#595C5E'
                }}>
                  <Filter size={16} />
                  Filter
                </button>

                {['ทั้งหมด', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '8px 12px',
                      background: filterStatus === status ? '#1D4ED8' : 'transparent',
                      color: filterStatus === status ? '#fff' : '#595C5E',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: filterStatus === status ? '600' : '500',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredData.map((item) => {
                  const statusStyle = getStatusStyle(item.status)
                  const isSelected = selectedCase?.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCase(item)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '16px',
                        border: isSelected ? '2px solid #1D4ED8' : '1px solid rgba(171, 173, 175, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isSelected ? '#F0F9FF' : '#fff'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      <div style={{
                        width: '80px',
                        height: '60px',
                        background: '#EFF1F3',
                        borderRadius: '6px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '11px'
                      }}>
                        รูปภาพ
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ 
                              fontSize: '14px', 
                              fontWeight: '700', 
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#2C2F31'
                            }}>
                              {item.title}
                            </h3>
                            <p style={{ fontSize: '12px', color: '#595C5E' }}>ID: {item.id}</p>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '700',
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            whiteSpace: 'nowrap',
                            marginLeft: '8px'
                          }}>
                            {item.status}
                          </span>
                        </div>

                        <p style={{
                          fontSize: '12px',
                          color: '#595C5E',
                          marginBottom: '8px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.description}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#595C5E' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{item.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Panel - Detail */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)',
              height: 'calc(100vh - 400px)',
              overflow: 'auto'
            }}>
              {selectedCase ? (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#2C2F31', marginBottom: '8px' }}>
                    {selectedCase.title}
                  </h2>
                  <p style={{ color: '#595C5E', marginBottom: '24px', fontSize: '14px' }}>ID: {selectedCase.id}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {selectedCase.images.map((_, idx) => (
                      <div key={idx} style={{
                        background: '#EFF1F3',
                        borderRadius: '8px',
                        aspectRatio: '16/9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '12px'
                      }}>
                        รูปภาพ {idx + 1}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: '#2C2F31' }}>Description</h3>
                    <p style={{ color: '#595C5E', lineHeight: '1.6', fontSize: '14px' }}>{selectedCase.description}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: '#2C2F31' }}>Location</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#595C5E', fontSize: '14px' }}>
                      <MapPin size={16} />
                      <span>{selectedCase.location}</span>
                    </div>
                    <a href="#" style={{ color: '#2563EB', fontSize: '13px', marginTop: '8px', display: 'inline-block', fontWeight: '600' }}>
                      Open in Google Map →
                    </a>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: '#2C2F31' }}>ข้อมูลการแจ้งเหตุ</h3>
                    <div style={{ display: 'flex', gap: '24px', color: '#595C5E', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} />
                        <span>วันที่ {selectedCase.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} />
                        <span>{selectedCase.time}</span>
                      </div>
                    </div>
                  </div>

                  <button style={{
                    width: '100%',
                    background: '#1D4ED8',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1E40AF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1D4ED8'}
                  >
                    ส่งข้อมูล
                  </button>
                </>
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '14px'
                }}>
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
