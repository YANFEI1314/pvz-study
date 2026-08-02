import { useState, useRef } from 'react'
import type React from 'react'
import type { AppState, ChildData, Task, WishItem, Subject, TaskGroup, PlantDef } from './types'
import { SUBJECT_CONFIG, SUBJECT_GROUP, TASK_ICONS } from './data'
import { Icon } from './icons'

type ParentTab = 'childInfo' | 'tasks' | 'review' | 'progress' | 'wishes' | 'wishReview' | 'bonus' | 'password' | 'plants'

export function ParentPage({
  state, currentChild, todayStr,
  onAddTask, onEditTask, onDeleteTask, onApproveTask, onRejectTask,
  onAddWish, onEditWish, onDeleteWish, onRevokeWish,
  onBonusSun, onBonusDiamond, onRestorePlant, onUpdateChild, onChangePassword,
  onAddPlant, onEditPlant, onDeletePlant, onExit, onToast,
}: {
  state: AppState
  currentChild: ChildData
  todayStr: string
  onAddTask: (childId: string, t: Omit<Task, 'id' | 'createdAt' | 'status' | 'date' | 'childId'>) => void
  onEditTask: (id: string, patch: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onApproveTask: (t: Task) => void
  onRejectTask: (t: Task) => void
  onAddWish: (childId: string, w: Omit<WishItem, 'id' | 'childId'>) => void
  onEditWish: (id: string, patch: Partial<WishItem>) => void
  onDeleteWish: (id: string) => void
  onRevokeWish: (exId: string) => void
  onBonusSun: (childId: string, amount: number) => void
  onBonusDiamond: (childId: string, amount: number) => void
  onRestorePlant: (childId: string, defId: string) => void
  onUpdateChild: (childId: string, patch: { name?: string; grade?: string; icon?: string; learningStart?: string; learningEnd?: string }) => void
  onChangePassword: (newPassword: string) => void
  onAddPlant: (data: Omit<PlantDef, 'id'>) => void
  onEditPlant: (id: string, patch: Partial<PlantDef>) => void
  onDeletePlant: (id: string) => void
  onExit: () => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [tab, setTab] = useState<ParentTab>('tasks')
  const [parentChildId, setParentChildId] = useState(currentChild.id)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [addingWish, setAddingWish] = useState(false)
  const [editingWish, setEditingWish] = useState<WishItem | null>(null)
  const [bonusModal, setBonusModal] = useState(false)
  const [restoreModal, setRestoreModal] = useState(false)
  const [diamondModal, setDiamondModal] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [deleteWishId, setDeleteWishId] = useState<string | null>(null)
  const [addingPlant, setAddingPlant] = useState(false)
  const [editingPlant, setEditingPlant] = useState<PlantDef | null>(null)
  const [deletePlantId, setDeletePlantId] = useState<string | null>(null)
  const [reviewTask, setReviewTask] = useState<Task | null>(null)

  // 家长端独立选择的孩子（不影响学生端 currentChildId）
  const parentChild = state.children.find(c => c.id === parentChildId) || currentChild

  const childTasks = state.tasks.filter(t => t.childId === parentChild.id && t.date === todayStr)
  const childWishes = state.wishes.filter(w => w.childId === parentChild.id)
  const childExchanges = state.exchanges.filter(e => e.childId === parentChild.id)
  const submittedTasks = childTasks.filter(t => t.status === 'submitted')
  const recentExchanges = childExchanges.filter(e => e.status === 'approved').slice().reverse().slice(0, 5)

  const tabs: Array<{ key: ParentTab; label: string; badge?: number }> = [
    { key: 'childInfo', label: '孩子信息' },
    { key: 'tasks', label: '任务管理' },
    { key: 'review', label: `打卡审核${submittedTasks.length > 0 ? `(${submittedTasks.length})` : ''}` },
    { key: 'progress', label: '进度查看' },
    { key: 'wishes', label: '心愿管理' },
    { key: 'wishReview', label: '兑换记录' },
    { key: 'plants', label: '植物管理' },
    { key: 'bonus', label: '补发/恢复' },
    { key: 'password', label: '密码设置' },
  ]

  return (
    <div className="main-area">
      <div className="page-header">
        <div className="header-top" style={{ justifyContent: 'center' }}>
          <div className="header-info" style={{ textAlign: 'center' }}>
            <div className="header-name">家长端</div>
            <span className="header-grade">{parentChild.name} · {parentChild.grade}</span>
          </div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="parent-page-phone">
          {/* 家长端孩子切换栏 + 退出按钮 */}
          <div className="parent-child-switcher" style={{ position: 'relative', paddingRight: 50 }}>
            {state.children.map(c => (
              <button
                key={c.id}
                className={`parent-child-btn ${c.id === parentChildId ? 'active' : ''}`}
                onClick={() => setParentChildId(c.id)}
              >
                <Icon name={c.icon as any} size={18} />
                <span>{c.name}</span>
              </button>
            ))}
            <button
              onClick={onExit}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--red)', color: '#fff', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                boxShadow: '0 2px 6px rgba(239,83,80,0.3)',
              }}
              title="退出家长端"
            >
              ✕
            </button>
          </div>

          {/* Tab 栏 */}
          <div className="parent-tabs-phone">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`parent-tab-phone ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 孩子信息编辑 */}
          {tab === 'childInfo' && (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>孩子基础信息</div>
              <ChildInfoCard
                key={parentChild.id}
                child={parentChild}
                onUpdate={onUpdateChild}
                onToast={onToast}
              />
            </>
          )}

          {/* 任务管理 */}
          {tab === 'tasks' && (
            <>
              {/* 全局学习时段设置 */}
              <div style={{
                background: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  <Icon name="clock" size={14} /> 学习时段
                </span>
                <input
                  className="form-input"
                  type="time"
                  value={parentChild.learningStart || '10:00'}
                  onChange={e => onUpdateChild(parentChild.id, { learningStart: e.target.value } as any)}
                  style={{ width: 110, height: 36, fontSize: 13, padding: '6px 8px' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>至</span>
                <input
                  className="form-input"
                  type="time"
                  value={parentChild.learningEnd || '22:00'}
                  onChange={e => onUpdateChild(parentChild.id, { learningEnd: e.target.value } as any)}
                  style={{ width: 110, height: 36, fontSize: 13, padding: '6px 8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{parentChild.name} 的今日任务</span>
                <button className="btn-sm btn-green" onClick={() => setAddingTask(true)}>+ 新建</button>
              </div>
              {childTasks.map(t => {
                const sc = SUBJECT_CONFIG[t.subject]
                const taskIcon = t.icon || sc.icon
                return (
                  <div className="parent-card-phone" key={t.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <Icon name={taskIcon as any} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {sc.label} · <Icon name="sun" size={10} />{t.reward} · {t.deadline}
                          {t.requireUpload && <span style={{ marginLeft: 4 }}><Icon name="camera" size={10} /></span>}
                        </div>
                      </div>
                      <span className={`status-tag ${t.status}`}>{statusText(t.status)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-sm btn-blue" onClick={() => setEditingTask(t)}>编辑</button>
                      <button className="btn-sm btn-red" onClick={() => setDeleteTaskId(t.id)}>删除</button>
                    </div>
                  </div>
                )
              })}
              {childTasks.length === 0 && <div className="empty-state-phone">暂无任务</div>}
            </>
          )}

          {/* 打卡审核 */}
          {tab === 'review' && (
            <>
              {submittedTasks.length === 0 && <div className="empty-state-phone">暂无待审核任务</div>}
              {submittedTasks.map(t => {
                const sc = SUBJECT_CONFIG[t.subject]
                const taskIcon = t.icon || sc.icon
                return (
                  <div className="parent-card-phone" key={t.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <Icon name={taskIcon as any} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {sc.label} · <Icon name="sun" size={10} />{t.reward}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-sm btn-blue" style={{ flex: 1 }} onClick={() => setReviewTask(t)}>查看材料</button>
                      <button className="btn-sm btn-green" style={{ flex: 1 }} onClick={() => onApproveTask(t)}>通过</button>
                      <button className="btn-sm btn-red" style={{ flex: 1 }} onClick={() => onRejectTask(t)}>驳回</button>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* 进度查看 */}
          {tab === 'progress' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <StatBox icon="sun" label="阳光" value={parentChild.sun} color="#f9a825" />
                <StatBox icon="diamond" label="钻石" value={parentChild.diamonds} color="#ff9800" />
                <StatBox icon="leaf" label="花园植物" value={`${parentChild.garden.length}/12`} color="#4caf50" />
                <StatBox icon="fire" label="连续全勤" value={`${parentChild.perfectDays}天`} color="#ef5350" />
                <StatBox icon="trophy" label="累计全勤" value={`${parentChild.totalPerfectDays}天`} color="#9c27b0" />
                <StatBox icon="trophy_star" label="累计阳光" value={parentChild.totalSunEarned} color="#ff9800" />
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>今日任务进度</div>
              <div className="progress-bar-phone" style={{ marginBottom: 16 }}>
                <div className="fill" style={{ width: `${childTasks.length > 0 ? (childTasks.filter(t => t.status === 'approved').length / childTasks.length) * 100 : 0}%` }} />
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>已解锁植物</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {parentChild.unlockedPlants.map(id => {
                  const plantDef = state.plants.find(p => p.id === id)
                  return (
                    <div key={id} style={{ background: '#fff', borderRadius: 10, padding: '6px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <Icon name={plantDef?.icon as any} size={20} />
                      {plantDef?.name}
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>花园植物</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {parentChild.garden.map(p => {
                  const plantDef = state.plants.find(pl => pl.id === p.defId)
                  return (
                    <div key={p.uid} style={{ background: '#fff', borderRadius: 10, padding: 6, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <Icon name={plantDef?.icon as any} size={32} />
                    </div>
                  )
                })}
                {parentChild.garden.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>花园空空如也</div>}
              </div>
            </>
          )}

          {/* 心愿管理 */}
          {tab === 'wishes' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{parentChild.name} 的心愿清单</span>
                <button className="btn-sm btn-green" onClick={() => setAddingWish(true)}>+ 新增</button>
              </div>
              {childWishes.map(w => (
                <div className="parent-card-phone" key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={w.icon as any} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}><Icon name="diamond" size={10} /> {w.cost}</div>
                  </div>
                  <button className="btn-sm btn-blue" onClick={() => setEditingWish(w)}>编辑</button>
                  <button className="btn-sm btn-red" onClick={() => setDeleteWishId(w.id)}>删除</button>
                </div>
              ))}
              {childWishes.length === 0 && <div className="empty-state-phone">暂无心愿</div>}
            </>
          )}

          {/* 兑换记录（可撤销） */}
          {tab === 'wishReview' && (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                孩子兑换心愿后会直接扣钻石。如需撤销，点击"撤销"可退还钻石。
              </div>
              {recentExchanges.length === 0 && <div className="empty-state-phone">暂无兑换记录</div>}
              {recentExchanges.map(e => (
                <div className="parent-card-phone" key={e.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Icon name="gift" size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{e.wishTitle}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        <Icon name="diamond" size={10} /> {e.cost} · {new Date(e.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-sm btn-red" style={{ flex: 1 }} onClick={() => onRevokeWish(e.id)}>撤销��换</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 补发/恢复 */}
          {tab === 'bonus' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <button className="btn-primary" style={{ background: 'var(--orange)' }} onClick={() => setBonusModal(true)}>
                  <Icon name="sun" size={16} /> 补发阳光
                </button>
                <button className="btn-primary" style={{ background: 'var(--blue)' }} onClick={() => setDiamondModal(true)}>
                  <Icon name="diamond" size={16} /> 补发钻石
                </button>
                <button className="btn-primary" style={{ gridColumn: 'span 2' }} onClick={() => setRestoreModal(true)}>
                  <Icon name="leaf" size={16} /> 恢复植物
                </button>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>僵尸攻击记录</div>
              {(state._zombieLog || []).filter(l => l.childId === parentChild.id).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>暂无僵尸攻击记录，花园很安全</div>
              )}
              {(state._zombieLog || []).filter(l => l.childId === parentChild.id).slice().reverse().map((l, i) => (
                <div className="parent-card-phone" key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={l.type === 'bucket' ? 'buckethead' : 'zombie'} size={32} />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {l.type === 'bucket' ? '铁桶僵尸' : '普通僵尸'}来袭！
                    {l.eaten.length > 0 && ` 吃掉 ${l.eaten.length} 株植物`}
                    {l.sunLost > 0 && ` 扣除 ${l.sunLost} 阳光`}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 植物管理 */}
          {tab === 'plants' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>植物图鉴管理</span>
                <button className="btn-sm btn-green" onClick={() => setAddingPlant(true)}>+ 新增植物</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                管理植物种类，新增、编辑或删除植物。删除植物不会影响已种植在花园中的实例。
              </div>
              {state.plants.map(p => {
                const tierColors: Record<string, string> = { low: '#8bc34a', mid: '#03a9f4', high: '#9c27b0', rare: '#ff9800' }
                const tierLabels: Record<string, string> = { low: '低级', mid: '中级', high: '高级', rare: '稀有' }
                return (
                  <div className="parent-card-phone" key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px' }}>
                    <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Icon name={p.icon as any} size={32} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'nowrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                        <span style={{ fontSize: 10, background: tierColors[p.tier] || '#999', color: '#fff', padding: '1px 6px', borderRadius: 8, flexShrink: 0 }}>{tierLabels[p.tier] || p.tier}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>
                        {p.desc} · 阳光{p.cost} · 解锁{p.unlockSun}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-sm btn-blue" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => setEditingPlant(p)}>编辑</button>
                        <button className="btn-sm btn-red" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => setDeletePlantId(p.id)}>删除</button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {state.plants.length === 0 && <div className="empty-state-phone">暂无植物</div>}
            </>
          )}

          {/* 密码设置 */}
          {tab === 'password' && (
            <PasswordSettings
              currentPassword={state.parentPassword || '1234'}
              onChangePassword={onChangePassword}
              onToast={onToast}
            />
          )}
        </div>
      </div>

      {/* 弹窗层 */}
      {(addingTask || editingTask) && (
        <TaskEditModal
          task={editingTask}
          onClose={() => { setAddingTask(false); setEditingTask(null) }}
          onSave={(data) => {
            if (editingTask) onEditTask(editingTask.id, data)
            else onAddTask(parentChild.id, data)
            setAddingTask(false); setEditingTask(null)
          }}
        />
      )}

      {(addingWish || editingWish) && (
        <WishEditModal
          wish={editingWish}
          onClose={() => { setAddingWish(false); setEditingWish(null) }}
          onSave={(data) => {
            if (editingWish) onEditWish(editingWish.id, data)
            else onAddWish(parentChild.id, data)
            setAddingWish(false); setEditingWish(null)
          }}
        />
      )}

      {deleteTaskId && (
        <ConfirmModal
          message="确认删除此任务？"
          onConfirm={() => { onDeleteTask(deleteTaskId); setDeleteTaskId(null) }}
          onCancel={() => setDeleteTaskId(null)}
        />
      )}
      {deleteWishId && (
        <ConfirmModal
          message="确认删除此心愿？"
          onConfirm={() => { onDeleteWish(deleteWishId); setDeleteWishId(null) }}
          onCancel={() => setDeleteWishId(null)}
        />
      )}

      {reviewTask && (
        <div className="modal-overlay" onClick={() => setReviewTask(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">审核「{reviewTask.title}」</div>
            {reviewTask.material ? (
              reviewTask.material.startsWith('data:video')
                ? <video src={reviewTask.material} controls style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
                : <img src={reviewTask.material} style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>该任务无需上传材料</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => { onRejectTask(reviewTask); setReviewTask(null) }}>驳回</button>
              <button className="btn-primary" onClick={() => { onApproveTask(reviewTask); setReviewTask(null) }}>通过审核</button>
            </div>
          </div>
        </div>
      )}

      {bonusModal && (
        <BonusModal
          child={parentChild}
          onClose={() => setBonusModal(false)}
          onConfirm={(amount) => { onBonusSun(parentChild.id, amount); setBonusModal(false) }}
        />
      )}

      {diamondModal && (
        <DiamondBonusModal
          child={parentChild}
          onClose={() => setDiamondModal(false)}
          onConfirm={(amount) => { onBonusDiamond(parentChild.id, amount); setDiamondModal(false) }}
        />
      )}

      {restoreModal && (
        <RestoreModal
          child={parentChild}
          plants={state.plants}
          onClose={() => setRestoreModal(false)}
          onConfirm={(defId) => { onRestorePlant(parentChild.id, defId); setRestoreModal(false) }}
        />
      )}

      {deletePlantId && (
        <ConfirmModal
          message="确认删除此植物？已种植在花园中的实例不会受影响。"
          onConfirm={() => { onDeletePlant(deletePlantId); setDeletePlantId(null) }}
          onCancel={() => setDeletePlantId(null)}
        />
      )}

      {(addingPlant || editingPlant) && (
        <PlantEditModal
          plant={editingPlant}
          onClose={() => { setAddingPlant(false); setEditingPlant(null) }}
          onSave={(data) => {
            if (editingPlant) onEditPlant(editingPlant.id, data)
            else onAddPlant(data)
            setAddingPlant(false); setEditingPlant(null)
          }}
        />
      )}
    </div>
  )
}

function statusText(status: string) {
  if (status === 'approved') return '已完成'
  if (status === 'submitted') return '待审核'
  if (status === 'overdue') return '已逾期'
  return '待完成'
}

function StatBox({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 14, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <Icon name={icon as any} size={24} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// 孩子信息编辑卡片
function ChildInfoCard({ child, onUpdate, onToast }: {
  child: ChildData
  onUpdate: (childId: string, patch: { name?: string; grade?: string; icon?: string }) => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [name, setName] = useState(child.name)
  const [grade, setGrade] = useState(child.grade)
  const [avatar, setAvatar] = useState<string>(child.icon)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onToast('正在处理图片...', 'info')

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // 用 Canvas 压缩到 128x128
        const canvas = document.createElement('canvas')
        const size = 128
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        // 居中裁剪
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setAvatar(dataUrl)
        onToast('头像已更新，点击保存生效', 'success')
      }
      img.onerror = () => {
        onToast('图片加载失败，请重试', 'error')
      }
      img.src = reader.result as string
    }
    reader.onerror = () => {
      onToast('图片读取失败，请重试', 'error')
    }
    reader.readAsDataURL(file)
    // 清空 input，允许重复选择同一文件
    e.target.value = ''
  }

  function handleSave() {
    if (!name.trim()) {
      onToast('姓名不能为空', 'error')
      return
    }
    onUpdate(child.id, { name: name.trim(), grade: grade.trim(), icon: avatar })
  }

  return (
    <div className="parent-card-phone" style={{ marginBottom: 12 }}>
      {/* 头像区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 72, height: 72, borderRadius: '50%', cursor: 'pointer',
            background: '#f0f4ec', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '3px solid var(--green-light)', position: 'relative',
          }}
        >
          {avatar.startsWith('data:') ? (
            <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icon name={avatar as any} size={44} />
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ marginTop: 8, fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          📷 点击更换头像
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarUpload}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">姓名</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="请输入姓名" />
        </div>
        <div className="form-group">
          <label className="form-label">年级</label>
          <input className="form-input" value={grade} onChange={e => setGrade(e.target.value)} placeholder="如：二年级" />
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 4 }} onClick={handleSave}>
        保存信息
      </button>
    </div>
  )
}

// 密码设置组件
function PasswordSettings({ currentPassword, onChangePassword, onToast }: {
  currentPassword: string
  onChangePassword: (newPassword: string) => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [error, setError] = useState('')

  function handleChange() {
    setError('')
    if (!oldPwd || !newPwd || !confirmPwd) {
      setError('请填写所有密码字段')
      return
    }
    if (oldPwd !== currentPassword) {
      setError('当前密码错误')
      return
    }
    if (newPwd.length < 4) {
      setError('新密码至少4位')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('两次新密码不一致')
      return
    }
    onChangePassword(newPwd)
    setOldPwd('')
    setNewPwd('')
    setConfirmPwd('')
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>修改家长密码</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          修改后请牢记新密码
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">当前密码</label>
        <input className="form-input" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="输入当前密码" />
      </div>
      <div className="form-group">
        <label className="form-label">新密码</label>
        <input className="form-input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="输入新密码（至少4位）" />
      </div>
      <div className="form-group">
        <label className="form-label">确认新密码</label>
        <input className="form-input" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="再次输入新密码" />
      </div>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button className="btn-primary" onClick={handleChange} style={{ background: 'var(--orange)' }}>
        保存新密码
      </button>

      {/* 数据备份与恢复 */}
      <div style={{ borderTop: '1px solid #e0e0e0', marginTop: 24, paddingTop: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>💾</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>数据备份与恢复</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
            导出数据保存到剪贴板，换手机或换链接时可粘贴恢复
          </div>
        </div>
        <DataBackupRestore onToast={onToast} />
      </div>
    </div>
  )
}

function DataBackupRestore({ onToast }: { onToast: (text: string, type?: 'success' | 'error' | 'info') => void }) {
  const [importText, setImportText] = useState('')

  function handleExport() {
    try {
      const raw = localStorage.getItem('pvz-study-state') || '{}'
      const data = btoa(unescape(encodeURIComponent(raw)))
      const text = `PVZ_BACKUP:${data}`
      // 尝试复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          onToast('数据已复制到剪贴板！请粘贴到备忘录保存', 'success')
        }).catch(() => {
          setImportText(text)
          onToast('已显示在下方输入框，请长按复制保存', 'info')
        })
      } else {
        setImportText(text)
        onToast('已显示在下方输入框，请长按复制保存', 'info')
      }
    } catch (e) {
      onToast('导出失败', 'error')
    }
  }

  function handleImport() {
    if (!importText.trim()) {
      onToast('请粘贴备份数据', 'error')
      return
    }
    try {
      const text = importText.trim()
      if (!text.startsWith('PVZ_BACKUP:')) {
        onToast('数据格式不正确', 'error')
        return
      }
      const data = text.replace('PVZ_BACKUP:', '')
      const raw = decodeURIComponent(escape(atob(data)))
      const parsed = JSON.parse(raw)
      if (!parsed.children || !parsed.tasks) {
        onToast('数据内容不完整', 'error')
        return
      }
      localStorage.setItem('pvz-study-state', raw)
      onToast('恢复成功！页面即将刷新', 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      onToast('数据解析失败，请检查内容', 'error')
    }
  }

  return (
    <div>
      <button className="btn-primary" style={{ background: 'var(--green)', marginBottom: 10, width: '100%' }} onClick={handleExport}>
        📤 导出数据（复制到剪贴板）
      </button>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
        恢复数据：将之前导出的备份文本粘贴到下方输入框，点击恢复
      </div>
      <textarea
        className="form-input"
        style={{ width: '100%', minHeight: 80, fontSize: 11, marginBottom: 10, resize: 'vertical', fontFamily: 'monospace' }}
        placeholder="在此粘贴备份数据..."
        value={importText}
        onChange={e => setImportText(e.target.value)}
      />
      <button className="btn-primary" style={{ background: 'var(--blue)', width: '100%' }} onClick={handleImport}>
        📥 恢复数据
      </button>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, margin: 'auto 20px', borderRadius: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>确认操作</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{message}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onCancel}>取消</button>
          <button className="btn-primary" style={{ background: 'var(--red)' }} onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>
  )
}

function TaskEditModal({ task, onClose, onSave }: {
  task: Task | null
  onClose: () => void
  onSave: (data: { title: string; subject: Subject; reward: number; deadline: string; requireUpload: boolean; group: TaskGroup; icon: string }) => void
}) {
  const [title, setTitle] = useState(task?.title || '')
  const [subject, setSubject] = useState<Subject>(task?.subject || 'math')
  const [reward, setReward] = useState(task?.reward ?? 30)
  const [deadline, setDeadline] = useState(task?.deadline || '21:00')
  const [requireUpload, setRequireUpload] = useState(task?.requireUpload ?? false)
  const [icon, setIcon] = useState(task?.icon || SUBJECT_CONFIG[subject].icon)

  function onSubjectChange(s: Subject) {
    setSubject(s)
    if (s === 'math') setReward(30)
    else if (s === 'chinese') setReward(25)
    else if (s === 'english') setReward(20)
    else setReward(Math.floor(Math.random() * 8) + 8)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{task ? '编辑任务' : '新建任务'}</div>
        <div className="form-group">
          <label className="form-label">任务名称</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="如：完成数学口算" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">科目分类</label>
            <select className="form-select" value={subject} onChange={e => onSubjectChange(e.target.value as Subject)}>
              <option value="math">数学（30阳光）</option>
              <option value="chinese">语文（25阳光）</option>
              <option value="english">英语（20阳光）</option>
              <option value="sport">运动（8-15阳光）</option>
              <option value="habit">习惯（8-15阳光）</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">截止时间</label>
            <input className="form-input" type="time" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -4, marginBottom: 12 }}>
          科目仅用于任务分组展示，植物解锁按累计阳光值自动解锁
        </div>
        <div className="form-group">
          <label className="form-label">任务图标</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TASK_ICONS.map(ic => (
              <button key={ic.key} onClick={() => setIcon(ic.key)} style={{
                width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${icon === ic.key ? 'var(--green)' : '#e0e0e0'}`,
                background: icon === ic.key ? '#e8f5e9' : '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 2,
              }}>
                <Icon name={ic.key as any} size={22} />
                <span style={{ fontSize: 8, color: 'var(--text-secondary)' }}>{ic.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">阳光奖励</label>
          <input className="form-input" type="number" value={reward} onChange={e => setReward(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <div className="switch-row">
            <span style={{ fontSize: 14, fontWeight: 600 }}>必须拍照/视频上传</span>
            <div className={`switch-track ${requireUpload ? 'on' : ''}`} onClick={() => setRequireUpload(!requireUpload)} />
          </div>
        </div>
        <button className="btn-primary" onClick={() => {
          if (!title.trim()) return
          onSave({ title: title.trim(), subject, reward, deadline, requireUpload, group: SUBJECT_GROUP[subject], icon })
        }}>保存</button>
      </div>
    </div>
  )
}

function WishEditModal({ wish, onClose, onSave }: {
  wish: WishItem | null
  onClose: () => void
  onSave: (data: { title: string; cost: number; icon: string }) => void
}) {
  const [title, setTitle] = useState(wish?.title || '')
  const [cost, setCost] = useState(wish?.cost || 30)
  const [icon, setIcon] = useState(wish?.icon || 'gift')
  const icons = ['gift', 'heart', 'camera', 'trophy', 'star', 'trophy_star', 'sunflower', 'icecream', 'movie', 'rollercoaster', 'tv', 'game', 'badminton', 'drink', 'burger', 'pizza', 'cake', 'donut', 'chocolate', 'popcorn', 'pool', 'bicycle', 'kite', 'puzzle', 'guitar', 'balloon', 'camping']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{wish ? '编辑心愿' : '新增心愿'}</div>
        <div className="form-group">
          <label className="form-label">心愿名称</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="如：30分钟电视时间" />
        </div>
        <div className="form-group">
          <label className="form-label">消耗钻石</label>
          <input className="form-input" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">图标</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {icons.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} style={{
                width: 48, height: 48, borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${icon === ic ? 'var(--green)' : '#e0e0e0'}`,
                background: icon === ic ? '#e8f5e9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Icon name={ic as any} size={28} /></button>
            ))}
          </div>
        </div>
        <button className="btn-primary" style={{ background: 'var(--purple)' }} onClick={() => {
          if (!title.trim()) return
          onSave({ title: title.trim(), cost, icon })
        }}>保存</button>
      </div>
    </div>
  )
}

function BonusModal({ child, onClose, onConfirm }: { child: ChildData; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState(20)
  function adjust(delta: number) {
    setAmount(prev => Math.max(-999, Math.min(999, prev + delta)))
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">补发阳光</div>
        <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          当前阳光：<b style={{ color: '#f9a825', fontSize: 20 }}>{child.sun}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <button className="btn-sm btn-red" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20 }} onClick={() => adjust(-10)}>-10</button>
          <div style={{ width: 100, padding: '8px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{amount > 0 ? '+' : ''}{amount}</div>
          </div>
          <button className="btn-sm btn-green" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20 }} onClick={() => adjust(10)}>+10</button>
        </div>
        <button className="btn-primary" style={{ background: 'var(--orange)' }} onClick={() => onConfirm(amount)}>确认</button>
      </div>
    </div>
  )
}

function DiamondBonusModal({ child, onClose, onConfirm }: { child: ChildData; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState(20)
  function adjust(delta: number) {
    setAmount(prev => Math.max(-999, Math.min(999, prev + delta)))
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">补发钻石</div>
        <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          当前钻石：<b style={{ color: '#29b6f6', fontSize: 20 }}>{child.diamonds}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <button className="btn-sm btn-red" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20 }} onClick={() => adjust(-10)}>-10</button>
          <div style={{ width: 100, padding: '8px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{amount > 0 ? '+' : ''}{amount}</div>
          </div>
          <button className="btn-sm btn-green" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20 }} onClick={() => adjust(10)}>+10</button>
        </div>
        <button className="btn-primary" style={{ background: 'var(--blue)' }} onClick={() => onConfirm(amount)}>确认</button>
      </div>
    </div>
  )
}

function RestoreModal({ child, plants, onClose, onConfirm }: { child: ChildData; plants: PlantDef[]; onClose: () => void; onConfirm: (defId: string) => void }) {
  const owned = plants.filter(p => child.unlockedPlants.includes(p.id))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">恢复被损毁植物</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          当前花园 {child.garden.length}/12
        </div>
        {child.garden.length >= 12 && <div style={{ color: 'var(--red)', marginBottom: 12 }}>花园已满</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {owned.map(p => (
            <button key={p.id} className="btn-secondary" style={{ padding: 10, fontSize: 12 }}
              disabled={child.garden.length >= 12}
              onClick={() => onConfirm(p.id)}>
              <div style={{ width: 36, height: 36, margin: '0 auto 4px' }}><Icon name={p.icon as any} size={36} /></div>
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlantEditModal({ plant, onClose, onSave }: {
  plant: PlantDef | null
  onClose: () => void
  onSave: (data: Omit<PlantDef, 'id'>) => void
}) {
  const [name, setName] = useState(plant?.name || '')
  const [icon, setIcon] = useState(plant?.icon || 'sunflower')
  const [tier, setTier] = useState<PlantDef['tier']>(plant?.tier || 'low')
  const [cost, setCost] = useState(plant?.cost ?? 50)
  const [sellPrice, setSellPrice] = useState(plant?.sellPrice ?? 15)
  const [desc, setDesc] = useState(plant?.desc || '')
  const [category, setCategory] = useState<PlantDef['category']>(plant?.category || 'sun')
  const [unlockSun, setUnlockSun] = useState(plant?.unlockSun ?? 0)

  const iconOptions = ['sunflower', 'peashooter', 'snowpea', 'wallnut', 'twinshootsunflower', 'repeater', 'tallnut', 'corncob', 'leaf', 'star', 'heart', 'gift']
  const tierOptions: PlantDef['tier'][] = ['low', 'mid', 'high', 'rare']
  const tierLabels: Record<string, string> = { low: '低级', mid: '中级', high: '高级', rare: '稀有' }
  const categoryOptions: PlantDef['category'][] = ['sun', 'attack', 'defense', 'rare']
  const categoryLabels: Record<string, string> = { sun: '阳光', attack: '攻击', defense: '防御', rare: '稀有' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{plant ? '编辑植物' : '新增植物'}</div>
        <div className="form-group">
          <label className="form-label">植物名称</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="如：向日葵" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">等级</label>
            <select className="form-select" value={tier} onChange={e => setTier(e.target.value as PlantDef['tier'])}>
              {tierOptions.map(t => <option key={t} value={t}>{tierLabels[t]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">类型</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as PlantDef['category'])}>
              {categoryOptions.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">种植消耗阳光</label>
            <input className="form-input" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">出售获得钻石</label>
            <input className="form-input" type="number" value={sellPrice} onChange={e => setSellPrice(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">解锁所需累计阳光</label>
          <input className="form-input" type="number" value={unlockSun} onChange={e => setUnlockSun(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="植物描述" />
        </div>
        <div className="form-group">
          <label className="form-label">图标</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {iconOptions.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} style={{
                width: 48, height: 48, borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${icon === ic ? 'var(--green)' : '#e0e0e0'}`,
                background: icon === ic ? '#e8f5e9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Icon name={ic as any} size={28} /></button>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={() => {
          if (!name.trim()) return
          onSave({ name: name.trim(), icon, tier, cost, sellPrice, desc, category, unlockSun })
        }}>保存</button>
      </div>
    </div>
  )
}
