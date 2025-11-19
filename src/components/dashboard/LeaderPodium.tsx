import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Star } from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface LeaderPodiumProps {
  topThreeLeaders: Leader[];
}

export function LeaderPodium({ topThreeLeaders }: LeaderPodiumProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Trophy weight="fill" className="text-accent" size={24} />
          Estádio - Top 3
        </CardTitle>
        <CardDescription>
          Os melhores técnicos da temporada
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {topThreeLeaders.map((leader, idx) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, x: 6 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors group"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className={`
                  text-2xl font-bold w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    idx === 0
                      ? "bg-accent text-accent-foreground shadow-lg shadow-accent/40"
                      : ""
                  }
                  ${
                    idx === 1
                      ? "bg-muted-foreground/20 text-foreground"
                      : ""
                  }
                  ${idx === 2 ? "bg-primary/20 text-primary" : ""}
                `}
              >
                {idx + 1}
              </motion.div>
              <div className="flex-1">
                <p className="font-medium">{leader.name}</p>
                <p className="text-xs text-muted-foreground">
                  {leader.team}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {leader.overall ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
              {idx === 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Star
                    weight="fill"
                    className="text-accent"
                    size={20}
                  />
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
