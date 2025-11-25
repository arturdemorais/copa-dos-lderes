import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lightning, Star, Fire, Medal } from "@phosphor-icons/react";

interface GoalCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: "task" | "badge" | "level-up" | "coins" | "champion";
  points?: number;
  message?: string;
}

export function GoalCelebration({
  trigger,
  onComplete,
  type = "task",
  points = 0,
  message,
}: GoalCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  const celebrationConfig = {
    task: {
      icon: "⚽",
      text: "GOL!",
      color: "from-green-400 to-emerald-600",
      particles: 30,
      sound: "⚽",
    },
    badge: {
      icon: <Medal weight="fill" size={64} className="text-yellow-400" />,
      text: "CONQUISTA!",
      color: "from-yellow-400 to-orange-500",
      particles: 50,
      sound: "🏆",
    },
    "level-up": {
      icon: <Star weight="fill" size={64} className="text-purple-400" />,
      text: "SUBIU DE NÍVEL!",
      color: "from-purple-400 to-pink-500",
      particles: 60,
      sound: "⭐",
    },
    coins: {
      icon: "🪙",
      text: "VORP COINS!",
      color: "from-amber-400 to-yellow-600",
      particles: 40,
      sound: "💰",
    },
    champion: {
      icon: <Trophy weight="fill" size={80} className="text-yellow-300" />,
      text: "CAMPEÃO!",
      color: "from-yellow-300 via-yellow-500 to-orange-600",
      particles: 100,
      sound: "👑",
    },
  };

  const config = celebrationConfig[type];

  // Partículas animadas
  const particles = Array.from({ length: config.particles }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    scale: 0.5 + Math.random() * 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {/* Background Flash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${config.color}`}
        />

        {/* Fireworks Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: "50vw",
              y: "50vh",
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `${particle.x}vw`,
              y: "-20vh",
              scale: particle.scale,
              opacity: 0,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
            className="absolute"
          >
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-br ${config.color} shadow-glow-lg`}
            />
          </motion.div>
        ))}

        {/* Central Animation */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: "easeOut",
            }}
            className="mb-4 flex justify-center"
          >
            <div className="text-8xl drop-shadow-2xl">{config.icon}</div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className={`text-6xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent drop-shadow-2xl mb-2`}
          >
            {config.text}
          </motion.div>

          {/* Points */}
          {points > 0 && (
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center justify-center gap-2"
            >
              <Lightning weight="fill" size={32} className="text-yellow-400" />
              <span className="text-5xl font-black text-white drop-shadow-lg">
                +{points}
              </span>
            </motion.div>
          )}

          {/* Custom Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="text-2xl font-bold text-white drop-shadow-lg mt-4 px-8"
            >
              {message}
            </motion.div>
          )}

          {/* Expanding Rings */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-white`}
          />
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-white`}
          />
        </div>

        {/* Sparkles around the screen */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 1.5,
              delay: Math.random() * 0.5,
              ease: "easeInOut",
            }}
            className="absolute"
          >
            <Star
              weight="fill"
              size={24}
              className="text-yellow-300 drop-shadow-glow-lg"
            />
          </motion.div>
        ))}

        {/* Fire Trail Effect for special celebrations */}
        {(type === "champion" || type === "level-up") && (
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <svg
              width="100%"
              height="100%"
              className="absolute inset-0"
              style={{ overflow: "visible" }}
            >
              <motion.circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0, rotate: 0 }}
                animate={{ pathLength: 1, rotate: 360 }}
                transition={{ duration: 2, ease: "linear" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
