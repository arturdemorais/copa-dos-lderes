import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "@phosphor-icons/react";

export function LeaderInterview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/20 transition-all h-full">
        <motion.div
          aria-hidden
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2,
          }}
        />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Lightbulb
                weight="fill"
                className="text-accent"
                size={24}
              />
            </motion.span>
            Entrevista Pós-Jogo
          </CardTitle>
          <CardDescription>
            Pergunta da semana para o time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl"
              >
                🎤
              </motion.div>
              <div>
                <p className="font-medium text-lg mb-1">
                  "Se sua equipe fosse um time de futebol, qual seria o mascote?"
                </p>
                <p className="text-sm text-muted-foreground">
                  Compartilhe no canal #copa-dos-lideres
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
