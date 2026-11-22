import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as bigSmile from '@dicebear/big-smile'
import './avatar.css'

const BACKGROUNDS = ['c7e7ff', 'd5f5ee', 'e9e3ff', 'ffe9c7', 'ffd9e3', 'd9f0ff']
const cache = new Map<string, string>()

/** Generate (and memoise) a friendly cartoon avatar locally — no network calls. */
export function avatarUri(seed: string) {
  let uri = cache.get(seed)
  if (!uri) {
    uri = createAvatar(bigSmile, { seed, backgroundColor: BACKGROUNDS, radius: 50 }).toDataUri()
    cache.set(seed, uri)
  }
  return uri
}

interface AvatarProps {
  seed: string
  name: string
  size?: number
  ring?: boolean
}

export function Avatar({ seed, name, size = 40, ring }: AvatarProps) {
  const src = useMemo(() => avatarUri(seed || 'student'), [seed])
  return (
    <span className={`avatar${ring ? ' avatar-ring' : ''}`} style={{ width: size, height: size }}>
      <img src={src} alt={`${name}'s avatar`} width={size} height={size} draggable={false} />
    </span>
  )
}
