import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Leader } from "@/lib/types";
import { LeaderPhotoUpload } from "@/components/admin/forms";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/lib/services/leaderService";

interface LeaderEditModalProps {
  leader: Leader | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leader: Leader) => void;
}

export function LeaderEditModal({
  leader,
  isOpen,
  onClose,
  onSave,
}: LeaderEditModalProps) {
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFileToUpload, setPhotoFileToUpload] = useState<File | null>(null);

  // Sync state when leader prop changes
  useEffect(() => {
    if (leader) {
      setEditingLeader(leader);
      setPhotoPreview(null);
      setPhotoFileToUpload(null);
    }
  }, [leader]);

  const handlePhotoSelect = (file: File) => {
    setPhotoFileToUpload(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = async () => {
    if (!editingLeader) return;

    try {
      // If there's an existing photo on server, delete it
      if (editingLeader.photo) {
        setUploadingPhoto(true);
        await deleteProfilePhoto(editingLeader.photo);

        setEditingLeader({
          ...editingLeader,
          photo: undefined,
        });

        toast.success("Foto removida com sucesso");
      }

      // Clear preview and file
      setPhotoPreview(null);
      setPhotoFileToUpload(null);
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Erro ao remover foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!editingLeader) return;

    try {
      let updatedLeader = { ...editingLeader };

      // Upload photo if a new file was selected
      if (photoFileToUpload) {
        setUploadingPhoto(true);

        // Delete old photo if exists
        if (editingLeader.photo) {
          await deleteProfilePhoto(editingLeader.photo);
        }

        // Upload new photo
        const photoUrl = await uploadProfilePhoto(
          photoFileToUpload,
          editingLeader.id
        );

        updatedLeader = {
          ...updatedLeader,
          photo: photoUrl,
        };
      }

      onSave(updatedLeader);
      handleClose();
      toast.success("Líder atualizado com sucesso! ✅");
    } catch (error) {
      console.error("Error saving leader:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleClose = () => {
    // Clear state after animation
    setTimeout(() => {
      setEditingLeader(null);
      setPhotoPreview(null);
      setPhotoFileToUpload(null);
    }, 300);
    onClose();
  };

  if (!editingLeader) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Líder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Upload Section */}
          <div className="pb-4 border-b">
            <LeaderPhotoUpload
              currentPhotoUrl={editingLeader.photo}
              leaderName={editingLeader.name}
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handlePhotoRemove}
              photoPreview={photoPreview}
            />
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editingLeader.name}
                onChange={(e) =>
                  setEditingLeader({
                    ...editingLeader,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingLeader.email}
                onChange={(e) =>
                  setEditingLeader({
                    ...editingLeader,
                    email: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Team and Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                value={editingLeader.team}
                onChange={(e) =>
                  setEditingLeader({
                    ...editingLeader,
                    team: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Posição</Label>
              <Input
                value={editingLeader.position}
                onChange={(e) =>
                  setEditingLeader({
                    ...editingLeader,
                    position: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label>Pontos Fortes (separados por vírgula)</Label>
            <Textarea
              value={editingLeader.strengths.join(", ")}
              onChange={(e) =>
                setEditingLeader({
                  ...editingLeader,
                  strengths: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                })
              }
              rows={3}
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label>Pontos a Desenvolver (separados por vírgula)</Label>
            <Textarea
              value={editingLeader.improvements.join(", ")}
              onChange={(e) =>
                setEditingLeader({
                  ...editingLeader,
                  improvements: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                })
              }
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={uploadingPhoto}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
