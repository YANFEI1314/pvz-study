import type { AppState, ChildData, Task, WishItem } from './types'
import { SUBJECT_CONFIG, DEFAULT_PLANTS } from './data'

const STORAGE_KEY = 'pvz-study-state-v1'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function createDefaultChild(id: string, name: string, grade: string, icon: string): ChildData {
  return {
    id,
    name,
    grade,
    icon,
    sun: 50,
    diamonds: 50,
    garden: [{ uid: `g_${id}_init`, defId: 'sunflower', plantedAt: Date.now() }],
    unlockedPlants: ['sunflower'],
    perfectDays: 0,
    totalPerfectDays: 0,
    totalSunEarned: 50,
  }
}

function createDefaultTasks(childId: string): Task[] {
  const now = Date.now()
  const date = todayStr()
  const base = (overrides: Partial<Task>): Task => ({
    id: `t_${childId}_${Math.random().toString(36).slice(2, 9)}`,
    childId,
    title: '',
    subject: 'math',
    group: 'study',
    reward: SUBJECT_CONFIG.math.reward,
    deadline: '21:00',
    requireUpload: false,
    status: 'pending',
    createdAt: now,
    date,
    ...overrides,
  })
  return [
    base({ title: '完成数学口算练习', subject: 'math', group: 'study', reward: 30, deadline: '23:30', requireUpload: true, icon: 'math_icon' }),
    base({ title: '朗读语文课文', subject: 'chinese', group: 'study', reward: 25, deadline: '23:45', requireUpload: true, icon: 'reading' }),
    base({ title: '背诵英语单词', subject: 'english', group: 'study', reward: 20, deadline: '23:59', requireUpload: false, icon: 'english' }),
    base({ title: '整理书包书桌', subject: 'habit', group: 'life', reward: 10, deadline: '23:00', requireUpload: false, icon: 'broom' }),
    base({ title: '跳绳100下', subject: 'sport', group: 'sport', reward: 12, deadline: '22:30', requireUpload: false, icon: 'ball' }),
  ]
}

function createDefaultWishes(childId: string): WishItem[] {
  const base = (title: string, cost: number, icon: string): WishItem => ({
    id: `w_${childId}_${Math.random().toString(36).slice(2, 9)}`,
    childId,
    title,
    cost,
    icon,
  })
  return [
    base('30分钟电视时间', 30, 'camera'),
    base('一个冰淇淋', 50, 'gift'),
    base('超市选购物品', 80, 'gift'),
    base('周末游乐园', 200, 'heart'),
  ]
}

export function createInitialState(): AppState {
  const child1 = createDefaultChild('c_grade2', '小绿', '二年级', 'boy')
  const child2 = createDefaultChild('c_grade8', '小葵', '初二', 'girl')
  return {
    children: [child1, child2],
    currentChildId: 'c_grade2',
    tasks: [...createDefaultTasks('c_grade2'), ...createDefaultTasks('c_grade8')],
    wishes: [...createDefaultWishes('c_grade2'), ...createDefaultWishes('c_grade8')],
    exchanges: [],
    lastRefreshDate: todayStr(),
    parentPassword: '1234',
    plants: DEFAULT_PLANTS,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const init = createInitialState()
      saveState(init)
      return init
    }
    const parsed = JSON.parse(raw) as AppState
    // 数据迁移：补全 totalSunEarned（老数据没有此字段）
    for (const child of parsed.children) {
      if (child.totalSunEarned === undefined) {
        child.totalSunEarned = child.sun
      }
    }
    // 数据迁移：coins → diamonds（老数据用 coins，新数据用 diamonds）
    for (const child of parsed.children) {
      if (child.diamonds === undefined) {
        child.diamonds = (child as any).coins || 0
      }
    }
    // 数据迁移：补全 plants（老数据没有此字段）
    if (!parsed.plants || parsed.plants.length === 0) {
      parsed.plants = DEFAULT_PLANTS
    }
    return parsed
  } catch {
    const init = createInitialState()
    saveState(init)
    return init
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetState(): AppState {
  const init = createInitialState()
  saveState(init)
  return init
}

// ====== 日期刷新与逾期/惩罚结算 ======
// 检查是否跨天，如跨天则执行当日任务刷新与惩罚结算
export function refreshDailyIfNeeded(state: AppState): AppState {
  const today = todayStr()
  if (state.lastRefreshDate === today) return state

  const newState: AppState = { ...state, lastRefreshDate: today }

  // 对每个孩子结算昨日惩罚
  for (const child of newState.children) {
    const yesterdayTasks = newState.tasks.filter(
      t => t.childId === child.id && t.date === state.lastRefreshDate
    )
    const allDone = yesterdayTasks.length > 0 && yesterdayTasks.every(t => t.status === 'approved')
    const anyOverdue = yesterdayTasks.some(t => t.status === 'overdue' || (t.status !== 'approved' && isOverdue(t)))

    // 标记昨日未完成的为逾期
    newState.tasks = newState.tasks.map(t => {
      if (t.childId === child.id && t.date === state.lastRefreshDate && t.status !== 'approved') {
        return { ...t, status: 'overdue' as const }
      }
      return t
    })

    if (allDone) {
      // 连续按时完成
      child.perfectDays += 1
      child.totalPerfectDays += 1
      if (child.perfectDays >= 3 && !child.unlockedPlants.includes('corncob')) {
        child.unlockedPlants.push('corncob')
      }
    } else {
      // 有未完成的 -> 惩罚
      child.perfectDays = 0
      if (anyOverdue) {
        // 普通僵尸：吃1株植物或扣40阳光
        applyZombieAttack(newState, child.id, 'normal')
        // 如果当日全部未完成 -> 铁桶僵尸
        const noneDone = yesterdayTasks.every(t => t.status !== 'approved')
        if (noneDone) {
          applyZombieAttack(newState, child.id, 'bucket')
        }
      } else if (yesterdayTasks.every(t => t.status !== 'approved')) {
        applyZombieAttack(newState, child.id, 'bucket')
      }
    }
  }

  // 刷新当日任务：将默认任务模板复制到今天（保留家长自定义的也复制？这里简单处理：把昨日的模板任务复制到今天，状态重置）
  // 更合理：清空过期任务显示，新建一份今日默认任务
  const todayTasks: Task[] = []
  for (const child of newState.children) {
    // 取该孩子最近一天的任务作为模板，复制到今天
    const templates = newState.tasks.filter(t => t.childId === child.id && t.date === state.lastRefreshDate)
    for (const t of templates) {
      todayTasks.push({
        ...t,
        id: `t_${child.id}_${Math.random().toString(36).slice(2, 9)}`,
        status: 'pending',
        submittedAt: undefined,
        approvedAt: undefined,
        material: undefined,
        createdAt: Date.now(),
        date: today,
      })
    }
  }
  newState.tasks = [...newState.tasks, ...todayTasks]

  saveState(newState)
  return newState
}

export function isOverdue(task: Task): boolean {
  if (task.status === 'approved' || task.status === 'overdue') return false
  const now = new Date()
  const [h, m] = task.deadline.split(':').map(Number)
  const deadline = new Date()
  deadline.setHours(h, m, 0, 0)
  return now.getTime() > deadline.getTime() && task.date === formatDate(now)
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 僵尸攻击：type=normal 吃1株/扣40阳光；type=bucket 吞噬2株
function applyZombieAttack(state: AppState, childId: string, type: 'normal' | 'bucket') {
  const child = state.children.find(c => c.id === childId)
  if (!child) return
  const eatCount = type === 'bucket' ? 2 : 1
  const eaten: string[] = []
  for (let i = 0; i < eatCount && child.garden.length > 0; i++) {
    const idx = Math.floor(Math.random() * child.garden.length)
    eaten.push(child.garden[idx].uid)
    child.garden.splice(idx, 1)
  }
  // 普通僵尸若没吃到植物则扣40阳光
  if (type === 'normal' && eaten.length === 0) {
    child.sun = Math.max(0, child.sun - 40)
  }
  // 记录到全局事件（简单存入 exchanges 作为日志？不行，单独存）
  state._zombieLog = state._zombieLog || []
  state._zombieLog.push({
    childId, type, eaten, time: Date.now(),
    sunLost: type === 'normal' && eaten.length === 0 ? 40 : 0,
  })
}

// 给 AppState 扩展一个临时僵尸日志（不入类型，运行时存在）
declare module './types' {
  interface AppState {
    _zombieLog?: Array<{ childId: string; type: string; eaten: string[]; time: number; sunLost: number }>
  }
}
