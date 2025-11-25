import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClockClockwise, FunnelSimple } from "@phosphor-icons/react";
import { activityLogService, type ActivityLog, type ActivityCategory } from "@/lib/services";

interface ActivityTimelineProps {
  leaderId?: string; // Se fornecido, filtra por líder
  limit?: number;
}

export function ActivityTimeline({ leaderId, limit = 100 }: ActivityTimelineProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLogs();
  }, [leaderId, filterCategory]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const filters: any = { limit };
      if (leaderId) filters.leaderId = leaderId;
      if (filterCategory !== "all") filters.category = filterCategory;

      const data = await activityLogService.getLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error("Error loading activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.description.toLowerCase().includes(search) ||
      log.leaderName?.toLowerCase().includes(search) ||
      log.actionType.toLowerCase().includes(search)
    );
  });

  const groupedByDate = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.createdAt).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockClockwise weight="fill" size={24} className="text-primary" />
          Timeline de Atividades
        </CardTitle>
        <CardDescription>
          Histórico completo de ações dos líderes para auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <div className="space-y-2">
            <Label className="text-xs">Buscar</Label>
            <Input
              placeholder="Buscar por descrição, líder ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={filterCategory}
              onValueChange={(v) => setFilterCategory(v as ActivityCategory | "all")}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="task">⚽ Tarefas</SelectItem>
                <SelectItem value="feedback">💬 Feedbacks</SelectItem>
                <SelectItem value="var">📹 VARs</SelectItem>
                <SelectItem value="coins">🪙 Vorp Coins</SelectItem>
                <SelectItem value="energy">⚡ Energia</SelectItem>
                <SelectItem value="mood">😊 Humor</SelectItem>
                <SelectItem value="ritual">🏟️ Rituais</SelectItem>
                <SelectItem value="store">🛍️ Loja</SelectItem>
                <SelectItem value="evaluation">⭐ Avaliações</SelectItem>
                <SelectItem value="admin">👑 Admin</SelectItem>
                <SelectItem value="auth">🔐 Autenticação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[600px] pr-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Carregando timeline...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClockClockwise
                size={64}
                weight="duotone"
                className="mx-auto text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, dayLogs], dateIdx) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIdx * 0.05 }}
                >
                  {/* Date Header */}
                  <div className="sticky top-0 bg-background pb-2 mb-3 border-b">
                    <h3 className="font-semibold text-sm capitalize">{date}</h3>
                    <p className="text-xs text-muted-foreground">
                      {dayLogs.length} atividade{dayLogs.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Logs do dia */}
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    {dayLogs.map((log, idx) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="relative pl-6 pb-3"
                      >
                        {/* Ícone de categoria */}
                        <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs">
                          {activityLogService.getCategoryIcon(log.actionCategory)}
                        </div>

                        {/* Conteúdo */}
                        <div className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {!leaderId && log.leaderName && (
                                  <span className="font-medium text-sm">
                                    {log.leaderName}
                                  </span>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {activityLogService.translateCategory(log.actionCategory)}
                                </Badge>
                              </div>
                              <p className="text-sm">{log.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(log.createdAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Metadata (se existir) */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <details>
                                <summary className="cursor-pointer font-medium text-muted-foreground">
                                  Detalhes técnicos
                                </summary>
                                <pre className="mt-2 text-[10px] overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Ações */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredLogs.length} de {logs.length} atividades
          </p>
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <ClockClockwise size={16} className="mr-2" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
