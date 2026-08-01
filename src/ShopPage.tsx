import { useState } from 'react'
import type { ChildData, PlantDef } from './types'
import { Icon } from './icons'

const TIER_COLORS: Record<string, { bg: string; label: string }> = {
  low: { bg: '#8bc34a', label: '低级' },
  mid: { bg: '#03a9f4', label: '中级' },
  high: { bg: '#9c27b0', label: '高级' },
  rare: { bg: '#ff9800', label: '稀有' },
}

export function ShopPage({
  child, plants, onPlant, onToast,
}: {
  child: ChildData
  plants: PlantDef[]
  onPlant: (defId: string) => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [confirmPlant, setConfirmPlant] = useState<string | null>(null)
  const plantMap = Object.fromEntries(plants.map(p => [p.id, p]))

  return (
    <div className="main-area">
      <div className="page-header">
        <div className="header-top">
          <div className="header-avatar">
            <Icon name="shop" size={44} />
          </div>
          <div className="header-info">
            <div className="header-name">植物商店</div>
            <span className="header-grade">
              <Icon name="sun" size={14} /> {child.sun} · <Icon name="diamond" size={14} /> {child.diamonds}
            </span>
          </div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="shop-page">
          <div className="shop-grid-phone">
            {plants.map(p => {
              const unlocked = child.unlockedPlants.includes(p.id)
              const canAfford = child.sun >= p.cost
              const gardenFull = child.garden.length >= 12
              const canPlant = unlocked && canAfford && !gardenFull
              const tier = TIER_COLORS[p.tier]

              return (
                <div className={`shop-card-phone ${!unlocked ? 'locked' : ''}`} key={p.id}>
                  <span className="tier-badge" style={{ background: tier.bg }}>{tier.label}</span>
                  <div className="plant-img">
                    <Icon name={p.icon as any} size={36} />
                  </div>
                  <div className="plant-name">{p.name}</div>
                  <div className="plant-desc">{p.desc}</div>
                  <div className="cost-line">
                    <span style={{ color: '#f9a825', fontWeight: 600 }}>
                      <Icon name="sun" size={12} /> {p.cost}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      卖 <Icon name="diamond" size={12} /> {p.sellPrice}
                    </span>
                  </div>
                  {unlocked ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '8px 4px', fontSize: 12 }}
                      disabled={!canPlant}
                      onClick={() => setConfirmPlant(p.id)}
                    >
                      {gardenFull ? '花园已满' : canAfford ? '种植' : '阳光不足'}
                    </button>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, padding: '8px 0' }}>
                      {p.id === 'corncob'
                        ? `累计阳光 ${p.unlockSun} 或连3天全勤解锁`
                        : `累计阳光 ${p.unlockSun} 解锁`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 种植确认弹窗 */}
      {confirmPlant && (
        <div className="modal-overlay" onClick={() => setConfirmPlant(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 12px' }}>
                <Icon name={plantMap[confirmPlant]?.icon as any} size={80} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>种植 {plantMap[confirmPlant]?.name}?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
                将消耗 <span style={{ color: '#f9a825', fontWeight: 700 }}>{plantMap[confirmPlant]?.cost} 阳光</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setConfirmPlant(null)}>取消</button>
              <button className="btn-primary" onClick={() => { onPlant(confirmPlant); setConfirmPlant(null) }}>确认种植</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
