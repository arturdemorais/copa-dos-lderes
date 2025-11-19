import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!show) return null

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    rotation: Math.random() * 360,
    color: ['#1E8A4C', '#FFD700', '#00529B', '#FF6B6B'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {confettiPieces.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ 
              x: piece.x, 
              y: -20, 
              rotate: 0,
              opacity: 1,
              scale: 1
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: piece.rotation,
              opacity: 0,
              scale: 0.5
            }}
            transition={{ 
              duration: 2,
              ease: 'easeIn'
            }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: piece.color,
              borderRadius: '2px'
            }}
          />
        ))}
      </AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="text-6xl font-bold text-primary drop-shadow-lg">
          GOL! ⚽
        </div>
      </motion.div>
    </div>
  )
}
