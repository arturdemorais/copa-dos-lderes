import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Gear, Info } from "@phosphor-icons/react";
import {
  configService,
  type ScoringConfig,
  DEFAULT_SCORING_CONFIG,
} from "@/lib/services/configService";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ScoringConfigPanel() {
  const [config, setConfig] = useState<ScoringConfig>(DEFAULT_SCORING_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await configService.getConfig();
      // Ensure multipliers exist (for migration)
      if (!data.multipliers) {
        data.multipliers = DEFAULT_SCORING_CONFIG.multipliers;
      }
      setConfig(data);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await configService.updateConfig(config);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof ScoringConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleMultiplierChange = (
    key: keyof ScoringConfig["multipliers"],
    value: number[]
  ) => {
    setConfig((prev) => ({
      ...prev,
      multipliers: {
        ...prev.multipliers,
        [key]: value[0],
      },
    }));
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear weight="fill" size={24} className="text-primary" />
            Configuração de Pontuação
          </CardTitle>
          <CardDescription>
            Defina quantos pontos cada ação vale no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="assist_points">Pontos por Assistência (Kudos)</Label>
              <Input
                id="assist_points"
                type="number"
                value={config.assist_points}
                onChange={(e) => handleChange("assist_points", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pontos ganhos ao receber um feedback positivo de um colega.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ritual_max_points">Pontos Máximos de Ritual</Label>
              <Input
                id="ritual_max_points"
                type="number"
                value={config.ritual_max_points}
                onChange={(e) =>
                  handleChange("ritual_max_points", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Pontos máximos mensais baseados na frequência em rituais.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energy_checkin_points">
                Pontos por Check-in de Energia
              </Label>
              <Input
                id="energy_checkin_points"
                type="number"
                value={config.energy_checkin_points}
                onChange={(e) =>
                  handleChange("energy_checkin_points", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Pontos ganhos ao realizar o check-in diário de energia.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anonymous_feedback_points_sender">
                Feedback Anônimo (Enviador)
              </Label>
              <Input
                id="anonymous_feedback_points_sender"
                type="number"
                value={config.anonymous_feedback_points_sender}
                onChange={(e) =>
                  handleChange("anonymous_feedback_points_sender", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Pontos que o líder ganha ao ENVIAR um feedback anônimo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anonymous_feedback_coins_sender">
                Vorp Coins por Feedback
              </Label>
              <Input
                id="anonymous_feedback_coins_sender"
                type="number"
                value={config.anonymous_feedback_coins_sender}
                onChange={(e) =>
                  handleChange("anonymous_feedback_coins_sender", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Moedas que o líder ganha ao ENVIAR um feedback anônimo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Multiplicadores de Overall
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={18} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Estes multiplicadores afetam o cálculo do Score Geral
                    (Overall). Aumente para dar mais peso a uma categoria.
                    Padrão: 1.0
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Ajuste o peso de cada categoria no cálculo final do Overall.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Peso das Tasks (x{config.multipliers.tasks})</Label>
              <span className="text-sm text-muted-foreground">
                Impacto: {Math.round(config.multipliers.tasks * 100)}%
              </span>
            </div>
            <Slider
              value={[config.multipliers.tasks]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(val) => handleMultiplierChange("tasks", val)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Peso das Assistências (x{config.multipliers.assists})</Label>
              <span className="text-sm text-muted-foreground">
                Impacto: {Math.round(config.multipliers.assists * 100)}%
              </span>
            </div>
            <Slider
              value={[config.multipliers.assists]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(val) => handleMultiplierChange("assists", val)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Peso dos Rituais (x{config.multipliers.rituals})</Label>
              <span className="text-sm text-muted-foreground">
                Impacto: {Math.round(config.multipliers.rituals * 100)}%
              </span>
            </div>
            <Slider
              value={[config.multipliers.rituals]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(val) => handleMultiplierChange("rituals", val)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>
                Peso da Consistência (x{config.multipliers.consistency})
              </Label>
              <span className="text-sm text-muted-foreground">
                Impacto: {Math.round(config.multipliers.consistency * 100)}%
              </span>
            </div>
            <Slider
              value={[config.multipliers.consistency]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(val) =>
                handleMultiplierChange("consistency", val)
              }
            />
            <p className="text-xs text-muted-foreground">
              A consistência é um valor de 0 a 100. Multiplicador 1.0 adiciona
              até 100 pontos ao overall.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? "Salvando..." : "Salvar Todas as Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
