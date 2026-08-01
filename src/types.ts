// ====== 类型定义 ======

export type Subject = 'math' | 'chinese' | 'english' | 'sport' | 'habit'
export type TaskGroup = 'study' | 'life' | 'sport'

/** 四大分类（任务栏展示用） */
export type TaskCategory = 'math' | 'chinese' | 'english' | 'other'
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'overdue'
export type PlantTier = 'low' | 'mid' | 'high' | 'rare'

export interface PlantDef {
  id: string
  name: string
  icon: string  // icons.tsx 中的 SVG key
  tier: PlantTier
  cost: number        // 种植消耗阳光
  sellPrice: number   // 出售获得钻石
  desc: string
  category: 'attack' | 'defense' | 'sun' | 'rare'
  subject?: Subject   // 仅用于任务分组展示，不再用于植物解锁
  unlockSun: number   // 解锁所需累计阳光阈值
}

export interface GardenPlant {
  uid: string         // 花园内实例 id
  defId: string       // 对应 PlantDef.id
  plantedAt: number
}

export interface Task {
  id: string
  childId: string
  title: string
  subject: Subject
  group: TaskGroup
  reward: number
  deadline: string    // HH:mm
  requireUpload: boolean
  status: TaskStatus
  icon?: string       // 自定义任务图标（emoji key），无则用科目默认图标
  submittedAt?: number
  approvedAt?: number
  material?: string   // dataURL 照片/视频
  createdAt: number
  date: string        // YYYY-MM-DD 任务所属日期
}

export interface WishItem {
  id: string
  childId: string
  title: string
  cost: number
  icon: string   // icons.tsx 中的 SVG key
}

export interface WishExchange {
  id: string
  childId: string
  wishId: string
  wishTitle: string
  cost: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
}

export interface ChildData {
  id: string
  name: string
  grade: string
  icon: string   // icons.tsx 中的 SVG key
  sun: number
  diamonds: number    // 钻石（出售植物获得，用于心愿兑换）
  garden: GardenPlant[]
  unlockedPlants: string[]  // 已解锁的植物 defId
  perfectDays: number       // 连续按时完成天数
  totalPerfectDays: number
  totalSunEarned: number    // 累计获得的阳光总量（用于植物解锁判定）
  learningStart?: string    // HH:mm，全局学习开始时间（默认 10:00）
  learningEnd?: string      // HH:mm，全局学习结束时间（默认 22:00）
}

export interface AppState {
  children: ChildData[]
  currentChildId: string
  tasks: Task[]
  wishes: WishItem[]
  exchanges: WishExchange[]
  lastRefreshDate: string
  parentPassword?: string  // 家长端密码，默认 '1234'
  plants: PlantDef[]       // 植物图鉴（可由家长端管理）
}
