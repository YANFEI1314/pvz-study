import { useState } from 'react'
import type { ChildData, WishItem, WishExchange } from './types'
import { Icon } from './icons'

export function WishPage({
  child, wishes, exchanges, onExchange, onToast,
}: {
  child: ChildData
  wishes: WishItem[]
  exchanges: WishExchange[]
  onExchange: (wish: WishItem) => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [confirmWish, setConfirmWish] = useState<WishItem | null>(null)
  const childWishes = wishes.filter(w => w.childId === child.id)
  const childExchanges = exchanges.filter(e => e.childId === child.id)

  return (
    <div className="main-area">
      <div className="page-header">
        <div className="header-top">
          <div className="header-avatar">
            <Icon name="gift" size={44} />
          </div>
          <div className="header-info">
            <div className="header-name">心愿兑换</div>
            <span className="header-grade">
              <Icon name="diamond" size={14} /> {child.diamonds} 钻石
            </span>
          </div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="wish-page">
          {childWishes.length === 0 && (
            <div className="empty-state-phone">
              <Icon name="gift" size={80} />
              <div style={{ fontSize: 15, marginTop: 8 }}>家长还没有设置心愿奖励</div>
            </div>
          )}

          <div className="wish-grid-phone">
            {childWishes.map(w => {
              const canAfford = child.diamonds >= w.cost
              return (
                <div className="wish-card-phone" key={w.id}>
                  <div className="wish-img">
                    <Icon name={w.icon as any} size={32} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginBottom: 8 }}>
                    <Icon name="diamond" size={12} /> {w.cost}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 4px', fontSize: 12, background: canAfford ? 'var(--purple)' : '#ccc' }}
                    disabled={!canAfford}
                    onClick={() => setConfirmWish(w)}
                  >
                    {canAfford ? '兑换' : '钻石不足'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* 兑换记录 */}
          {childExchanges.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>兑换记录</div>
              {childExchanges.slice().reverse().map(e => (
                <div className="parent-card-phone" key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="gift" size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{e.wishTitle}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {e.cost} 钻石 · {new Date(e.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <span className={`status-tag ${e.status}`}>
                    {e.status === 'approved' ? '已兑换' : e.status === 'pending' ? '处理中' : '已撤销'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 兑换确认 */}
      {confirmWish && (
        <div className="modal-overlay" onClick={() => setConfirmWish(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 12px' }}>
                <Icon name={confirmWish.icon as any} size={80} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>兑换 {confirmWish.title}?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
                将消耗 <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{confirmWish.cost} 钻石</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setConfirmWish(null)}>取消</button>
              <button className="btn-primary" style={{ background: 'var(--purple)' }} onClick={() => { onExchange(confirmWish); setConfirmWish(null) }}>确认兑换</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
