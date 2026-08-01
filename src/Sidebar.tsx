import { useState } from 'react'
import type { AppState, ChildData } from './types'
import { Icon } from './icons'

export type Page = 'tasks' | 'garden' | 'shop' | 'wish' | 'parent'

export function Sidebar({
  state, currentChild, page, pendingCount,
  onSwitchChild, onNavigate,
}: {
  state: AppState
  currentChild: ChildData
  page: Page
  pendingCount: number
  onSwitchChild: (id: string) => void
  onNavigate: (p: Page) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navItems: Array<{ key: Page; icon: string; label: string }> = [
    { key: 'tasks', icon: 'list', label: '今日任务' },
    { key: 'garden', icon: 'leaf', label: '我的花园' },
    { key: 'shop', icon: 'shop', label: '植物商店' },
    { key: 'wish', icon: 'gift', label: '心愿兑换' },
  ]

  function handleParentClick() {
    setShowPassword(true)
    setPasswordInput('')
    setPasswordError('')
  }

  function handlePasswordSubmit() {
    const correctPassword = state.parentPassword || '1234'
    if (passwordInput === correctPassword) {
      setShowPassword(false)
      onNavigate('parent')
    } else {
      setPasswordError('密码错误，请重试')
    }
  }

  return (
    <>
      <div className="sidebar">
        {/* 向日葵 Logo */}
        <div className="sidebar-logo">
          <Icon name="sunflower" size={48} />
        </div>

        {/* 子女切换 */}
        {state.children.map(c => (
          <div
            key={c.id}
            className={`child-avatar-wrap ${c.id === currentChild.id ? 'active' : ''}`}
            onClick={() => {
              if (page === 'parent') return
              onSwitchChild(c.id)
            }}
            style={{ opacity: page === 'parent' ? 0.4 : 1, cursor: page === 'parent' ? 'default' : 'pointer' }}
          >
            <div className="avatar-img">
              <Icon name={c.icon} size={36} />
            </div>
            <span className="c-name">{c.name}</span>
            <span className="c-grade">{c.grade}</span>
          </div>
        ))}

        <div className="sidebar-divider" />

        {/* 功能导航 */}
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item-phone ${page === item.key ? 'active' : ''}`}
            onClick={() => {
              // 家长端模式下，导航按钮不退出家长端
              if (page === 'parent') return
              onNavigate(item.key)
            }}
            style={{ position: 'relative', opacity: page === 'parent' ? 0.4 : 1 }}
            disabled={page === 'parent'}
          >
            <span className="nav-icon-wrap">
              <Icon name={item.icon} size={24} />
            </span>
            <span className="nav-label">{item.label}</span>
            {item.key === 'tasks' && pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 4,
                background: '#ff5252', color: '#fff',
                borderRadius: 8, padding: '1px 5px',
                fontSize: 9, fontWeight: 700,
              }}>{pendingCount}</span>
            )}
          </button>
        ))}

        <div className="sidebar-divider" style={{ margin: '12px 0' }} />

        {/* 家长端入口（密码保护） */}
        <button
          className={`nav-item-phone parent-nav ${page === 'parent' ? 'active' : ''}`}
          onClick={handleParentClick}
        >
          <span className="nav-icon-wrap">
            <Icon name="lock" size={24} />
          </span>
          <span className="nav-label">家长端</span>
        </button>
      </div>

      {/* 家长端密码弹窗 */}
      {showPassword && (
        <div className="modal-overlay" onClick={() => setShowPassword(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, margin: '0 auto', borderRadius: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>家长验证</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                请输入家长密码以进入管理页面
              </div>
            </div>

            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit() }}
              autoFocus
              style={{ textAlign: 'center', fontSize: 18, letterSpacing: 4 }}
            />

            {passwordError && (
              <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setShowPassword(false)}>取消</button>
              <button className="btn-primary" onClick={handlePasswordSubmit}>确认</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
