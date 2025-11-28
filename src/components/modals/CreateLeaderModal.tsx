import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  User,
  EnvelopeSimple,
  Lock,
  Users,
  Briefcase,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { authService } from "@/lib/services";
import { uploadProfilePhoto } from "@/lib/services/leaderService";
import { LeaderPhotoUpload } from "@/components/admin/forms";

interface CreateLeaderModalProps {
  onSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const teams = [
  "Comercial",
  "Produto",
  "Tecnologia",
  "Marketing",
  "Operações",
  "Financeiro",
  "RH",
];

const positions = [
  "Gerente",
  "Coordenador",
  "Líder de Time",
  "Tech Lead",
  "Product Owner",
  "Scrum Master",
];

export function CreateLeaderModal({
  onSuccess,
  onClose,
  isOpen,
}: CreateLeaderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    team: "",
    position: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.team ||
      !formData.position
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Usar createLeaderAsAdmin para não deslogar o admin
      const result = await authService.createLeaderAsAdmin(
        formData.email,
        formData.password,
        formData.name,
        formData.team,
        formData.position
      );

      // Upload photo if provided
      if (photoFile && result.leader?.id) {
        try {
          const photoUrl = await uploadProfilePhoto(
            photoFile,
            result.leader.id
          );
          // Update leader with photo URL
          await authService.updateLeaderPhoto(result.leader.id, photoUrl);
        } catch (photoError) {
          console.error("Error uploading photo:", photoError);
          // Don't fail the whole operation if photo upload fails
          toast.warning("Líder criado, mas houve erro ao fazer upload da foto");
        }
      }

      toast.success("Líder cadastrado com sucesso! 🎉", {
        description: "Envie as credenciais para o líder",
      });

      // Limpar form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        team: "",
        position: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.message || "Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3"
          >
            <Trophy weight="fill" size={24} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">Cadastrar Novo Líder</h2>
          <p className="text-sm text-muted-foreground">
            Crie uma conta para um novo líder do time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Section */}
          <div className="pb-4 border-b">
            <LeaderPhotoUpload
              leaderName={formData.name}
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handleRemovePhoto}
              photoPreview={photoPreview}
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-muted-foreground"
                size={18}
              />
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <EnvelopeSimple
                className="absolute left-3 top-3 text-muted-foreground"
                size={18}
              />
              <Input
                id="email"
                type="email"
                placeholder="joao.silva@vorp.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="team">Time *</Label>
            <div className="relative">
              <Users
                className="absolute left-3 top-3 text-muted-foreground z-10"
                size={18}
              />
              <Select
                value={formData.team}
                onValueChange={(v) => setFormData({ ...formData, team: v })}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecione o time" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="position">Posição *</Label>
            <div className="relative">
              <Briefcase
                className="absolute left-3 top-3 text-muted-foreground z-10"
                size={18}
              />
              <Select
                value={formData.position}
                onValueChange={(v) => setFormData({ ...formData, position: v })}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha Temporária *</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-muted-foreground"
                size={18}
              />
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-muted-foreground"
                size={18}
              />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar Conta"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          ⚠️ Anote as credenciais e envie para o líder de forma segura
        </p>
      </DialogContent>
    </Dialog>
  );
}
