import { useState, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserPlus, Pencil, Trash } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Leader } from "@/lib/types";
import { LeaderEditModal } from "@/components/admin/modals";

interface LeadersTabProps {
  leaders: Leader[];
  onCreateLeader: () => void;
  onUpdateLeader: (leader: Leader) => void;
  onDeleteLeader: (leaderId: string) => void;
}

export const LeadersTab = memo(function LeadersTab({
  leaders,
  onCreateLeader,
  onUpdateLeader,
  onDeleteLeader,
}: LeadersTabProps) {
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [deletingLeaderId, setDeletingLeaderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
  };

  const handleSaveEdit = (updatedLeader: Leader) => {
    onUpdateLeader(updatedLeader);
    setEditingLeader(null);
  };

  const handleDelete = async () => {
    if (deletingLeaderId) {
      setIsDeleting(true);
      try {
        await onDeleteLeader(deletingLeaderId);
        setDeletingLeaderId(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Líderes Cadastrados</CardTitle>
              <CardDescription>
                Visualize e edite os perfis dos líderes
              </CardDescription>
            </div>
            <Button onClick={onCreateLeader} className="gap-2">
              <UserPlus size={18} weight="bold" />
              Cadastrar Líder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leader.photo} alt={leader.name} />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>{leader.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{leader.team}</Badge>
                    </TableCell>
                    <TableCell>{leader.position}</TableCell>
                    <TableCell>
                      <span className="font-bold">{leader.overall}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(leader)}
                        >
                          <Pencil size={16} />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingLeaderId(leader.id)}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar Líder?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover{" "}
                                <strong>{leader.name}</strong>? Esta ação não
                                pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeletingLeaderId(null)}
                              >
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deletando..." : "Deletar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <LeaderEditModal
        leader={editingLeader}
        isOpen={!!editingLeader}
        onClose={() => setEditingLeader(null)}
        onSave={handleSaveEdit}
      />
    </>
  );
});
