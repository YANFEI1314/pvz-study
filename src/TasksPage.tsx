import { useState, useRef, useEffect, useMemo } from 'react'
import type { Task, ChildData, TaskCategory } from './types'
import { CATEGORY_CONFIG, SUBJECT_CONFIG, subjectToCategory } from './data'
import { isOverdue } from './store'
import { Icon } from './icons'

// ========== 僵尸攻防进度条配置 ==========
const DEFAULT_LEARNING_START = '10:00'
const DEFAULT_LEARNING_END = '22:00'

const SUBJECT_COLORS: Record<string, string> = {
  math: 'orange',
  chinese: 'pink',
  english: 'blue',
  sport: 'teal',
  habit: 'green',
}

// 时间字符串 HH:mm → 分钟数
function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function TasksPage({
  child, tasks, todayStr,
  onSubmit, onSunDeduct, onToast,
}: {
  child: ChildData
  tasks: Task[]
  todayStr: string
  onSubmit: (task: Task, material?: string) => void
  onSunDeduct: (childId: string, amount: number, reason: string) => void
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void
}) {
  const todayTasks = tasks.filter(t => t.childId === child.id && t.date === todayStr)
  const categories: TaskCategory[] = ['math', 'chinese', 'english', 'other']

  const total = todayTasks.length
  const done = todayTasks.filter(t => t.status === 'approved').length

  // 拍照弹窗状态
  const [uploadTask, setUploadTask] = useState<Task | null>(null)
  // 提交成功奖励弹窗
  const [rewardShow, setRewardShow] = useState<{ reward: number } | null>(null)
  // 僵尸进度条实时刷新
  const [zombieNow, setZombieNow] = useState(Date.now())
  // 花朵被吃状态（持久化到 localStorage，按天+孩子ID区分）
  const penaltyKey = `pvz-penalty-${child.id}-${todayStr}`
  const [penaltyState, setPenaltyState] = useState<{ flower1: boolean; flower2: boolean; house: boolean }>(() => {
    try {
      const saved = localStorage.getItem(penaltyKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { flower1: false, flower2: false, house: false }
  })

  function markPenalty(key: 'flower1' | 'flower2' | 'house') {
    const next = { ...penaltyState, [key]: true }
    setPenaltyState(next)
    try { localStorage.setItem(penaltyKey, JSON.stringify(next)) } catch {}
  }

  // ========== 僵尸攻防进度条：双核心驱动 + 三色分段 ==========
  const zombieProgress = useMemo(() => {
    if (todayTasks.length === 0) return null
    const N = todayTasks.length
    const completed = done

    // 全部完成：僵尸在起点，绿色安全
    if (completed >= N) {
      return {
        zombieSegments: 0, totalSegments: N,
        greenEnd: N, yellowEnd: N,
        phase: 'safe' as const, allDone: true,
      }
    }

    // 从 child 读取全局学习时段（优先使用已设置的，否则用默认值）
    const startStr = child.learningStart || DEFAULT_LEARNING_START
    const endStr = child.learningEnd || DEFAULT_LEARNING_END
    const startMins = timeToMins(startStr)
    const endMins = timeToMins(endStr)
    const duration = endMins - startMins
    if (duration <= 0) {
      // 异常配置：全部完成
      return {
        zombieSegments: 0, totalSegments: N,
        greenEnd: N, yellowEnd: N,
        phase: 'safe' as const, allDone: true,
      }
    }

    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()

    // 时间推进比例（学习时段外冻结）
    let timeRatio = 0
    if (nowMins < startMins) {
      timeRatio = 0
    } else if (nowMins >= endMins) {
      timeRatio = 1
    } else {
      timeRatio = (nowMins - startMins) / duration
    }

    // 僵尸段位 = 时间推进 - 任务击退，钳制在 [0, N]
    const rawSegments = timeRatio * N - completed
    const zombieSegments = Math.max(0, Math.min(N, rawSegments))

    // 三段分区计算：优先加长绿色，黄红平分剩余
    const greenSegments = Math.ceil(N / 3)
    const remaining = N - greenSegments
    const yellowSegments = Math.ceil(remaining / 2)
    const greenEnd = greenSegments
    const yellowEnd = greenSegments + yellowSegments

    // 当前僵尸所处区域颜色
    let phase: 'safe' | 'warning' | 'danger' = 'safe'
    if (zombieSegments < greenEnd) {
      phase = 'safe'
    } else if (zombieSegments < yellowEnd) {
      phase = 'warning'
    } else {
      phase = 'danger'
    }

    return { zombieSegments, totalSegments: N, greenEnd, yellowEnd, phase, allDone: false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayTasks, zombieNow, done, child.learningStart, child.learningEnd])

  // 花朵惩罚检测
  useEffect(() => {
    if (!zombieProgress || zombieProgress.allDone) return
    const { zombieSegments, greenEnd, yellowEnd, totalSegments } = zombieProgress

    // 花1（黄区起点 = greenEnd）：僵尸到达这里扣50阳光
    if (zombieSegments >= greenEnd && !penaltyState.flower1) {
      markPenalty('flower1')
      onSunDeduct(child.id, 50, '僵尸踩坏了黄色区域的小花')
    }
    // 花2（红区起点 = yellowEnd）：僵尸到达这里扣50阳光
    if (zombieSegments >= yellowEnd && !penaltyState.flower2) {
      markPenalty('flower2')
      onSunDeduct(child.id, 50, '僵尸踩坏了红色区域的小花')
    }
    // 终点：僵尸到达房屋扣100阳光
    if (zombieSegments >= totalSegments && !penaltyState.house) {
      markPenalty('house')
      onSunDeduct(child.id, 100, '僵尸到达了房屋')
    }
  }, [zombieProgress, penaltyState, child.id, onSunDeduct])

  useEffect(() => {
    if (!zombieProgress) return
    const timer = setInterval(() => setZombieNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [zombieProgress])


  function handleTaskClick(t: Task) {
    if (t.status === 'approved') return
    if (isOverdue(t)) { onToast('任务已逾期', 'error'); return }
    // 不需要拍照提交的任务，直接提交
    if (!t.requireUpload) {
      handleSubmit(t)
      return
    }
    // 需要拍照提交的任务，弹出拍照弹窗
    setUploadTask(t)
  }

  function handleSubmit(task: Task, material?: string) {
    // 关闭上传弹窗
    setUploadTask(null)
    // 提交任务
    onSubmit(task, material)
    // 展示奖励弹窗（只显示阳光奖励，植物解锁按累计阳光自动触发）
    setRewardShow({ reward: task.reward })
    // 3秒后自动关闭
    setTimeout(() => setRewardShow(null), 3000)
  }

  return (
    <>
      {/* 顶部绿色头部 */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-avatar">
            <Icon name={child.icon as any} size={44} />
          </div>
          <div className="header-info">
            <div className="header-name">{child.name}</div>
            <span className="header-grade">{child.grade}</span>
          </div>
        </div>
        <div className="header-progress">
          <div className="progress-bar-phone">
            <div className="fill" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
          </div>
          <div className="progress-count">{done}/{total}</div>
        </div>
      </div>

      {/* 僵尸家园攻防进度条 */}
      {zombieProgress && (
        <ZombieBar
          zombieSegments={zombieProgress.zombieSegments}
          totalSegments={zombieProgress.totalSegments}
          greenEnd={zombieProgress.greenEnd}
          yellowEnd={zombieProgress.yellowEnd}
          phase={zombieProgress.phase}
          allDone={zombieProgress.allDone}
          flower1Eaten={penaltyState.flower1}
          flower2Eaten={penaltyState.flower2}
        />
      )}

      {/* 任务列表 - 按四大分类 */}
      <div className="content-scroll">
        {categories.map(cat => {
          const catTasks = todayTasks.filter(t => subjectToCategory(t.subject) === cat)
          if (catTasks.length === 0) return null
          const cfg = CATEGORY_CONFIG[cat]
          const catDone = catTasks.filter(t => t.status === 'approved').length

          return (
            <div className="group-card" key={cat}>
              <div className="group-header-phone">
                <span className="group-icon" style={{ fontSize: 24 }}>{cfg.emoji}</span>
                <span className="group-name">{cfg.label}</span>
                <span className="group-count">{catDone}/{catTasks.length}</span>
              </div>

              {catTasks.map(t => {
                const sc = SUBJECT_CONFIG[t.subject]
                const taskIcon = t.icon || sc.icon
                const isDone = t.status === 'approved'
                const overdue = isOverdue(t)

                return (
                  <div
                    className={`task-row${isDone ? ' task-done' : ''}`}
                    key={t.id}
                    onClick={() => handleTaskClick(t)}
                    style={{ cursor: isDone ? 'default' : 'pointer' }}
                  >
                    {/* 左侧图标 */}
                    <div className={`task-icon-square ${isDone ? 'gray' : (t.subject === 'math' ? 'orange' : t.subject === 'chinese' ? 'pink' : t.subject === 'english' ? 'blue' : 'teal')}`}>
                      <Icon name={taskIcon as any} size={32} />
                    </div>

                    {/* 中间信息 */}
                    <div className="task-info">
                      <div className="task-title-phone" style={isDone ? { color: 'var(--text-muted)' } : {}}>{t.title}</div>
                      <div className="task-meta-phone" style={isDone ? { opacity: 0.5 } : {}}>
                        <span className="sun-reward">
                          <Icon name="sun" size={16} />
                          {t.reward}
                        </span>
                        <span className="time-info">
                          <Icon name="clock" size={14} />
                          {t.deadline}
                        </span>
                        {t.requireUpload && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Icon name="camera" size={14} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 右侧状态标识 */}
                    <div style={{ flexShrink: 0 }}>
                      {isDone ? (
                        <span className="task-status-tag done">已完成</span>
                      ) : overdue ? (
                        <span className="task-status-tag overdue">已逾期</span>
                      ) : (
                        <span className="task-status-tag pending">待完成</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {todayTasks.length === 0 && (
          <div className="empty-state-phone">
            <Icon name="trophy" size={80} />
            <div style={{ fontSize: 15, marginTop: 8 }}>今天没有任务，好好休息吧！</div>
          </div>
        )}
      </div>

      {/* 拍照/提交弹窗 */}
      {uploadTask && (
        <CameraUpload
          task={uploadTask}
          onClose={() => setUploadTask(null)}
          onConfirm={(material) => handleSubmit(uploadTask, material)}
        />
      )}

      {/* 提交成功奖励弹窗 */}
      {rewardShow && (
        <div className="modal-overlay" onClick={() => setRewardShow(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 360, margin: '0 auto', borderRadius: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              <Icon name="sunflower" size={80} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              太棒了！🎉
            </div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 4 }}>
              任务完成，获得阳光奖励
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f9a825', marginBottom: 16 }}>
              <Icon name="sun" size={28} /> +{rewardShow.reward}
            </div>
            <button className="btn-primary" onClick={() => setRewardShow(null)} style={{ padding: '12px' }}>
              知道了
            </button>
          </div>
        </div>
      )}

    </>
  )
}

// 拍照/视频上传组件
function CameraUpload({ task, onClose, onConfirm }: {
  task: Task
  onClose: () => void
  onConfirm: (material?: string) => void
}) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [mode, setMode] = useState<'photo' | 'video'>('photo')
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function startCamera() {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: mode === 'video',
      })
      setStream(s)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch (_e: any) {
      setError('无法访问摄像头，请使用"选择文件"上传')
    }
  }

  function stopCamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null) }
  }

  function capturePhoto() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(videoRef.current, 0, 0)
    setCaptured(canvas.toDataURL('image/jpeg', 0.7))
    stopCamera()
  }

  function startRecording() {
    if (!stream) return
    const chunks: Blob[] = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const reader = new FileReader()
      reader.onloadend = () => setCaptured(reader.result as string)
      reader.readAsDataURL(blob)
    }
    mr.start()
    setMediaRecorder(mr)
    setRecording(true)
  }

  function stopRecording() {
    if (mediaRecorder) { mediaRecorder.stop(); setRecording(false) }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setCaptured(reader.result as string)
    reader.readAsDataURL(file)
    stopCamera()
  }

  return (
    <div className="modal-overlay" onClick={() => { stopCamera(); onClose() }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">完成「{task.title}」</div>

        <div className="switch-row" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>模式：{mode === 'photo' ? '拍照' : '录像'}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`btn-sm ${mode === 'photo' ? 'btn-blue' : 'btn-secondary'}`} onClick={() => { setMode('photo'); stopCamera(); setCaptured(null) }}>拍照</button>
            <button className={`btn-sm ${mode === 'video' ? 'btn-blue' : 'btn-secondary'}`} onClick={() => { setMode('video'); stopCamera(); setCaptured(null) }}>录像</button>
          </div>
        </div>

        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</div>}

        <div className="camera-container" style={{ background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 12, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {captured ? (
            captured.startsWith('data:video') ? (
              <video src={captured} controls style={{ width: '100%' }} />
            ) : (
              <img src={captured} alt="预览" style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} />
            )
          ) : (
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', background: '#000' }} />
          )}
        </div>

        {!captured ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {!stream && <button className="btn-sm btn-blue" onClick={startCamera}>📷 开启摄像头</button>}
            {stream && mode === 'photo' && !recording && <button className="btn-sm btn-green" onClick={capturePhoto}>📸 拍照</button>}
            {stream && mode === 'video' && !recording && <button className="btn-sm btn-red" onClick={startRecording}>🔴 开始录像</button>}
            {recording && <button className="btn-sm btn-red" onClick={stopRecording}>⏹ 停止</button>}
            <button className="btn-sm btn-orange" onClick={() => fileRef.current?.click()}>📁 选择文件</button>
            <input ref={fileRef} type="file" accept={mode === 'photo' ? 'image/*' : 'video/*'} onChange={handleFile} style={{ display: 'none' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setCaptured(null); startCamera() }}>重新拍摄</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => onConfirm(captured!)}>✅ 提交任务</button>
          </div>
        )}

      </div>
    </div>
  )
}

// ========== 僵尸家园攻防进度条组件 v3 ==========
// 布局：僵尸(左) | 道路(绿→黄→红三色) | 房屋(右)
// 道路按任务数分三段：绿(0~1/3)、黄(1/3~2/3)、红(2/3~N)
// 黄区和红区起点各有一朵小花，僵尸到达时吃掉
function ZombieBar({
  zombieSegments,
  totalSegments,
  greenEnd,
  yellowEnd,
  phase,
  allDone,
  flower1Eaten,
  flower2Eaten,
}: {
  zombieSegments: number
  totalSegments: number
  greenEnd: number
  yellowEnd: number
  phase: 'safe' | 'warning' | 'danger'
  allDone?: boolean
  flower1Eaten: boolean
  flower2Eaten: boolean
}) {
  const phaseConfig = {
    safe:    { bg: '#4caf50', text: '花园安全，继续加油！' },
    warning: { bg: '#ff9800', text: '僵尸进入黄色区域，小心！' },
    danger:  { bg: '#ef5350', text: '危险！僵尸逼近房屋！' },
  }
  const effectivePhase = allDone ? 'safe' : phase
  const { bg, text } = phaseConfig[effectivePhase]

  // 道路布局参数
  const roadLeftPercent = 8
  const roadRightPercent = 92
  const roadWidth = roadRightPercent - roadLeftPercent

  // 僵尸位置
  const segmentRatio = totalSegments > 0 ? zombieSegments / totalSegments : 0
  const zombiePos = roadLeftPercent + roadWidth * segmentRatio

  // 花1位置（绿黄分界线 = greenEnd）
  const flower1Ratio = totalSegments > 0 ? greenEnd / totalSegments : 0
  const flower1Pos = roadLeftPercent + roadWidth * flower1Ratio
  // 花2位置（黄红分界线 = yellowEnd）
  const flower2Ratio = totalSegments > 0 ? yellowEnd / totalSegments : 0
  const flower2Pos = roadLeftPercent + roadWidth * flower2Ratio

  // 任务刻度标记
  const segments = Array.from({ length: totalSegments }, (_, i) => i)

  // 三色区域百分比（用于道路底色渐变）
  const greenPct = totalSegments > 0 ? (greenEnd / totalSegments) * 100 : 33
  const yellowPct = totalSegments > 0 ? ((yellowEnd - greenEnd) / totalSegments) * 100 : 33
  const redPct = totalSegments > 0 ? ((totalSegments - yellowEnd) / totalSegments) * 100 : 34

  return (
    <div className="zombie-bar-wrap">
      {/* 状态文字 */}
      <div className="zombie-bar-status" style={{ color: bg }}>
        {allDone ? '🎉 全部任务完成，花园安全！' : text}
      </div>

      {/* 进度条主体 */}
      <div className="zombie-bar-track">
        {/* 三色渐变道路 */}
        <div
          className="zombie-road-v3"
          style={{
            background: `linear-gradient(to right,
              #c8e6c9 0%, #c8e6c9 ${greenPct}%,
              #ffe0b2 ${greenPct}%, #ffe0b2 ${greenPct + yellowPct}%,
              #ffcdd2 ${greenPct + yellowPct}%, #ffcdd2 100%)`,
          }}
        />

        {/* 任务刻度线 */}
        {segments.map(i => {
          const segLeft = roadLeftPercent + (roadWidth * i) / totalSegments
          const passed = i < zombieSegments
          return (
            <div
              key={i}
              className="zombie-segment-mark"
              style={{
                left: `${segLeft}%`,
                background: passed ? bg : 'rgba(255,255,255,0.5)',
                opacity: passed ? 0.7 : 0.5,
              }}
            />
          )
        })}

        {/* 花1：绿黄分界线（仅当黄区存在时显示） */}
        {yellowEnd > greenEnd && (
          <div
            className={`zombie-flower ${flower1Eaten ? 'eaten' : ''}`}
            style={{ left: `${flower1Pos}%` }}
            title="黄色区域起点 · 被吃掉扣50阳光"
          >
            {flower1Eaten ? '🥀' : '🌸'}
          </div>
        )}

        {/* 花2：黄红分界线（仅当红区存在时显示） */}
        {totalSegments > yellowEnd && (
          <div
            className={`zombie-flower ${flower2Eaten ? 'eaten' : ''}`}
            style={{ left: `${flower2Pos}%` }}
            title="红色区域起点 · 被吃掉扣50阳光"
          >
            {flower2Eaten ? '🥀' : '🌸'}
          </div>
        )}

        {/* 僵尸已走过的路径 */}
        <div
          className="zombie-path"
          style={{
            left: `${roadLeftPercent}%`,
            width: `${Math.max(0, zombiePos - roadLeftPercent)}%`,
            background: bg,
            opacity: zombieSegments > 0 ? 0.3 : 0,
          }}
        />

        {/* 房屋图标 */}
        <div className="zombie-house">
          🏠
        </div>

        {/* 僵尸图标 */}
        <div
          className="zombie-icon"
          style={{ left: `${zombiePos}%` }}
        >
          {effectivePhase === 'danger' ? '🧟‍♂️' : '🧟'}
        </div>
      </div>

      {/* 底部图例 */}
      <div className="zombie-bar-legend">
        <span className="zombie-legend-item">
          <span className="zombie-legend-dot" style={{ background: '#4caf50' }} />绿
        </span>
        <span className="zombie-legend-item">
          <span className="zombie-legend-dot" style={{ background: '#ff9800' }} />黄
        </span>
        <span className="zombie-legend-item">
          <span className="zombie-legend-dot" style={{ background: '#ef5350' }} />红
        </span>
        <span className="zombie-legend-item" style={{ marginLeft: 'auto' }}>
          僵尸：第 {Math.ceil(zombieSegments)}/{totalSegments} 段
        </span>
      </div>
    </div>
  )
}
