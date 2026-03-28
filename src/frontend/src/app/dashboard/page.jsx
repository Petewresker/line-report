'use client'

import { useState } from 'react'
import { Search, Filter, User, MapPin, Calendar, Clock } from 'lucide-react'

const mockData = [
  {
    id: 'AC2001',
    title: 'โต๊ะปูนรั่วเกิดไฟในบริหารไฟไหม้',
    description: 'ศัพทามยุ่งเวียนเวล 2 เต็มโป๊ะเปิดสุดอดีตในเรื่องสาเหตุทำ ไฟไหม่ทำกับเวทีเวียนรอบทาง',
    status: 'รอดำเนินการ',
    date: '20/02/2569',
    time: '16:20',
    location: 'มหาวิทยาลัยเกษตรศาสตร์ จังหวัด 760001',
    images: ['/fire1.jpg', '/fire2.jpg', '/fire3.jpg']
  },
  {
    id: 'AC2002',
    title: 'โต๊ะปูนรั่วเกิดไฟในบริหารไฟไหม้',
    description: 'ศัพทามยุ่งเวียนเวล 2 เต็มโป๊ะเปิดสุดอดีตในเรื่องสาเหตุทำ ไฟไหม่ทำกับเวทีเวียนรอบทาง',
    status: 'เสร็จสิ้น',
    date: '20/02/2569',
    time: '16:20',
    location: 'มหาวิทยาลัยเกษตรศาสตร์ จังหวัด 760001',
    images: ['/fire1.jpg']
  },
  {
    id: 'AC2003',
    title: 'โต๊ะปูนรั่วเกิดไฟในบริหารไฟไหม้',
    description: 'ศัพทามยุ่งเวียนเวล 2 เต็มโป๊ะเปิดสุดอดีตในเรื่องสาเหตุทำ ไฟไหม่ทำกับเวทีเวียนรอบทาง',
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
  
  const handleSelectCase = (item) => {
    setSelectedCase(item)
  }

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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{
        background: '#fff',
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Problem List</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>แอดมิน</span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#e5e5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} />
          </div>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{
              background: stat.color,
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => setFilterStatus(stat.label)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {stat.dot && <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: stat.dot
                }} />}
                <span style={{ fontSize: '0.875rem', color: stat.textColor || '#666' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.textColor || '#333' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left Panel - List */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 'calc(100vh - 280px)',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <Filter size={16} />
                Filter
              </button>

              {['ทั้งหมด', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: filterStatus === status ? '#e5e5e5' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: filterStatus === status ? '600' : '400',
                    fontSize: '0.875rem'
                  }}
                >
                  {status}
                </button>
              ))}

              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f5f5f5',
                borderRadius: '6px',
                flex: '1',
                minWidth: '200px'
              }}>
                <Search size={16} color="#999" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredData.map((item) => {
                const statusStyle = getStatusStyle(item.status)
                const isSelected = selectedCase?.id === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCase(item)}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: isSelected ? '2px solid #3B82F6' : '1px solid #e5e5e5',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isSelected ? '#F0F9FF' : '#fff'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{
                      width: '100px',
                      height: '70px',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '0.7rem'
                    }}>
                      รูปภาพ
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: '600', 
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.title}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: '#666' }}>{item.id}</p>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          whiteSpace: 'nowrap',
                          marginLeft: '0.5rem'
                        }}>
                          {item.status}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        marginBottom: '0.5rem',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: '#999' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{item.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 'calc(100vh - 280px)',
            overflow: 'auto'
          }}>
            {selectedCase ? (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {selectedCase.title}
                </h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>ID: {selectedCase.id}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                  {selectedCase.images.map((_, idx) => (
                    <div key={idx} style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      aspectRatio: '16/9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '0.75rem'
                    }}>
                      รูปภาพ {idx + 1}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>รายละเอียด</h3>
                  <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>{selectedCase.description}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>ตำแหน่ง</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    <MapPin size={16} />
                    <span>{selectedCase.location}</span>
                  </div>
                  <a href="#" style={{ color: '#3B82F6', fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block' }}>
                    เปิดใน Google Map →
                  </a>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>ข้อมูลการแจ้งเหตุ</h3>
                  <div style={{ display: 'flex', gap: '2rem', color: '#666', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} />
                      <span>วันที่ {selectedCase.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      <span>{selectedCase.time}</span>
                    </div>
                  </div>
                </div>

                <button style={{
                  width: '100%',
                  background: '#10B981',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
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
                fontSize: '0.9rem'
              }}>
                เลือกรายการเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
