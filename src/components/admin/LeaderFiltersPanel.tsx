import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FunnelSimple, X } from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

export interface LeaderFilters {
  team: string;
  trend: string;
  minOverall: number;
  maxOverall: number;
}

interface LeaderFiltersProps {
  leaders: Leader[];
  filters: LeaderFilters;
  onFiltersChange: (filters: LeaderFilters) => void;
}

export const LeaderFiltersPanel = memo(function LeaderFiltersPanel({
  leaders,
  filters,
  onFiltersChange,
}: LeaderFiltersProps) {
  // Extract unique teams
  const teams = Array.from(new Set(leaders.map((l) => l.team))).filter(
    (team) => team !== "Admin"
  );

  const hasActiveFilters =
    filters.team !== "all" ||
    filters.trend !== "all" ||
    filters.minOverall > 0 ||
    filters.maxOverall < 100;

  const handleClearFilters = () => {
    onFiltersChange({
      team: "all",
      trend: "all",
      minOverall: 0,
      maxOverall: 100,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelSimple size={18} weight="fill" className="text-primary" />
          <h3 className="font-semibold text-sm">Filtros</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Ativos
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs"
          >
            <X size={14} className="mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Team Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs">Time</Label>
          <Select
            value={filters.team}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, team: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os times</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trend Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tendência</Label>
          <Select
            value={filters.trend}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, trend: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="rising">📈 Em Ascensão</SelectItem>
              <SelectItem value="stable">➡️ Estável</SelectItem>
              <SelectItem value="falling">📉 Em Queda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Overall Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overall Mínimo</Label>
          <Select
            value={filters.minOverall.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, minOverall: parseInt(value) })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 pts</SelectItem>
              <SelectItem value="25">25 pts</SelectItem>
              <SelectItem value="50">50 pts</SelectItem>
              <SelectItem value="75">75 pts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Overall Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overall Máximo</Label>
          <Select
            value={filters.maxOverall.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, maxOverall: parseInt(value) })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 pts</SelectItem>
              <SelectItem value="50">50 pts</SelectItem>
              <SelectItem value="75">75 pts</SelectItem>
              <SelectItem value="100">100 pts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground w-full mb-1">
            Filtros ativos:
          </p>
          {filters.team !== "all" && (
            <Badge variant="outline" className="text-xs">
              Time: {filters.team}
            </Badge>
          )}
          {filters.trend !== "all" && (
            <Badge variant="outline" className="text-xs">
              Tendência:{" "}
              {filters.trend === "rising"
                ? "Ascensão"
                : filters.trend === "falling"
                  ? "Queda"
                  : "Estável"}
            </Badge>
          )}
          {filters.minOverall > 0 && (
            <Badge variant="outline" className="text-xs">
              Min: {filters.minOverall} pts
            </Badge>
          )}
          {filters.maxOverall < 100 && (
            <Badge variant="outline" className="text-xs">
              Max: {filters.maxOverall} pts
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});
