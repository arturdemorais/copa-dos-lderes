import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VideoCamera,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
} from "@phosphor-icons/react";
import { varService, type VarRequest } from "@/lib/services";
import { toast } from "sonner";

interface VarAdminPanelProps {
  adminId: string;
}

export function VarAdminPanel({ adminId }: VarAdminPanelProps) {
  const [requests, setRequests] = useState<VarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminResponses, setAdminResponses] = useState<Record<string, string>>(
    {}
  );
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const status =
        activeTab === "all"
          ? undefined
          : (activeTab as "pending" | "approved" | "rejected");
      const data = await varService.getAllRequests(status);
      setRequests(data);
    } catch (error) {
      console.error("Error loading VAR requests:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await varService.approveRequest(
        requestId,
        adminId,
        adminResponses[requestId] || undefined
      );
      toast.success("VAR aprovado! ✅", {
        description: "O líder não perderá pontos",
      });
      loadRequests();
    } catch (error: any) {
      console.error("Error approving VAR:", error);
      toast.error(error.message || "Erro ao aprovar VAR");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!adminResponses[requestId]?.trim()) {
      toast.error("Adicione um comentário explicando a rejeição");
      return;
    }

    setProcessing(requestId);
    try {
      await varService.rejectRequest(
        requestId,
        adminId,
        adminResponses[requestId]
      );
      toast.success("VAR rejeitado! ❌", {
        description: "Pontos foram descontados",
      });
      loadRequests();
    } catch (error: any) {
      console.error("Error rejecting VAR:", error);
      toast.error(error.message || "Erro ao rejeitar VAR");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle size={14} weight="fill" className="mr-1" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle size={14} weight="fill" className="mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            <Clock size={14} weight="fill" className="mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "ritual_absence"
      ? "⚽ Ausência em Ritual"
      : "⏱️ Atraso em Tarefa";
  };

  const renderRequest = (request: any, idx: number) => (
    <motion.div
      key={request.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="p-4 rounded-lg border bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">
              {request.leader?.name || "Líder Desconhecido"}
            </h3>
            {getStatusBadge(request.status)}
            <Badge variant="secondary" className="text-xs">
              {request.leader?.team || "Sem time"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getTypeLabel(request.requestType)}</span>
            <span>•</span>
            <span>
              {new Date(request.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {request.pointsAtRisk > 0 && (
          <Badge variant="outline" className="flex-shrink-0">
            <Warning size={14} className="mr-1" />
            {request.pointsAtRisk} pts
          </Badge>
        )}
      </div>

      {/* Contexto */}
      {(request.ritual || request.task) && (
        <div className="mb-3 p-2 bg-muted/50 rounded text-sm">
          <p className="font-medium text-muted-foreground mb-1">Referência:</p>
          {request.ritual && (
            <p>
              {request.ritual.name} -{" "}
              {new Date(request.ritual.date).toLocaleDateString("pt-BR")}
            </p>
          )}
          {request.task && <p>{request.task.title}</p>}
        </div>
      )}

      {/* Justificativa do líder */}
      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
        <p className="font-medium text-sm mb-1">Justificativa do Líder:</p>
        <p className="text-sm">{request.reason}</p>
        {request.evidenceUrl && (
          <a
            href={request.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
          >
            📎 Ver comprovante
          </a>
        )}
      </div>

      {/* Resposta do admin (se já revisado) */}
      {request.status !== "pending" && request.adminResponse && (
        <div className="mb-3 p-3 bg-muted rounded">
          <p className="font-medium text-sm mb-1">Resposta do Árbitro:</p>
          <p className="text-sm">{request.adminResponse}</p>
        </div>
      )}

      {/* Ações (somente para pendentes) */}
      {request.status === "pending" && (
        <div className="space-y-3 pt-3 border-t">
          <Textarea
            placeholder="Adicionar comentário (opcional para aprovação, obrigatório para rejeição)"
            value={adminResponses[request.id] || ""}
            onChange={(e) =>
              setAdminResponses((prev) => ({
                ...prev,
                [request.id]: e.target.value,
              }))
            }
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleApprove(request.id)}
              disabled={processing === request.id}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} weight="fill" className="mr-2" />
              {processing === request.id ? "Aprovando..." : "Aprovar VAR"}
            </Button>
            <Button
              onClick={() => handleReject(request.id)}
              disabled={processing === request.id}
              variant="destructive"
              className="flex-1"
            >
              <XCircle size={16} weight="fill" className="mr-2" />
              {processing === request.id ? "Rejeitando..." : "Rejeitar VAR"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoCamera weight="fill" size={24} className="text-blue-600" />
          Sistema VAR - Revisão de Solicitações
        </CardTitle>
        <CardDescription>
          Analise e decida sobre justificativas de ausências e atrasos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pendentes{" "}
              {requests.filter((r) => r.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {requests.filter((r) => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando solicitações...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <VideoCamera
                  size={64}
                  weight="duotone"
                  className="mx-auto text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">
                  Nenhuma solicitação{" "}
                  {activeTab !== "all" && `(${activeTab})`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request, idx) => renderRequest(request, idx))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
