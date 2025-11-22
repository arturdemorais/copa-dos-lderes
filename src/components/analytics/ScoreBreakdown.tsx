import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import type { Leader } from "@/lib/types";
import { calculateOverallScore } from "@/lib/scoring";

interface ScoreBreakdownProps {
  leader: Leader;
}

export function ScoreBreakdown({ leader }: ScoreBreakdownProps) {
  const components = [
    {
      name: "Tarefas Completadas",
      value: leader.taskPoints ?? 0,
      contribution: leader.taskPoints ?? 0,
      color: "bg-primary",
      description: "Pontos ganhos completando tarefas semanais (Gols de Placa)",
    },
    {
      name: "Nota da Torcida",
      value: leader.fanScore ?? 0,
      contribution: leader.fanScore ?? 0,
      color: "bg-accent",
      description: "Pontos de feedback do seu time sobre liderança e suporte",
    },
    {
      name: "Assistências",
      value: leader.assistPoints ?? 0,
      contribution: leader.assistPoints ?? 0,
      color: "bg-secondary",
      description: "Pontos por reconhecer e avaliar outros técnicos",
    },
    {
      name: "Presença em Rituais",
      value: leader.ritualPoints ?? 0,
      contribution: leader.ritualPoints ?? 0,
      color: "bg-primary/70",
      description: "Pontos por participar de rituais e eventos da empresa",
    },
  ];

  const totalContribution = components.reduce(
    (sum, c) => sum + c.contribution,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição do Overall</CardTitle>
        <CardDescription>Entenda como seu score é calculado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Overall Score
              </div>
              <div className="text-4xl font-bold">{leader.overall ?? 0}</div>
            </div>
            <Badge variant="outline" className="text-sm">
              Total de Pontos
            </Badge>
          </div>

          <div className="space-y-3">
            {components.map((component, idx) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {component.name}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Info size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">{component.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      +{Math.round(component.contribution)} pts
                    </span>
                  </div>
                </div>

                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (component.contribution / totalContribution) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full ${component.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Como melhorar seu score:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {(leader.taskPoints ?? 0) < 100 && (
                  <li>Complete mais tarefas semanais para somar pontos</li>
                )}
                {(leader.fanScore ?? 0) < 50 && (
                  <li>Melhore o feedback do time para ganhar mais pontos</li>
                )}
                {(leader.assistPoints ?? 0) < 30 && (
                  <li>
                    Avalie outros técnicos para ganhar pontos de assistência
                  </li>
                )}
                {(leader.ritualPoints ?? 0) < 50 && (
                  <li>Participe de mais rituais da empresa</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
