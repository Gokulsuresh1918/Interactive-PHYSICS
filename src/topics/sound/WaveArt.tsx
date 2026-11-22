/** Small static waveform illustration used on answer cards. */
export function WaveArt({ cycles, amp, color = '#e64980' }: { cycles: number; amp: number; color?: string }) {
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = (i / 120) * 160
    const y = 35 - Math.sin((i / 120) * cycles * Math.PI * 2) * amp * 28
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 160 70" aria-hidden="true">
      <line x1="0" y1="35" x2="160" y2="35" stroke="#e4ecf5" strokeWidth="2" />
      <path d={pts} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}
