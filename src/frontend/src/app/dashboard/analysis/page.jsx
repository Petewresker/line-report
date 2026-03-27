'use client'

import { useState } from 'react'
import { Home, BarChart3, LogOut, Search, Bell, MoreVertical, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const mockTopics = [
  { topic: 'ความสะอาด', count: 3450, percentage: 35, color: '#B8003F' },
  { topic: 'ทางเท้า', count: 2840, percentage: 28, color: '#5944CA' },
  { topic: 'ถนน', count: 2100, percentage: 21, color: '#005F99' },
  { topic: 'แสงสว่าง', count: 1250, percentage: 12, color: '#9282FF' },
  { topic: 'ความปลอดภัย', count: 400, percentage: 4, color: '#595C5E' },
]

const mockDuplicates = [
  { id: 'FIRE-A-202', title: 'ไฟฟ้าดับ', duplicateCount: 8, location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', color: '#B41340', bgColor: 'rgba(247, 75, 109, 0.2)' },
  { id: 'FLD-301', title: 'ท่อน้ำแตก', duplicateCount: 14, location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', color: '#5944CA', bgColor: 'rgba(160, 146, 255, 0.2)' },
  { id: 'PWR-OUT-12', title: 'ถนนยุบเป็นหลุม', duplicateCount: 5, location: 'มหาวิทยาลัยธรรมศาสตร์ รังสิต 760001', color: '#005F99', bgColor: 'rgba(175, 213, 255, 0.4)' },
]

const mockMonthlyData = [
  { month: 'ม.ค.', reports: 12 },
  { month: 'ก.พ.', reports: 18 },
  { month: 'มี.ค.', reports: 25 },
  { month: 'เม.ย.', reports: 15 },
  { month: 'พ.ค.', reports: 22 },
  { month: 'มิ.ย.', reports: 30 },
]

export default function AnalysisDashboard() {
  const maxReports = Math.max(...mockMonthlyData.map(d => d.reports))
  const totalCases = 12450
  const resolvedPercentage = 88.4

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
            color: '#64748B',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s'
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
            background: '#FFFFFF',
            boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.1)',
            color: '#1D4ED8',
            fontSize: '13px',
            fontWeight: '600'
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
              Executive Dashboard
            </h1>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#595C5E' }}>
              Monitoring and trend analysis
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '386px 1fr', gap: '24px', marginBottom: '32px' }}>
            {/* Top 5 Topics */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2C2F31' }}>
                  Top 5 Reported Issues
                </h2>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <MoreVertical size={16} color="#595C5E" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {mockTopics.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#2C2F31' }}>
                        {item.topic}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>
                        {item.count.toLocaleString()} รายการ ({item.percentage}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      background: '#E6E8EB',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${item.percentage}%`,
                        background: item.color,
                        borderRadius: '9999px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Report */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0px 1px 2px rgba(99, 102, 241, 0.05)'
            }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#2C2F31', marginBottom: '4px' }}>
                  Monthly Report
                </h2>
                <p style={{ fontSize: '12px', fontWeight: '400', color: '#595C5E' }}>
                  สรุปภาพรวมรายเดือน
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'end', gap: '36px', height: '177px', padding: '0 16px', marginBottom: '24px' }}>
                {mockMonthlyData.map((item, idx) => {
                  const height = (item.reports / maxReports) * 100
                  return (
                    <div key={idx} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${height}%`,
                        background: '#3B82F6',
                        borderRadius: '4px 4px 0 0',
                        minHeight: '20px'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#595C5E' }}>
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div style={{
                borderTop: '1px solid #EFF1F3',
                paddingTop: '24px',
                display: 'flex',
                gap: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#595C5E', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    TOTAL CASES
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#2C2F31' }}>
                    {totalCases.toLocaleString()}
                  </p>
                </div>
                <div style={{ width: '1px', background: '#E0E3E5', margin: '0 8px' }} />
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#595C5E', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    RESOLVED
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#1D4ED8' }}>
                    {resolvedPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Cases */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#2C2F31', marginBottom: '24px' }}>
              Duplicate Case Analysis
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {mockDuplicates.map((item) => (
                <div key={item.id} style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(171, 173, 175, 0.1)',
                  borderRadius: '12px',
                  padding: '21px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{
                      padding: '4px 8px',
                      background: '#EFF1F3',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#595C5E',
                      letterSpacing: '-0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {item.id}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: item.bgColor,
                      borderRadius: '9999px'
                    }}>
                      <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 10L0 8L2 6L2.7 6.725L1.925 7.5H7V5.5H8V8.5H1.925L2.7 9.275L2 10V10M1 4.5V1.5H7.075L6.3 0.725L7 0L9 2L7 4L6.3 3.275L7.075 2.5H2V4.5H1V4.5" fill={item.color}/>
                      </svg>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: item.color }}>
                        {item.duplicateCount} Times
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2C2F31', marginBottom: '8px' }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <MapPin size={12} color="#595C5E" />
                    <span style={{ fontSize: '12px', color: '#333333' }}>
                      {item.location}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid #EFF1F3', paddingTop: '16px' }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}>
                      <span>View History</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
