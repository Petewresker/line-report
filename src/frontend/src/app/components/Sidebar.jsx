'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart2, ClipboardList } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/adminDashboard' },
  { label: 'Analysis', icon: BarChart2, href: '/adminDashboard/Analysis' },
  { label: 'Registration', icon: ClipboardList, href: '/adminDashboard/Registration' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '200px',
      minHeight: '100%',
      background: '#fff',
      borderRight: '1px solid #e5e5e5',
      padding: '1.5rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      flexShrink: 0,
    }}>
      {navItems.map(({ label, icon: Icon, href }) => {
        const isActive = pathname === href
        return (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#F97316' : '#555',
                background: isActive ? '#FFF7ED' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f5f5f5' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={17} />
              {label}
            </div>
          </Link>
        )
      })}
    </aside>
  )
}
