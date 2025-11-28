import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ritualService, leaderService } from "@/lib/services";
import type { Leader, Ritual, AttendanceStatus } from "@/lib/types";

interface RitualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaders: Leader[];
  rituals: Ritual[];
  onSuccess?: () => void;
}

export function RitualAttendanceModal({
  isOpen,
  onClose,
  leaders,
  rituals,
  onSuccess,
}: RitualAttendanceModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRitual, setSelectedRitual] = useState<string>("");
  const [attendances, setAttendances] = useState<Map<string, AttendanceStatus>>(
    new Map()
  );
  const [saving, setSaving] = useState(false);

  const handleAttendanceClick = (
    leaderId: string,
    status: AttendanceStatus
  ) => {
    setAttendances((prev) => {
      const newMap = new Map(prev);
      newMap.set(leaderId, status);
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!selectedRitual) {
      toast.error("Selecione um ritual!");
      return;
    }

    if (attendances.size === 0) {
      toast.error("Marque a presença de pelo menos um líder!");
      return;
    }

    setSaving(true);
    try {
      // 1. Create ritual instance for this date
      const ritual = rituals.find((r) => r.id === selectedRitual);
      if (!ritual) return;

      let ritualInstanceId = selectedRitual;
      try {
        const createdRitual = await ritualService.create(
          ritual.name,
          ritual.type,
          selectedDate
        );
        ritualInstanceId = createdRitual.id;
      } catch (error) {
        // Ritual já existe, buscar ID
        const existingRituals = await ritualService.getByDate(selectedDate);
        const existing = existingRituals.find((r) => r.name === ritual.name);
        if (existing) {
          ritualInstanceId = existing.id;
        }
      }

      // 2. Mark attendance for all selected leaders
      const promises: Promise<void>[] = [];
      attendances.forEach((status, leaderId) => {
        promises.push(
          ritualService.markAttendance(ritualInstanceId, leaderId, status)
        );
      });

      await Promise.all(promises);

      // 3. Recalculate ritual points for all affected leaders
      const recalcPromises = Array.from(attendances.keys()).map(
        async (leaderId) => {
          const points = await ritualService.calculateRitualPoints(leaderId);
          return leaderService.update(leaderId, { ritualPoints: points });
        }
      );

      await Promise.all(recalcPromises);

      toast.success(
        `Presença registrada com sucesso! ${attendances.size} líderes atualizados.`
      );

      // Reset form
      setSelectedRitual("");
      setAttendances(new Map());
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Erro ao registrar presença");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return (
          <CheckCircle size={16} weight="fill" className="text-green-500" />
        );
      case "late":
        return <Clock size={16} weight="fill" className="text-yellow-500" />;
      case "absent":
        return <XCircle size={16} weight="fill" className="text-red-500" />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "Presente";
      case "late":
        return "Atrasado";
      case "absent":
        return "Ausente";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[60vw] max-w-[1400px]! h-[95vh] flex flex-col sm:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>Registrar Presença em Ritual</DialogTitle>
          <DialogDescription>
            Selecione o ritual e marque a presença de cada líder de forma rápida
            e prática
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
          {/* Date and Ritual Selection */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="space-y-2">
              <Label htmlFor="date">Data do Ritual</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ritual">Tipo de Ritual</Label>
              <Select value={selectedRitual} onValueChange={setSelectedRitual}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ritual..." />
                </SelectTrigger>
                <SelectContent>
                  {rituals.map((ritual) => (
                    <SelectItem key={ritual.id} value={ritual.id}>
                      {ritual.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leader List */}
          {selectedRitual && (
            <>
              <div className="border-t pt-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-semibold">
                    Marque a presença ({attendances.size}/
                    {leaders.filter((l) => !l.isAdmin).length})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMap = new Map<string, AttendanceStatus>();
                        leaders
                          .filter((l) => !l.isAdmin)
                          .forEach((l) => newMap.set(l.id, "present"));
                        setAttendances(newMap);
                      }}
                    >
                      Todos Presentes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAttendances(new Map())}
                    >
                      Limpar Tudo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pr-2">
                  {leaders
                    .filter((leader) => !leader.isAdmin)
                    .map((leader) => {
                      const currentStatus = attendances.get(leader.id);

                      return (
                        <div
                          key={leader.id}
                          className={`
                            p-4 rounded-lg border transition-all space-y-3 min-w-[300px]
                            ${
                              currentStatus
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }
                          `}
                        >
                          {/* Leader Info */}
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 shrink-0">
                              <AvatarImage
                                src={leader.photo}
                                alt={leader.name}
                              />
                              <AvatarFallback>
                                {leader.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base">
                                {leader.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {leader.team} • {leader.position}
                              </p>
                            </div>
                          </div>

                          {/* Status Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t">
                            {currentStatus && (
                              <Badge variant="secondary" className="px-2 py-1">
                                {getStatusIcon(currentStatus)}
                                <span className="ml-1.5 text-xs">
                                  {getStatusLabel(currentStatus)}
                                </span>
                              </Badge>
                            )}
                            {!currentStatus && <div className="flex-1" />}

                            <div className="flex items-center gap-1">
                              <Button
                                variant={
                                  currentStatus === "present"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleAttendanceClick(leader.id, "present")
                                }
                                className="h-9 px-3 gap-1.5"
                              >
                                <CheckCircle size={16} weight="fill" />
                                <span className="text-xs">Presente</span>
                              </Button>

                              <Button
                                variant={
                                  currentStatus === "late"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleAttendanceClick(leader.id, "late")
                                }
                                className="h-9 px-3 gap-1.5"
                              >
                                <Clock size={16} weight="fill" />
                                <span className="text-xs">Atrasado</span>
                              </Button>

                              <Button
                                variant={
                                  currentStatus === "absent"
                                    ? "destructive"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleAttendanceClick(leader.id, "absent")
                                }
                                className="h-9 px-3 gap-1.5"
                              >
                                <XCircle size={16} weight="fill" />
                                <span className="text-xs">Ausente</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground shrink-0">
                <p>
                  <strong>Legenda:</strong> Presente = 1.0 ponto | Atrasado =
                  0.5 ponto | Ausente = 0 pontos
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || attendances.size === 0}
          >
            {saving ? "Salvando..." : `Salvar Presença (${attendances.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
