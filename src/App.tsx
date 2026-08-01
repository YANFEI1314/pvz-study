import { useState, useEffect, useCallback } from 'react'
import type { AppState, Task, WishItem, ChildData, Subject, TaskGroup, PlantDef } from './types'
import { loadState, saveState, refreshDailyIfNeeded, isOverdue, formatDate } from './store'
import { SUBJECT_CONFIG, getUnlockedPlantsBySun, buildPlantMap } from './data'
import { Sidebar, type Page } from './Sidebar'
import { TasksPage } from './TasksPage'
import { GardenPage } from './GardenPage'
import { ShopPage } from './ShopPage'
import { WishPage } from './WishPage'
import { ParentPage } from './ParentPage'
import { ToastContainer, type ToastMsg } from './components'

export default function App() {
  const [state, setState] = useState<AppState>(() => refreshDailyIfNeeded(loadState()))
  const [page, setPage] = useState<Page>('tasks')
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const currentChild = state.children.find(c => c.id === state.currentChildId)!
  const plantMap = buildPlantMap(state.plants)
  const todayStr = formatDate(new Date())

  // 持久化
  useEffect(() => { saveState(state) }, [state])

  // 实时检测任务逾期并触发僵尸惩罚
  useEffect(() => {
    const checkOverdue = () => {
      setState(s => {
        let changed = false
        const newChildren = s.children.map(c => ({ ...c }))
        const newTasks = s.tasks.map(t => {
          if (t.status === 'pending' && t.date === todayStr) {
            const [h, m] = t.deadline.split(':').map(Number)
            const now = new Date()
            const dl = new Date()
            dl.setHours(h, m, 0, 0)
            if (now.getTime() > dl.getTime()) {
              changed = true
              return { ...t, status: 'overdue' as const }
            }
          }
          return t
        })
        if (!changed) return s

        // 对每个孩子检查是否需要触发僵尸
        for (const child of newChildren) {
          const childTasks = newTasks.filter(t => t.childId === child.id && t.date === todayStr)
          const overdueCount = childTasks.filter(t => t.status === 'overdue').length
          const allOverdue = childTasks.length > 0 && childTasks.every(t => t.status === 'overdue')
          const anyOverdue = overdueCount > 0

          // 检查是否已经触发过（避免重复触发）
          const alreadyTriggered = (s._zombieLog || []).some(
            l => l.childId === child.id && new Date(l.time).toDateString() === new Date().toDateString()
          )
          if (alreadyTriggered) continue

          if (allOverdue) {
            // 全部逾期 → 铁桶僵尸
            applyZombieAttackLocal(child, 'bucket')
            changed = true
          } else if (anyOverdue) {
            // 有逾期 → 普通僵尸
            applyZombieAttackLocal(child, 'normal')
            changed = true
          }
        }

        if (changed) {
          const zombieLog = [...(s._zombieLog || [])]
          for (const child of newChildren) {
            const childTasks = newTasks.filter(t => t.childId === child.id && t.date === todayStr)
            const allOverdue = childTasks.length > 0 && childTasks.every(t => t.status === 'overdue')
            const anyOverdue = childTasks.some(t => t.status === 'overdue')
            const alreadyTriggered = (s._zombieLog || []).some(
              l => l.childId === child.id && new Date(l.time).toDateString() === new Date().toDateString()
            )
            if (!alreadyTriggered && allOverdue) {
              const result = applyZombieAttackLocal(child, 'bucket')
              zombieLog.push({ childId: child.id, type: 'bucket', eaten: result.eaten, time: Date.now(), sunLost: result.sunLost })
            } else if (!alreadyTriggered && anyOverdue) {
              const result = applyZombieAttackLocal(child, 'normal')
              zombieLog.push({ childId: child.id, type: 'normal', eaten: result.eaten, time: Date.now(), sunLost: result.sunLost })
            }
          }
          return { ...s, tasks: newTasks, children: newChildren, _zombieLog: zombieLog }
        }
        return { ...s, tasks: newTasks }
      })
    }

    const timer = setInterval(checkOverdue, 5000)
    return () => clearInterval(timer)
  }, [todayStr])

  // 本地僵尸攻击函数（返回被吃的植物列表和阳光损失）
  function applyZombieAttackLocal(child: ChildData, type: 'normal' | 'bucket'): { eaten: string[]; sunLost: number } {
    const eatCount = type === 'bucket' ? 2 : 1
    const eaten: string[] = []
    for (let i = 0; i < eatCount && child.garden.length > 0; i++) {
      const idx = Math.floor(Math.random() * child.garden.length)
      eaten.push(child.garden[idx].uid)
      child.garden.splice(idx, 1)
    }
    let sunLost = 0
    if (type === 'normal' && eaten.length === 0) {
      child.sun = Math.max(0, child.sun - 40)
      sunLost = 40
    }
    return { eaten, sunLost }
  }

  // Toast
  const toast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  // 切换子女
  function switchChild(id: string) {
    setState(s => ({ ...s, currentChildId: id }))
    setPage('tasks')
  }

  // ====== 家长端：编辑孩子基础信息 ======
  function updateChild(childId: string, patch: { name?: string; grade?: string; icon?: string; learningStart?: string; learningEnd?: string }) {
    setState(s => ({
      ...s,
      children: s.children.map(c =>
        c.id === childId ? { ...c, ...patch } : c
      ),
    }))
    toast('孩子信息已更新 ✏️', 'success')
  }

  // ====== 僵尸进度条扣阳光回调 ======
  function deductSun(childId: string, amount: number, reason: string) {
    setState(s => {
      const child = s.children.find(c => c.id === childId)
      if (!child) return s
      child.sun = Math.max(0, child.sun - amount)
      return {
        ...s,
        children: s.children.map(c => c.id === childId ? { ...child } : c),
      }
    })
    toast(`🧟 ${reason}，扣除 ${amount} 阳光`, 'error')
  }

  // ====== 任务提交（即时生效，无需家长审核） ======
  function submitTask(task: Task, material?: string) {
    setState(s => {
      const child = s.children.find(c => c.id === task.childId)!
      // 直接发放阳光
      child.sun += task.reward
      // 累计获得阳光（用于植物解锁判定）
      child.totalSunEarned += task.reward
      // 根据累计阳光值解锁植物
      const unlockedBySun = getUnlockedPlantsBySun(s.plants, child.totalSunEarned)
      const newUnlocked = [...child.unlockedPlants]
      for (const p of unlockedBySun) {
        if (!newUnlocked.includes(p.id)) {
          newUnlocked.push(p.id)
        }
      }
      child.unlockedPlants = newUnlocked

      const newTasks = s.tasks.map(t =>
        t.id === task.id
          ? { ...t, status: 'approved' as const, submittedAt: Date.now(), approvedAt: Date.now(), material: material || t.material }
          : t
      )
      const newChildren = s.children.map(c => c.id === child.id ? { ...child } : c)
      return { ...s, tasks: newTasks, children: newChildren }
    })
  }

  // ====== 家长审核：通过 ======
  function approveTask(task: Task) {
    setState(s => {
      const child = s.children.find(c => c.id === task.childId)!
      // 发放阳光
      child.sun += task.reward
      // 累计获得阳光（用于植物解锁判定）
      child.totalSunEarned += task.reward
      // 根据累计阳光值解锁植物
      const unlockedBySun = getUnlockedPlantsBySun(s.plants, child.totalSunEarned)
      const newUnlocked = [...child.unlockedPlants]
      for (const p of unlockedBySun) {
        if (!newUnlocked.includes(p.id)) {
          newUnlocked.push(p.id)
        }
      }
      child.unlockedPlants = newUnlocked

      const newTasks = s.tasks.map(t =>
        t.id === task.id ? { ...t, status: 'approved' as const, approvedAt: Date.now() } : t
      )
      // 更新 children
      const newChildren = s.children.map(c => c.id === child.id ? { ...child } : c)

      // 检查当日是否全部按时完成 -> 连续全勤
      const todayTasks = newTasks.filter(t => t.childId === child.id && t.date === task.date)
      const allApproved = todayTasks.length > 0 && todayTasks.every(t => t.status === 'approved')
      if (allApproved) {
        // 不在这里加 perfectDays，在每日刷新时加（避免重复）
      }

      return { ...s, tasks: newTasks, children: newChildren }
    })
    toast(`审核通过！+${task.reward}阳光 🎉`, 'success')
  }

  // ====== 家长审核：驳回 ======
  function rejectTask(task: Task) {
    setState(s => {
      const newTasks = s.tasks.map(t =>
        t.id === task.id ? { ...t, status: 'pending' as const, material: undefined } : t
      )
      return { ...s, tasks: newTasks }
    })
    toast('任务已驳回，需重新提交', 'error')
  }

  // ====== 家长任务 CRUD ======
  function addTask(childId: string, data: { title: string; subject: Subject; reward: number; deadline: string; requireUpload: boolean; group: TaskGroup; icon?: string }) {
    setState(s => {
      const newTask: Task = {
        id: `t_${childId}_${Math.random().toString(36).slice(2, 9)}`,
        childId,
        ...data,
        status: 'pending',
        createdAt: Date.now(),
        date: todayStr,
      }
      return { ...s, tasks: [...s.tasks, newTask] }
    })
    toast('任务已新建 📋', 'success')
  }

  function editTask(id: string, patch: Partial<Task>) {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t),
    }))
    toast('任务已更新 ✏️', 'success')
  }

  function deleteTask(id: string) {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
    toast('任务已删除 🗑️', 'info')
  }

  // ====== 花园：种植/出售 ======
  function plantInGarden(defId: string) {
    const plant = plantMap[defId]
    if (!plant) { toast('植物不存在', 'error'); return }
    setState(s => {
      const child = s.children.find(c => c.id === s.currentChildId)!
      if (child.sun < plant.cost) { toast('阳光不足！', 'error'); return s }
      if (child.garden.length >= 12) { toast('花园已满！', 'error'); return s }
      if (!child.unlockedPlants.includes(defId)) { toast('该植物尚未解锁', 'error'); return s }

      const updatedChild = {
        ...child,
        sun: child.sun - plant.cost,
        garden: [...child.garden, { uid: `g_${Date.now()}`, defId, plantedAt: Date.now() }],
      }
      return {
        ...s,
        children: s.children.map(c => c.id === child.id ? updatedChild : c),
      }
    })
    toast(`已种植 ${plant.name}！消耗 ${plant.cost} 阳光 🌱`, 'success')
  }

  function sellPlant(uid: string) {
    setState(s => {
      const child = s.children.find(c => c.id === s.currentChildId)!
      const plant = child.garden.find(p => p.uid === uid)
      if (!plant) return s
      const def = plantMap[plant.defId]
      if (!def) return s
      const updatedChild = {
        ...child,
        diamonds: child.diamonds + def.sellPrice,
        garden: child.garden.filter(p => p.uid !== uid),
      }
      return {
        ...s,
        children: s.children.map(c => c.id === child.id ? updatedChild : c),
      }
    })
    const child = state.children.find(c => c.id === state.currentChildId)!
    const plant = child.garden.find(p => p.uid === uid)
    if (plant) {
      const def = plantMap[plant.defId]
      if (def) {
        toast(`已出售 ${def.name}！获得 ${def.sellPrice} 钻石 💰`, 'success')
      }
    }
  }

  // ====== 心愿兑换（直接完成，无需审核） ======
  function exchangeWish(wish: WishItem) {
    setState(s => {
      const child = s.children.find(c => c.id === s.currentChildId)!
      if (child.diamonds < wish.cost) { toast('钻石不足！', 'error'); return s }
      // 扣除钻石，直接完成兑换
      const updatedChild = { ...child, diamonds: child.diamonds - wish.cost }
      const exchange = {
        id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        childId: child.id,
        wishId: wish.id,
        wishTitle: wish.title,
        cost: wish.cost,
        status: 'approved' as const,
        createdAt: Date.now(),
      }
      return {
        ...s,
        children: s.children.map(c => c.id === child.id ? updatedChild : c),
        exchanges: [...s.exchanges, exchange],
      }
    })
    toast(`兑换成功！消耗 ${wish.cost} 钻石 🎁`, 'success')
  }

  // ====== 家长心愿 CRUD ======
  function addWish(childId: string, data: { title: string; cost: number; icon: string }) {
    setState(s => {
      const newWish: WishItem = {
        id: `w_${childId}_${Math.random().toString(36).slice(2, 9)}`,
        childId,
        ...data,
      }
      return { ...s, wishes: [...s.wishes, newWish] }
    })
    toast('心愿已新增 🎁', 'success')
  }
  function editWish(id: string, patch: Partial<WishItem>) {
    setState(s => ({ ...s, wishes: s.wishes.map(w => w.id === id ? { ...w, ...patch } : w) }))
    toast('心愿已更新 ✏️', 'success')
  }
  function deleteWish(id: string) {
    setState(s => ({ ...s, wishes: s.wishes.filter(w => w.id !== id) }))
    toast('心愿已删除 🗑️', 'info')
  }

  // ====== 家长撤销心愿兑换（退还钻石） ======
  function revokeWish(exId: string) {
    setState(s => {
      const ex = s.exchanges.find(e => e.id === exId)
      if (!ex) return s
      // 退还钻石
      const child = s.children.find(c => c.id === ex.childId)!
      const updatedChild = { ...child, diamonds: child.diamonds + ex.cost }
      return {
        ...s,
        children: s.children.map(c => c.id === child.id ? updatedChild : c),
        exchanges: s.exchanges.map(e => e.id === exId ? { ...e, status: 'rejected' as const } : e),
      }
    })
    toast('兑换已撤销，钻石已退还', 'info')
  }

  // ====== 补发阳光 / 补发钻石 / 恢复植物 ======
  function bonusSun(childId: string, amount: number) {
    setState(s => {
      const child = s.children.find(c => c.id === childId)!
      const updatedChild = { ...child, sun: Math.max(0, child.sun + amount) }
      return { ...s, children: s.children.map(c => c.id === childId ? updatedChild : c) }
    })
    toast(`已${amount >= 0 ? '补发' : '扣除'} ${Math.abs(amount)} 阳光 ☀️`, 'success')
  }

  function bonusDiamond(childId: string, amount: number) {
    setState(s => {
      const child = s.children.find(c => c.id === childId)!
      const updatedChild = { ...child, diamonds: Math.max(0, child.diamonds + amount) }
      return { ...s, children: s.children.map(c => c.id === childId ? updatedChild : c) }
    })
    toast(`已${amount >= 0 ? '补发' : '扣除'} ${Math.abs(amount)} 钻石 💎`, 'success')
  }

  function restorePlant(childId: string, defId: string) {
    const def = plantMap[defId]
    if (!def) { toast('植物不存在', 'error'); return }
    setState(s => {
      const child = s.children.find(c => c.id === childId)!
      if (child.garden.length >= 12) { toast('花园已满！', 'error'); return s }
      const updatedChild = {
        ...child,
        garden: [...child.garden, { uid: `g_${Date.now()}`, defId, plantedAt: Date.now() }],
      }
      return { ...s, children: s.children.map(c => c.id === childId ? updatedChild : c) }
    })
    toast(`已恢复 ${def.name} 🌱`, 'success')
  }

  // ====== 家长端：植物管理 CRUD ======
  function addPlant(data: Omit<PlantDef, 'id'>) {
    const id = `plant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setState(s => ({
      ...s,
      plants: [...s.plants, { ...data, id }],
    }))
    toast('植物已新增 🌱', 'success')
  }

  function editPlant(id: string, patch: Partial<PlantDef>) {
    setState(s => ({
      ...s,
      plants: s.plants.map(p => p.id === id ? { ...p, ...patch } : p),
    }))
    toast('植物已更新 ✏️', 'success')
  }

  function deletePlant(id: string) {
    setState(s => ({
      ...s,
      plants: s.plants.filter(p => p.id !== id),
    }))
    toast('植物已删除 🗑️', 'info')
  }

  // ====== 修改家长密码 ======
  function changePassword(newPassword: string) {
    setState(s => ({ ...s, parentPassword: newPassword }))
    toast('密码已更新 🔑', 'success')
  }

  // 今日待完成���务数（用于侧边栏 badge）
  const pendingCount = state.tasks
    .filter(t => t.childId === currentChild.id && t.date === todayStr && t.status === 'pending' && !isOverdue(t))
    .length

  // 退出家长端
  function exitParent() {
    setPage('tasks')
  }

  return (
    <div className="app-layout">
      <Sidebar
        state={state}
        currentChild={currentChild}
        page={page}
        pendingCount={pendingCount}
        onSwitchChild={switchChild}
        onNavigate={setPage}
      />
      <div className="main-area">
        {page === 'tasks' && (
          <TasksPage
            child={currentChild}
            tasks={state.tasks}
            todayStr={todayStr}
            onSubmit={submitTask}
            onSunDeduct={deductSun}
            onToast={toast}
          />
        )}
        {page === 'garden' && (
          <GardenPage child={currentChild} plants={state.plants} onSellPlant={sellPlant} />
        )}
        {page === 'shop' && (
          <ShopPage child={currentChild} plants={state.plants} onPlant={plantInGarden} onToast={toast} />
        )}
        {page === 'wish' && (
          <WishPage
            child={currentChild}
            wishes={state.wishes}
            exchanges={state.exchanges}
            onExchange={exchangeWish}
            onToast={toast}
          />
        )}
        {page === 'parent' && (
          <ParentPage
            state={state}
            currentChild={currentChild}
            todayStr={todayStr}
            onAddTask={addTask}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
            onApproveTask={approveTask}
            onRejectTask={rejectTask}
            onAddWish={addWish}
            onEditWish={editWish}
            onDeleteWish={deleteWish}
            onRevokeWish={revokeWish}
            onBonusSun={bonusSun}
            onBonusDiamond={bonusDiamond}
            onRestorePlant={restorePlant}
            onUpdateChild={updateChild}
            onChangePassword={changePassword}
            onAddPlant={addPlant}
            onEditPlant={editPlant}
            onDeletePlant={deletePlant}
            onExit={exitParent}
            onToast={toast}
          />
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
