import { memo, useState, useCallback, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, User, SoccerBall, X } from "@phosphor-icons/react";
import type { Leader, Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface GlobalSearchProps {
  leaders: Leader[];
  tasks: Task[];
  onSelectLeader?: (leader: Leader) => void;
  onSelectTask?: (task: Task) => void;
}

export const GlobalSearch = memo(function GlobalSearch({
  leaders,
  tasks,
  onSelectLeader,
  onSelectTask,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter leaders and tasks based on search
  const filteredLeaders = leaders.filter((leader) => {
    const searchLower = search.toLowerCase();
    return (
      leader.name.toLowerCase().includes(searchLower) ||
      leader.email.toLowerCase().includes(searchLower) ||
      leader.team.toLowerCase().includes(searchLower) ||
      leader.position.toLowerCase().includes(searchLower)
    );
  }).slice(0, 5); // Limit to 5 results

  const filteredTasks = tasks.filter((task) => {
    const searchLower = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    );
  }).slice(0, 5); // Limit to 5 results

  const handleSelectLeader = useCallback(
    (leader: Leader) => {
      setOpen(false);
      setSearch("");
      onSelectLeader?.(leader);
    },
    [onSelectLeader]
  );

  const handleSelectTask = useCallback(
    (task: Task) => {
      setOpen(false);
      setSearch("");
      onSelectTask?.(task);
    },
    [onSelectTask]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-[300px] justify-start text-muted-foreground"
        >
          <MagnifyingGlass size={16} className="mr-2" />
          <span className="hidden md:inline">Buscar líderes, tasks...</span>
          <span className="md:hidden">Buscar...</span>
          <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite para buscar..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!search && (
              <CommandEmpty>
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <MagnifyingGlass size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Digite para buscar líderes ou tasks</p>
                  <p className="text-xs mt-1">Use ⌘K para abrir rapidamente</p>
                </div>
              </CommandEmpty>
            )}

            {search && filteredLeaders.length === 0 && filteredTasks.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado encontrado para "{search}"
                  </p>
                </div>
              </CommandEmpty>
            )}

            {filteredLeaders.length > 0 && (
              <CommandGroup heading="Líderes">
                {filteredLeaders.map((leader) => (
                  <CommandItem
                    key={leader.id}
                    value={leader.id}
                    onSelect={() => handleSelectLeader(leader)}
                    className="cursor-pointer"
                  >
                    <User size={16} className="mr-2 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{leader.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {leader.team}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {leader.position} • {leader.overall} pts
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredTasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {filteredTasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.id}
                    onSelect={() => handleSelectTask(task)}
                    className="cursor-pointer"
                  >
                    <SoccerBall size={16} className="mr-2 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      +{task.points}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
