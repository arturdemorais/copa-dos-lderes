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
import { VideoCamera, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { varService, type VarRequest } from "@/lib/services";

interface VarHistoryCardProps {
  leaderId: string;
}

export function VarHistoryCard({ leaderId }: VarHistoryCardProps) {
  const [requests, setRequests] = useState<VarRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [leaderId]);

  const loadRequests = async () => {
    try {
      const data = await varService.getLeaderRequests(leaderId);
      setRequests(data.slice(0, 5)); // Mostrar últimos 5
    } catch (error) {
      console.error("Error loading VAR requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle size={12} weight="fill" className="mr-1" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle size={12} weight="fill" className="mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            <Clock size={12} weight="fill" className="mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "ritual_absence" ? "⚽ Ausência Ritual" : "⏱️ Atraso Tarefa";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <VideoCamera weight="fill" size={20} className="text-blue-600" />
            Meus VARs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <VideoCamera weight="fill" size={20} className="text-blue-600" />
            Meus VARs
          </CardTitle>
          <CardDescription>Histórico de solicitações de revisão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <VideoCamera size={48} weight="duotone" className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitação de VAR ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <VideoCamera weight="fill" size={20} className="text-blue-600" />
          Meus VARs
        </CardTitle>
        <CardDescription>
          Últimas {requests.length} solicitações de revisão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request, idx) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getTypeLabel(request.requestType)}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm line-clamp-2">{request.reason}</p>
                </div>
                {request.pointsAtRisk > 0 && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {request.pointsAtRisk} pts
                  </Badge>
                )}
              </div>

              {request.adminResponse && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                  <p className="font-medium text-muted-foreground mb-1">
                    Resposta do Árbitro:
                  </p>
                  <p className="text-foreground">{request.adminResponse}</p>
                </div>
              )}

              <div className="mt-2 text-[10px] text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
