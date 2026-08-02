import { useState } from 'react'
import type { ChildData, GardenPlant, PlantDef } from './types'
import { Icon } from './icons'

export function GardenPage({
  child, plants, onSellPlant,
}: {
  child: ChildData
  plants: PlantDef[]
  onSellPlant: (uid: string) => void
}) {
  const [selected, setSelected] = useState<GardenPlant | null>(null)
  const plantMap = Object.fromEntries(plants.map(p => [p.id, p]))

  const maxSlots = 12
  const slots = Array.from({ length: maxSlots }, (_, i) => child.garden[i] || null)
  const hasCornUnlocked = child.unlockedPlants.includes('corncob')

  // 数据汇总
  const plantedCount = child.garden.length
  const unlockedCount = child.unlockedPlants.length
  const totalPlants = plants.length

  // 防御力计算：每株植物根据 category 提供防御力
  // attack: 10, defense: 20, sun: 5, rare: 40
  const defenseMap: Record<string, number> = { attack: 10, defense: 20, sun: 5, rare: 40 }
  const defensePower = child.garden.reduce((sum, p) => {
    const def = plantMap[p.defId]
    return sum + (def ? (defenseMap[def.category] || 5) : 0)
  }, 0)

  return (
    <div className="main-area">
      <div className="page-header">
        <div className="header-top">
          <div className="header-avatar">
            <Icon name={child.icon as any} size={44} />
          </div>
          <div className="header-info">
            <div className="header-name">{child.name}的花园</div>
            <span className="header-grade">{child.garden.length}/{maxSlots} 株</span>
          </div>
        </div>
        <div className="header-progress">
          <div className="progress-bar-phone">
            <div className="fill" style={{ width: `${(child.garden.length / maxSlots) * 100}%` }} />
          </div>
          <div className="progress-count">{child.garden.length}/{maxSlots}</div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="garden-page">
          {/* ====== 顶部数据汇总模块 ====== */}
          <div className="garden-summary">
            <div className="summary-card">
              <div className="summary-icon planted"><Icon name="leaf" size={22} /></div>
              <div className="summary-body">
                <div className="summary-value">{plantedCount}<span className="summary-total">/{maxSlots}</span></div>
                <div className="summary-label">已种植</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon unlocked"><Icon name="diamond" size={22} /></div>
              <div className="summary-body">
                <div className="summary-value">{child.diamonds}</div>
                <div className="summary-label">钻石</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon sun"><Icon name="sun" size={22} /></div>
              <div className="summary-body">
                <div className="summary-value">{child.sun}</div>
                <div className="summary-label">阳光值</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon defense"><Icon name="shield" size={22} /></div>
              <div className="summary-body">
                <div className="summary-value">{defensePower}</div>
                <div className="summary-label">花园防御力</div>
              </div>
            </div>
          </div>

          {hasCornUnlocked && (
            <div className="corn-banner">
              <Icon name="corncob" size={28} />
              <span>已解锁稀有植物：玉米加农炮 🌽💣</span>
            </div>
          )}

          {/* ====== 种植棋盘 ====== */}
          <div className="garden-board-wrap">
            <div className="garden-board-title">
              <Icon name="house" size={20} />
              <span>花园阵地</span>
              <span className="board-defense">防御力 {defensePower}</span>
            </div>
            <div className="garden-grid">
              {slots.map((plant, i) => (
                <div className={`garden-slot ${plant ? 'has-plant' : ''}`} key={i}>
                  {plant ? (
                    <div
                      className="plant-in-garden"
                      onClick={() => setSelected(plant)}
                      title="点击出售植物"
                    >
                      <div className="plant-slot-icon">
                        <Icon name={plantMap[plant.defId]?.icon as any} size={26} />
                      </div>
                      <div className="plant-slot-name">{plantMap[plant.defId]?.name}</div>
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <Icon name="grass" size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="garden-tip">
            <Icon name="info" size={14} /> 点击已种植的植物可出售换钻石 · 完成任务获得阳光与解锁新植物
          </div>
        </div>
      </div>

      {/* ====== 选中植物底部弹窗（出售） ====== */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 12px' }}>
                <Icon name={plantMap[selected.defId]?.icon as any} size={80} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{plantMap[selected.defId]?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {plantMap[selected.defId]?.desc}
              </div>
              <div style={{ fontSize: 14, color: 'var(--orange)', marginTop: 8, fontWeight: 600 }}>
                出售可获得 {plantMap[selected.defId]?.sellPrice} 钻石
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setSelected(null)}>留在花园</button>
              <button
                className="btn-primary"
                style={{ background: 'var(--orange)' }}
                onClick={() => { onSellPlant(selected.uid); setSelected(null) }}
              >
                出售换钻石
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
