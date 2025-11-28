import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, XCircle, CalendarBlank } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import type { Leader } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RitualSummaryData {
  ritualName: string;
  ritualDate: string;
  totalLeaders: number;
  present: number;
  late: number;
  absent: number;
}

interface RitualAttendanceSummaryProps {
  leaders: Leader[];
}

export function RitualAttendanceSummary({ leaders }: RitualAttendanceSummaryProps) {
  const [summaryData, setSummaryData] = useState<RitualSummaryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRitualSummary();
  }, [leaders]);

  const loadRitualSummary = async () => {
    try {
      setLoading(true);

      // Buscar rituais dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: rituals, error: ritualsError } = await supabase
        .from("rituals")
        .select("id, name, date")
        .gte("date", startDate)
        .order("date", { ascending: false })
        .limit(10);

      if (ritualsError) throw ritualsError;

      if (!rituals || rituals.length === 0) {
        setSummaryData([]);
        return;
      }

      // Buscar todas as presenças desses rituais
      const { data: attendances, error: attendancesError } = await supabase
        .from("ritual_attendance")
        .select("ritual_id, status")
        .in(
          "ritual_id",
          rituals.map((r) => r.id)
        );

      if (attendancesError) throw attendancesError;

      // Calcular resumo para cada ritual
      const nonAdminLeaders = leaders.filter((l) => !l.isAdmin);
      const summary: RitualSummaryData[] = rituals.map((ritual) => {
        const ritualAttendances = (attendances || []).filter(
          (a) => a.ritual_id === ritual.id
        );

        const present = ritualAttendances.filter((a) => a.status === "present").length;
        const late = ritualAttendances.filter((a) => a.status === "late").length;
        const absent = nonAdminLeaders.length - present - late;

        return {
          ritualName: ritual.name,
          ritualDate: ritual.date,
          totalLeaders: nonAdminLeaders.length,
          present,
          late,
          absent,
        };
      });

      setSummaryData(summary);
    } catch (error) {
      console.error("Error loading ritual summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAttendanceRate = (data: RitualSummaryData) => {
    const score = data.present + data.late * 0.5;
    const rate = (score / data.totalLeaders) * 100;
    return Math.round(rate);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Presenças</CardTitle>
          <CardDescription>Últimos 10 rituais registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summaryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Presenças</CardTitle>
          <CardDescription>Últimos 10 rituais registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CalendarBlank size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum ritual registrado nos últimos 30 dias
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Presenças</CardTitle>
        <CardDescription>Últimos 10 rituais registrados (30 dias)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ritual</TableHead>
                <TableHead className="text-center">Presentes</TableHead>
                <TableHead className="text-center">Atrasados</TableHead>
                <TableHead className="text-center">Ausentes</TableHead>
                <TableHead className="text-right">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((data, index) => {
                const rate = calculateAttendanceRate(data);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatDate(data.ritualDate)}
                    </TableCell>
                    <TableCell>{data.ritualName}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle size={16} weight="fill" className="text-green-500" />
                        <span className="font-medium">{data.present}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={16} weight="fill" className="text-yellow-500" />
                        <span className="font-medium">{data.late}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle size={16} weight="fill" className="text-red-500" />
                        <span className="font-medium">{data.absent}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          rate >= 80
                            ? "default"
                            : rate >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p>
            <strong>Taxa de presença:</strong> calculada como (Presentes + Atrasados × 0.5) ÷ Total de Líderes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
