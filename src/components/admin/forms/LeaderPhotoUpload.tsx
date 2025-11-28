import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, X } from "@phosphor-icons/react";
import { toast } from "sonner";

interface LeaderPhotoUploadProps {
  currentPhotoUrl?: string | null;
  leaderName?: string;
  onPhotoSelect: (file: File) => void;
  onPhotoRemove: () => void;
  photoPreview?: string | null;
}

export function LeaderPhotoUpload({
  currentPhotoUrl,
  leaderName,
  onPhotoSelect,
  onPhotoRemove,
  photoPreview,
}: LeaderPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    onPhotoSelect(file);
  };

  const handleRemove = () => {
    onPhotoRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayPhoto = photoPreview || currentPhotoUrl;
  const initials = leaderName
    ? leaderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-20 w-20">
        <AvatarImage src={displayPhoto || undefined} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload size={16} />
          {displayPhoto ? "Alterar Foto" : "Adicionar Foto"}
        </Button>

        {displayPhoto && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="gap-2 text-destructive"
          >
            <X size={16} />
            Remover
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        Opcional. JPG, PNG ou GIF. Máximo 5MB.
      </p>
    </div>
  );
}
