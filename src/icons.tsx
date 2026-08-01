// ====== 内联 SVG 植物图标（保留作为 fallback）======
// 现在主要使用 emoji，但保留 SVG 作为备用

import type { ReactNode } from 'react'
import { EMOJI } from './emoji'

// 优先用 emoji，没有匹配的再用 SVG
export function Icon({ name, size = 24 }: { name: string; size?: number }): ReactNode {
  // 支持 dataURL 图片（如自定义头像）
  if (name.startsWith('data:')) {
    return (
      <img src={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    )
  }
  const emoji = EMOJI[name]
  if (emoji) {
    return (
      <span style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {emoji}
      </span>
    )
  }
  // fallback 到 SVG
  const svg = ICONS[name as keyof typeof ICONS]
  if (svg) {
    return (
      <span style={{ display: 'inline-flex', width: size, height: size, verticalAlign: 'middle', lineHeight: 0 }}>
        {svg}
      </span>
    )
  }
  return <span style={{ fontSize: size }}>❓</span>
}

export const ICONS = {
  // 资源
  sun: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="70%" stopColor="#ffc107" />
          <stop offset="100%" stopColor="#ff8f00" />
        </radialGradient>
      </defs>
      <g>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const x1 = 50 + Math.cos(a) * 28
          const y1 = 50 + Math.sin(a) * 28
          const x2 = 50 + Math.cos(a) * 45
          const y2 = 50 + Math.sin(a) * 45
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffeb3b" strokeWidth="6" strokeLinecap="round" />
        })}
        <circle cx="50" cy="50" r="26" fill="url(#sunG)" stroke="#ff8f00" strokeWidth="2" />
        <circle cx="42" cy="44" r="4" fill="#fff59d" opacity="0.7" />
      </g>
    </svg>
  ),

  diamond: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="30%" stopColor="#81d4fa" />
          <stop offset="60%" stopColor="#29b6f6" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>
      </defs>
      {/* 钻石顶部切面 */}
      <polygon points="50,10 75,35 50,60 25,35" fill="url(#diamondG)" stroke="#01579b" strokeWidth="2" />
      {/* 钻石底部 */}
      <polygon points="25,35 50,90 75,35" fill="#4fc3f7" stroke="#01579b" strokeWidth="2" />
      {/* 高光 */}
      <polygon points="50,10 62,35 50,60 38,35" fill="rgba(255,255,255,0.35)" />
      <polygon points="38,35 50,60 50,90 25,35" fill="rgba(255,255,255,0.15)" />
    </svg>
  ),

  // 植物 - 统一卡通风格：圆角、可爱、大眼睛、笑脸、低饱和柔和色
  sunflower: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="62" width="8" height="28" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      {/* 叶子 */}
      <ellipse cx="36" cy="78" rx="12" ry="6" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      <ellipse cx="64" cy="74" rx="10" ry="5" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 花瓣 - 圆润水滴形 */}
      <g>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2
          const cx = 50 + Math.cos(a) * 22
          const cy = 50 + Math.sin(a) * 22
          return <ellipse key={i} cx={cx} cy={cy} rx="11" ry="9" fill="#FFEB3B" stroke="#F9A825" strokeWidth="1.5" transform={`rotate(${(i / 8) * 360} ${cx} ${cy})`} />
        })}
      </g>
      {/* 花心 - 圆脸 */}
      <circle cx="50" cy="50" r="18" fill="#FFCC80" stroke="#F57F17" strokeWidth="2" />
      {/* 眼睛 - 大圆眼 */}
      <ellipse cx="43" cy="47" rx="4.5" ry="5.5" fill="#fff" />
      <circle cx="44" cy="48" r="2.5" fill="#3E2723" />
      <circle cx="45" cy="46.5" r="1" fill="#fff" />
      <ellipse cx="57" cy="47" rx="4.5" ry="5.5" fill="#fff" />
      <circle cx="56" cy="48" r="2.5" fill="#3E2723" />
      <circle cx="57" cy="46.5" r="1" fill="#fff" />
      {/* 腮红 */}
      <circle cx="38" cy="54" r="3" fill="#FF8A80" opacity="0.5" />
      <circle cx="62" cy="54" r="3" fill="#FF8A80" opacity="0.5" />
      {/* 笑脸 */}
      <path d="M 44 56 Q 50 61 56 56" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),

  peashooter: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="62" width="8" height="26" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="36" cy="78" rx="11" ry="5" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 头部 - 圆润绿色 */}
      <circle cx="50" cy="45" r="28" fill="#AED581" stroke="#558B2F" strokeWidth="2.5" />
      {/* 嘴巴/发射口 */}
      <ellipse cx="72" cy="45" rx="8" ry="7" fill="#558B2F" />
      <ellipse cx="74" cy="45" rx="4" ry="4" fill="#33691E" />
      {/* 高光 */}
      <ellipse cx="38" cy="34" rx="8" ry="5" fill="#C8E6C9" opacity="0.7" />
      {/* 眼睛 */}
      <ellipse cx="42" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="43" cy="43" r="2.5" fill="#3E2723" />
      <circle cx="44" cy="41.5" r="1" fill="#fff" />
      <ellipse cx="56" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="55" cy="43" r="2.5" fill="#3E2723" />
      <circle cx="56" cy="41.5" r="1" fill="#fff" />
      {/* 腮红 */}
      <circle cx="36" cy="50" r="2.5" fill="#FF8A80" opacity="0.4" />
      <circle cx="60" cy="50" r="2.5" fill="#FF8A80" opacity="0.4" />
    </svg>
  ),

  snowpea: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="62" width="8" height="26" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="36" cy="78" rx="11" ry="5" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 头部 - 冰蓝色 */}
      <circle cx="50" cy="45" r="28" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2.5" />
      {/* 嘴巴/发射口 */}
      <ellipse cx="72" cy="45" rx="8" ry="7" fill="#4FC3F7" />
      <ellipse cx="74" cy="45" rx="4" ry="4" fill="#0288D1" />
      {/* 高光 */}
      <ellipse cx="38" cy="34" rx="8" ry="5" fill="#E1F5FE" opacity="0.8" />
      {/* 眼睛 */}
      <ellipse cx="42" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="43" cy="43" r="2.5" fill="#0277BD" />
      <circle cx="44" cy="41.5" r="1" fill="#fff" />
      <ellipse cx="56" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="55" cy="43" r="2.5" fill="#0277BD" />
      <circle cx="56" cy="41.5" r="1" fill="#fff" />
      {/* 冰晶装饰 */}
      <path d="M 28 28 L 30 24 L 32 28 L 30 32 Z" fill="#E1F5FE" stroke="#4FC3F7" strokeWidth="1" />
      <path d="M 68 60 L 70 56 L 72 60 L 70 64 Z" fill="#E1F5FE" stroke="#4FC3F7" strokeWidth="1" />
      <circle cx="30" cy="58" r="2" fill="#E1F5FE" stroke="#4FC3F7" strokeWidth="0.5" />
    </svg>
  ),

  wallnut: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 主体 - 圆润棕色 */}
      <ellipse cx="50" cy="55" rx="32" ry="36" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2.5" />
      {/* 顶部弧线 */}
      <path d="M 22 48 Q 50 18 78 48" stroke="#8D6E63" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 眼睛 - 坚定表情 */}
      <ellipse cx="40" cy="50" rx="5" ry="6" fill="#fff" />
      <circle cx="41" cy="51" r="2.5" fill="#3E2723" />
      <circle cx="42" cy="49.5" r="1" fill="#fff" />
      <ellipse cx="60" cy="50" rx="5" ry="6" fill="#fff" />
      <circle cx="59" cy="51" r="2.5" fill="#3E2723" />
      <circle cx="60" cy="49.5" r="1" fill="#fff" />
      {/* 腮红 */}
      <circle cx="34" cy="58" r="3" fill="#FF8A80" opacity="0.4" />
      <circle cx="66" cy="58" r="3" fill="#FF8A80" opacity="0.4" />
      {/* 嘴巴 - 坚定 */}
      <path d="M 44 62 Q 50 58 56 62" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),

  twinshootsunflower: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="58" width="8" height="32" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="36" cy="78" rx="11" ry="5" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 左花 */}
      <g transform="translate(32, 38)">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2
          const cx = Math.cos(a) * 14
          const cy = Math.sin(a) * 14
          return <ellipse key={i} cx={cx} cy={cy} rx="8" ry="6" fill="#FFEB3B" stroke="#F9A825" strokeWidth="1.2" transform={`rotate(${(i / 6) * 360})`} />
        })}
        <circle cx="0" cy="0" r="8" fill="#FFCC80" stroke="#F57F17" strokeWidth="1.5" />
        <circle cx="-2.5" cy="-1" r="1.5" fill="#fff" />
        <circle cx="-2" cy="-0.5" r="0.8" fill="#3E2723" />
        <circle cx="2.5" cy="-1" r="1.5" fill="#fff" />
        <circle cx="2" cy="-0.5" r="0.8" fill="#3E2723" />
        <path d="M -2 3 Q 0 5 2 3" stroke="#3E2723" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      {/* 右花 */}
      <g transform="translate(66, 38)">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2
          const cx = Math.cos(a) * 14
          const cy = Math.sin(a) * 14
          return <ellipse key={i} cx={cx} cy={cy} rx="8" ry="6" fill="#FFEB3B" stroke="#F9A825" strokeWidth="1.2" transform={`rotate(${(i / 6) * 360})`} />
        })}
        <circle cx="0" cy="0" r="8" fill="#FFCC80" stroke="#F57F17" strokeWidth="1.5" />
        <circle cx="-2.5" cy="-1" r="1.5" fill="#fff" />
        <circle cx="-2" cy="-0.5" r="0.8" fill="#3E2723" />
        <circle cx="2.5" cy="-1" r="1.5" fill="#fff" />
        <circle cx="2" cy="-0.5" r="0.8" fill="#3E2723" />
        <path d="M -2 3 Q 0 5 2 3" stroke="#3E2723" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  ),

  repeater: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="62" width="8" height="26" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="36" cy="78" rx="11" ry="5" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 左头 */}
      <circle cx="35" cy="45" r="20" fill="#AED581" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="52" cy="42" rx="6" ry="5" fill="#558B2F" />
      <ellipse cx="54" cy="42" rx="3" ry="3" fill="#33691E" />
      <ellipse cx="26" cy="36" rx="5" ry="3" fill="#C8E6C9" opacity="0.7" />
      <ellipse cx="30" cy="43" rx="3.5" ry="4" fill="#fff" />
      <circle cx="31" cy="43.5" r="1.8" fill="#3E2723" />
      <circle cx="32" cy="42.5" r="0.7" fill="#fff" />
      <ellipse cx="40" cy="43" rx="3.5" ry="4" fill="#fff" />
      <circle cx="39" cy="43.5" r="1.8" fill="#3E2723" />
      <circle cx="40" cy="42.5" r="0.7" fill="#fff" />
      {/* 右头 */}
      <circle cx="65" cy="45" r="20" fill="#AED581" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="82" cy="42" rx="6" ry="5" fill="#558B2F" />
      <ellipse cx="84" cy="42" rx="3" ry="3" fill="#33691E" />
      <ellipse cx="56" cy="36" rx="5" ry="3" fill="#C8E6C9" opacity="0.7" />
      <ellipse cx="60" cy="43" rx="3.5" ry="4" fill="#fff" />
      <circle cx="61" cy="43.5" r="1.8" fill="#3E2723" />
      <circle cx="62" cy="42.5" r="0.7" fill="#fff" />
      <ellipse cx="70" cy="43" rx="3.5" ry="4" fill="#fff" />
      <circle cx="69" cy="43.5" r="1.8" fill="#3E2723" />
      <circle cx="70" cy="42.5" r="0.7" fill="#fff" />
    </svg>
  ),

  tallnut: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 主体 - 高圆角矩形 */}
      <rect x="28" y="15" width="44" height="78" rx="18" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2.5" />
      {/* 顶部弧线 */}
      <path d="M 30 30 Q 50 12 70 30" stroke="#8D6E63" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 眼睛 */}
      <ellipse cx="42" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="43" cy="43" r="2.5" fill="#3E2723" />
      <circle cx="44" cy="41.5" r="1" fill="#fff" />
      <ellipse cx="58" cy="42" rx="5" ry="6" fill="#fff" />
      <circle cx="57" cy="43" r="2.5" fill="#3E2723" />
      <circle cx="58" cy="41.5" r="1" fill="#fff" />
      {/* 腮红 */}
      <circle cx="36" cy="52" r="2.5" fill="#FF8A80" opacity="0.4" />
      <circle cx="64" cy="52" r="2.5" fill="#FF8A80" opacity="0.4" />
      {/* 嘴巴 - 自信 */}
      <path d="M 44 55 Q 50 52 56 55" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),

  corncob: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* 茎 */}
      <rect x="46" y="72" width="8" height="18" rx="3" fill="#8BC34A" stroke="#558B2F" strokeWidth="2" />
      <ellipse cx="36" cy="82" rx="10" ry="4" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" />
      {/* 玉米主体 - 圆润 */}
      <rect x="30" y="22" width="40" height="56" rx="12" fill="#FFF59D" stroke="#F9A825" strokeWidth="2" />
      {/* 玉米粒 - 圆润 */}
      <g>
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={34 + col * 11}
              y={28 + row * 15}
              width="8"
              height="10"
              rx="4"
              fill="#FFEE58"
              stroke="#F9A825"
              strokeWidth="0.8"
            />
          ))
        )}
      </g>
      {/* 顶炮 - 可爱小炮 */}
      <rect x="42" y="12" width="16" height="14" rx="5" fill="#78909C" stroke="#546E7A" strokeWidth="2" />
      <circle cx="50" cy="16" r="3" fill="#455A64" />
      {/* 叶子 */}
      <ellipse cx="28" cy="55" rx="8" ry="4" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" transform="rotate(-25 28 55)" />
      <ellipse cx="72" cy="55" rx="8" ry="4" fill="#AED581" stroke="#558B2F" strokeWidth="1.5" transform="rotate(25 72 55)" />
    </svg>
  ),

  // 僵尸
  zombie: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="60" width="20" height="30" fill="#616161" />
      <circle cx="50" cy="35" r="22" fill="#a1887f" stroke="#5d4037" strokeWidth="2" />
      {/* 烂脸 */}
      <path d="M 30 30 Q 35 25 40 30" stroke="#5d4037" strokeWidth="1" fill="#8d6e63" />
      <circle cx="42" cy="32" r="4" fill="#fff" />
      <circle cx="42" cy="32" r="2" fill="#d32f2f" />
      <circle cx="58" cy="32" r="4" fill="#fff" />
      <circle cx="58" cy="32" r="2" fill="#d32f2f" />
      {/* 牙齿 */}
      <rect x="44" y="40" width="4" height="6" fill="#fff" stroke="#3e2723" strokeWidth="0.5" />
      <rect x="52" y="40" width="4" height="6" fill="#fff" stroke="#3e2723" strokeWidth="0.5" />
      {/* 头发 */}
      <path d="M 32 25 L 35 18 L 38 25 L 42 16 L 45 25 L 50 14 L 55 25 L 60 18 L 65 25 L 68 22" stroke="#3e2723" strokeWidth="2" fill="none" />
      {/* 手臂 */}
      <rect x="25" y="55" width="10" height="20" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
      <rect x="65" y="55" width="10" height="20" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
    </svg>
  ),

  buckethead: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="60" width="20" height="30" fill="#616161" />
      {/* 铁桶头部 */}
      <path d="M 30 20 L 30 45 L 70 45 L 70 20 Z" fill="#9e9e9e" stroke="#424242" strokeWidth="2" />
      <ellipse cx="50" cy="20" rx="20" ry="4" fill="#bdbdbd" stroke="#424242" strokeWidth="2" />
      <rect x="30" y="40" width="40" height="3" fill="#757575" />
      {/* 脸 */}
      <circle cx="42" cy="32" r="4" fill="#fff" />
      <circle cx="42" cy="32" r="2" fill="#d32f2f" />
      <circle cx="58" cy="32" r="4" fill="#fff" />
      <circle cx="58" cy="32" r="2" fill="#d32f2f" />
      <rect x="44" y="38" width="3" height="5" fill="#fff" />
      <rect x="53" y="38" width="3" height="5" fill="#fff" />
      {/* 烂脸痕迹 */}
      <path d="M 33 38 L 38 42" stroke="#5d4037" strokeWidth="1.5" />
    </svg>
  ),

  // 装饰
  grass: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 80 Q 25 60 30 80" fill="#7cb342" stroke="#558b2f" strokeWidth="1" />
      <path d="M 40 80 Q 45 50 50 80" fill="#7cb342" stroke="#558b2f" strokeWidth="1" />
      <path d="M 60 80 Q 65 65 70 80" fill="#7cb342" stroke="#558b2f" strokeWidth="1" />
      <path d="M 80 80 Q 85 55 90 80" fill="#7cb342" stroke="#558b2f" strokeWidth="1" />
    </svg>
  ),

  star: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 10 L 60 40 L 92 40 L 65 60 L 75 90 L 50 70 L 25 90 L 35 60 L 8 40 L 40 40 Z" fill="#ffd600" stroke="#f57f17" strokeWidth="2" />
    </svg>
  ),

  // 头像
  boy: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#ffe0b2" stroke="#bf5e22" strokeWidth="2" />
      {/* 头发 */}
      <path d="M 15 40 Q 50 5 85 40 L 85 30 Q 50 -5 15 30 Z" fill="#5d4037" />
      {/* 眼睛 */}
      <circle cx="38" cy="48" r="4" fill="#3e2723" />
      <circle cx="62" cy="48" r="4" fill="#3e2723" />
      <circle cx="38" cy="47" r="1.5" fill="#fff" />
      <circle cx="62" cy="47" r="1.5" fill="#fff" />
      {/* 嘴巴 */}
      <path d="M 38 65 Q 50 72 62 65" stroke="#3e2723" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 腮红 */}
      <circle cx="28" cy="60" r="5" fill="#ff8a80" opacity="0.6" />
      <circle cx="72" cy="60" r="5" fill="#ff8a80" opacity="0.6" />
    </svg>
  ),

  girl: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#ffe0b2" stroke="#bf5e22" strokeWidth="2" />
      {/* 长发 */}
      <path d="M 10 45 Q 50 -5 90 45 L 90 75 Q 85 80 80 75 L 80 50 Q 50 15 20 50 L 20 75 Q 15 80 10 75 Z" fill="#3e2723" />
      {/* 眼睛 */}
      <circle cx="38" cy="48" r="4" fill="#3e2723" />
      <circle cx="62" cy="48" r="4" fill="#3e2723" />
      <circle cx="38" cy="47" r="1.5" fill="#fff" />
      <circle cx="62" cy="47" r="1.5" fill="#fff" />
      {/* 嘴巴 */}
      <ellipse cx="50" cy="65" rx="6" ry="3" fill="#e91e63" />
      <circle cx="28" cy="60" r="5" fill="#ff8a80" opacity="0.6" />
      <circle cx="72" cy="60" r="5" fill="#ff8a80" opacity="0.6" />
      {/* 蝴蝶结 */}
      <path d="M 20 25 L 30 20 L 25 30 Z" fill="#e91e63" />
      <path d="M 30 25 L 40 20 L 35 30 Z" fill="#e91e63" />
      <circle cx="30" cy="25" r="3" fill="#c2185b" />
    </svg>
  ),

  lock: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="50" height="40" rx="5" fill="#9e9e9e" stroke="#424242" strokeWidth="3" />
      <path d="M 35 45 L 35 30 Q 35 15 50 15 Q 65 15 65 30 L 65 45" fill="none" stroke="#424242" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="63" r="5" fill="#ffeb3b" />
      <rect x="48" y="63" width="4" height="12" fill="#ffeb3b" />
    </svg>
  ),

  // 任务图标
  book: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 20 L 50 25 L 80 20 L 80 80 L 50 75 L 20 80 Z" fill="#8d6e63" stroke="#3e2723" strokeWidth="2" />
      <path d="M 50 25 L 50 75" stroke="#3e2723" strokeWidth="2" />
      <rect x="25" y="35" width="20" height="3" fill="#fff" opacity="0.6" />
      <rect x="25" y="45" width="20" height="3" fill="#fff" opacity="0.6" />
      <rect x="25" y="55" width="20" height="3" fill="#fff" opacity="0.6" />
      <rect x="55" y="35" width="20" height="3" fill="#fff" opacity="0.6" />
      <rect x="55" y="45" width="20" height="3" fill="#fff" opacity="0.6" />
      <rect x="55" y="55" width="20" height="3" fill="#fff" opacity="0.6" />
    </svg>
  ),

  ball: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#fff" stroke="#212121" strokeWidth="3" />
      <path d="M 50 15 L 50 85 M 15 50 L 85 50 M 25 25 L 75 75 M 75 25 L 25 75" stroke="#212121" strokeWidth="2" />
      <polygon points="50,20 60,40 50,50 40,40" fill="#212121" />
      <polygon points="50,80 60,60 50,50 40,60" fill="#212121" />
    </svg>
  ),

  broom: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="15" width="10" height="45" fill="#8d6e63" stroke="#3e2723" strokeWidth="2" />
      <path d="M 30 60 L 70 60 L 65 90 L 35 90 Z" fill="#ffc107" stroke="#f57f17" strokeWidth="2" />
      <path d="M 35 60 L 38 90 M 45 60 L 47 90 M 55 60 L 53 90 M 65 60 L 62 90" stroke="#f57f17" strokeWidth="1" />
    </svg>
  ),

  // UI
  camera: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="30" width="70" height="50" rx="5" fill="#424242" stroke="#212121" strokeWidth="3" />
      <rect x="35" y="20" width="30" height="12" rx="2" fill="#424242" stroke="#212121" strokeWidth="2" />
      <circle cx="50" cy="55" r="15" fill="#fff" stroke="#212121" strokeWidth="2" />
      <circle cx="50" cy="55" r="10" fill="#0277bd" />
      <circle cx="46" cy="51" r="3" fill="#fff" opacity="0.7" />
      <circle cx="75" cy="38" r="3" fill="#f44336" />
    </svg>
  ),

  check: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3" />
      <path d="M 28 52 L 45 68 L 75 35" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  cross: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#ef5350" stroke="#c62828" strokeWidth="3" />
      <path d="M 30 30 L 70 70 M 70 30 L 30 70" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
    </svg>
  ),

  gift: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="60" height="45" fill="#e91e63" stroke="#880e4f" strokeWidth="3" />
      <rect x="15" y="30" width="70" height="15" fill="#c2185b" stroke="#880e4f" strokeWidth="3" />
      <rect x="45" y="30" width="10" height="55" fill="#fdd835" stroke="#f57f17" strokeWidth="2" />
      <path d="M 35 30 Q 50 10 50 30 Q 50 10 65 30" fill="#4fc3f7" stroke="#0277bd" strokeWidth="2" />
    </svg>
  ),

  heart: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 85 L 15 50 Q 5 30 25 25 Q 40 25 50 40 Q 60 25 75 25 Q 95 30 85 50 Z" fill="#e91e63" stroke="#880e4f" strokeWidth="3" />
    </svg>
  ),

  chart: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="70" height="70" fill="#fff" stroke="#3e2723" strokeWidth="3" />
      <rect x="25" y="55" width="10" height="25" fill="#66bb6a" />
      <rect x="40" y="40" width="10" height="40" fill="#66bb6a" />
      <rect x="55" y="30" width="10" height="50" fill="#66bb6a" />
      <rect x="70" y="20" width="10" height="60" fill="#ffd600" />
    </svg>
  ),

  list: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="70" height="60" rx="5" fill="#fff8e1" stroke="#5d4037" strokeWidth="3" />
      <line x1="20" y1="35" x2="80" y2="35" stroke="#5d4037" strokeWidth="2" />
      <line x1="20" y1="50" x2="80" y2="50" stroke="#5d4037" strokeWidth="2" />
      <line x1="20" y1="65" x2="80" y2="65" stroke="#5d4037" strokeWidth="2" />
      <circle cx="28" cy="35" r="3" fill="#66bb6a" />
      <circle cx="28" cy="50" r="3" fill="#66bb6a" />
      <circle cx="28" cy="65" r="3" fill="#66bb6a" />
    </svg>
  ),

  shop: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 15 35 L 25 15 L 75 15 L 85 35 L 85 80 L 15 80 Z" fill="#ffc107" stroke="#5d4037" strokeWidth="3" />
      <rect x="35" y="50" width="30" height="30" fill="#3e2723" />
      <rect x="20" y="40" width="60" height="8" fill="#f57f17" />
      <text x="50" y="72" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="bold">店</text>
    </svg>
  ),

  parent: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="35" r="12" fill="#ffc107" stroke="#5d4037" strokeWidth="2" />
      <circle cx="65" cy="35" r="12" fill="#f48fb1" stroke="#5d4037" strokeWidth="2" />
      <path d="M 20 60 Q 35 50 50 60 Q 65 50 80 60 L 80 90 L 20 90 Z" fill="#9c27b0" stroke="#5d4037" strokeWidth="2" />
      <circle cx="50" cy="75" r="8" fill="#ff9800" stroke="#5d4037" strokeWidth="2" />
    </svg>
  ),

  trophy: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 20 L 70 20 L 65 60 Q 50 70 35 60 Z" fill="#ffc107" stroke="#5d4037" strokeWidth="3" />
      <path d="M 30 25 Q 15 25 15 40 Q 15 50 25 55" fill="none" stroke="#5d4037" strokeWidth="3" />
      <path d="M 70 25 Q 85 25 85 40 Q 85 50 75 55" fill="none" stroke="#5d4037" strokeWidth="3" />
      <rect x="40" y="65" width="20" height="10" fill="#ffc107" stroke="#5d4037" strokeWidth="3" />
      <rect x="30" y="75" width="40" height="8" fill="#ffc107" stroke="#5d4037" strokeWidth="3" />
      <text x="50" y="48" textAnchor="middle" fontSize="20" fill="#5d4037" fontWeight="bold">★</text>
    </svg>
  ),

  leaf: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 80 Q 20 30 80 20 Q 70 70 20 80 Z" fill="#7cb342" stroke="#33691e" strokeWidth="3" />
      <path d="M 20 80 Q 50 50 80 20" stroke="#33691e" strokeWidth="2" fill="none" />
    </svg>
  ),

  fire: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 15 Q 35 30 35 50 Q 35 75 50 85 Q 65 75 65 50 Q 65 30 50 15 Z" fill="#ff5722" stroke="#bf360c" strokeWidth="2" />
      <path d="M 50 35 Q 42 45 42 60 Q 42 70 50 75 Q 58 70 58 60 Q 58 45 50 35 Z" fill="#ffc107" />
    </svg>
  ),

  trophy_star: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#ffd600" stroke="#f57f17" strokeWidth="3" />
      <path d="M 50 25 L 58 45 L 80 45 L 62 58 L 68 78 L 50 65 L 32 78 L 38 58 L 20 45 L 42 45 Z" fill="#fff" stroke="#f57f17" strokeWidth="1.5" />
    </svg>
  ),

  // 房屋
  house: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="45" width="40" height="45" fill="#ffcc80" stroke="#5d4037" strokeWidth="3" />
      <path d="M 20 45 L 50 10 L 80 45 Z" fill="#ef5350" stroke="#5d4037" strokeWidth="3" />
      <rect x="44" y="60" width="14" height="28" fill="#5d4037" rx="2" />
      <rect x="35" y="52" width="12" height="12" fill="#81d4fa" stroke="#5d4037" strokeWidth="2" />
      <rect x="55" y="52" width="12" height="12" fill="#81d4fa" stroke="#5d4037" strokeWidth="2" />
    </svg>
  ),

  // 时钟
  clock: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" />
      <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
}

// 旧版 SVG-only Icon（保留兼容性但不再使用）
// 新版 Icon 函数已在文件顶部，优先使用 emoji