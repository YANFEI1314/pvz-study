import type { PlantDef, Subject, TaskGroup, TaskCategory } from './types'

// ====== 四大分类配置（任务栏展示） ======
export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: string; emoji: string }> = {
  math:    { label: '数学', icon: 'math_icon', emoji: '📐' },
  chinese: { label: '语文', icon: 'reading', emoji: '📚' },
  english: { label: '英语', icon: 'english', emoji: '🔡' },
  other:   { label: '其他', icon: 'star', emoji: '🔍' },
}

// Subject → TaskCategory 映射
export function subjectToCategory(s: Subject): TaskCategory {
  if (s === 'math') return 'math'
  if (s === 'chinese') return 'chinese'
  if (s === 'english') return 'english'
  return 'other'
}

// ====== 默认植物图鉴（用于初始化状态） ======
export const DEFAULT_PLANTS: PlantDef[] = [
  // 低级
  { id: 'sunflower', name: '向日葵', icon: 'sunflower', tier: 'low', cost: 50, sellPrice: 15, desc: '产生阳光的基础植物', category: 'sun', subject: 'english', unlockSun: 0 },
  { id: 'peashooter', name: '豌豆射手', icon: 'peashooter', tier: 'low', cost: 50, sellPrice: 15, desc: '基础攻击植物', category: 'attack', subject: 'math', unlockSun: 50 },
  // 中级
  { id: 'snowpea', name: '寒冰射手', icon: 'snowpea', tier: 'mid', cost: 100, sellPrice: 35, desc: '冰冻减速僵尸', category: 'attack', subject: 'math', unlockSun: 150 },
  { id: 'wallnut', name: '坚果', icon: 'wallnut', tier: 'mid', cost: 100, sellPrice: 35, desc: '坚固的防御植物', category: 'defense', subject: 'chinese', unlockSun: 150 },
  { id: 'twinshootsunflower', name: '双子向日葵', icon: 'twinshootsunflower', tier: 'mid', cost: 100, sellPrice: 35, desc: '产生双倍阳光', category: 'sun', subject: 'english', unlockSun: 300 },
  // 高级
  { id: 'repeater', name: '双重射手', icon: 'repeater', tier: 'high', cost: 175, sellPrice: 60, desc: '连发两颗豌豆', category: 'attack', subject: 'math', unlockSun: 500 },
  { id: 'tallnut', name: '高坚果', icon: 'tallnut', tier: 'high', cost: 175, sellPrice: 60, desc: '超高防御屏障', category: 'defense', subject: 'chinese', unlockSun: 500 },
  // 稀有
  { id: 'corncob', name: '玉米加农炮', icon: 'corncob', tier: 'rare', cost: 325, sellPrice: 110, desc: '累计阳光达到800或连3天全勤解锁的稀有植物', category: 'rare', unlockSun: 800 },
]

// 兼容：PLANTS 指向 DEFAULT_PLANTS（旧代码引用）
export const PLANTS = DEFAULT_PLANTS

// 根据植物数组生成映射表
export function buildPlantMap(plants: PlantDef[]): Record<string, PlantDef> {
  return Object.fromEntries(plants.map(p => [p.id, p]))
}

// 兼容：默认映射表
export const PLANT_MAP: Record<string, PlantDef> = buildPlantMap(DEFAULT_PLANTS)

// ====== 科目配置 ======
export const SUBJECT_CONFIG: Record<Subject, { label: string; icon: string; reward: number; unlockCategory: string }> = {
  math:    { label: '数学', icon: 'math_icon', reward: 30, unlockCategory: '学习任务' },
  chinese: { label: '语文', icon: 'reading', reward: 25, unlockCategory: '学习任务' },
  english: { label: '英语', icon: 'english', reward: 20, unlockCategory: '学习任务' },
  habit:   { label: '习惯', icon: 'broom', reward: 10, unlockCategory: '生活习惯' },
  other:   { label: '其他', icon: 'star', reward: 10, unlockCategory: '其他任务' },
}

// 科目到任务分组映射
export const SUBJECT_GROUP: Record<Subject, TaskGroup> = {
  math: 'study',
  chinese: 'study',
  english: 'study',
  habit: 'life',
  other: 'other',
}

export const GROUP_CONFIG: Record<TaskGroup, { label: string; icon: string; desc: string }> = {
  study: { label: '好好学习', icon: 'book', desc: '语数英学习任务' },
  life:  { label: '生活好习惯', icon: 'broom', desc: '日常好习惯养成' },
  other: { label: '其他任务', icon: 'star', desc: '其他类型任务' },
}

// 任务可选图标列表（供家长端编辑任务时选择）
export const TASK_ICONS: Array<{ key: string; label: string }> = [
  { key: 'reading', label: '诵读' },
  { key: 'pencil', label: '作业' },
  { key: 'math_icon', label: '数学' },
  { key: 'english', label: '英语' },
  { key: 'writing', label: '写字' },
  { key: 'music', label: '乐器' },
  { key: 'art', label: '绘画' },
  { key: 'computer', label: '编程' },
  { key: 'book', label: '阅读' },
  { key: 'ball', label: '运动' },
  { key: 'broom', label: '家务' },
  { key: 'star', label: '习惯' },
]

// 根据累计阳光值返回已解锁的植物列表（使用传入的植物数组）
export function getUnlockedPlantsBySun(plants: PlantDef[], totalSunEarned: number): PlantDef[] {
  return plants.filter(p => totalSunEarned >= p.unlockSun)
}

// 根据科目获取该科目解锁的植物列表（保留兼容，不再用于解锁逻辑）
export function getPlantsBySubject(plants: PlantDef[], subject: Subject): PlantDef[] {
  return plants.filter(p => p.subject === subject)
}

// 运动家务类奖励范围 8-15
export function getSportReward(): number {
  return Math.floor(Math.random() * 8) + 8 // 8-15
}
