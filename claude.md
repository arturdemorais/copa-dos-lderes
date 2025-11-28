# Copa dos Líderes (Vorp League)

## Propósito

Plataforma gamificada de desenvolvimento de liderança. Sistema de pontuação/ranking para líderes com dashboards específicos por role (líderes vs admins), integração real-time com Supabase, e features de gamificação (tarefas, rituais, avaliação peer, badges).

## Stack Principal

- **Frontend**: React 19 (Vite 6, SWC), TypeScript 5.7
- **UI**: GitHub Spark + Radix UI + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v7
- **State**: Context API (AuthContext) + React Query

## Estrutura Importante

- `/src/pages/` - Páginas completas
- `/src/components/` - Componentes reutilizáveis
- `/src/components/ui/` - Primitivos Radix UI (usar como estão)
- `/src/lib/services/` - **17 serviços especializados - SEMPRE usar ao invés de queries diretas**
- `/src/lib/scoring.ts` - Lógica de cálculo de pontos
- `/src/lib/types.ts` - Todas as interfaces TypeScript
- `/src/hooks/useGameData.ts` - Orquestra estado do jogo

## REGRAS CRÍTICAS (leia antes de modificar código)

### 1. Service-Layer Pattern (OBRIGATÓRIO)

❌ **NUNCA** faça: `supabase.from('leaders').select()`
✅ **SEMPRE** use: `leaderService.getLeaders()`

Todos os 17 serviços estão em `/src/lib/services/` e exportados via `index.ts`

### 2. Sistema de Pontuação

- Fórmula: `(taskPoints × task_multiplier) + (assistPoints × assist_multiplier) + (ritualPoints × ritual_multiplier) + (consistencyScore × 100 × consistency_multiplier)`
- Multipliers são configuráveis via `configService`
- Consistência = coeficiente de variação 0-1 do histórico recente
- **NÃO modificar** `calculateOverallScore()` sem consultar

### 3. Filtro de Admins

Admins NÃO aparecem no ranking:

```tsx
leaders.filter((l) => !l.isAdmin); // SEMPRE use isso em rankings
```

### 4. Import Paths

Use SEMPRE o alias `@/`:

```tsx
import { leaderService } from "@/lib/services";
import { Card } from "@/components/ui/card";
```

## Fluxo de Dados

### Scoring Flow

```
Task/Ritual completado → taskService.complete() → atualiza Leader.scores → recalcula overall
```

**Exemplo concreto**: Líder completa task de 50 pontos:

1. `taskService.completeTask(taskId, leaderId)`
2. Adiciona 50 em `leader.taskPoints`
3. `calculateOverallScore()` recalcula overall
4. Adiciona snapshot em `leader.history` (para momentum)

### Entidade Leader

- `attributes`: 6 atributos (communication, technique, management, pace, leadership, development)
- `history`: Snapshots semanais para cálculo de momentum/trend
- `vorpCoins`: Moeda interna para loja de recompensas
- `trophies/badges`: Conquistas

## Serviços Principais

- `leaderService`: CRUD leaders, upload foto
- `taskService`: Criar/completar tasks, dar pontos
- `configService`: Multipliers de pontuação (admin)
- `authService`: Login/logout/sessão
- `peerEvaluationService`: Feedback peer
- `vorpCoinsService`: Ledger de moeda

## Hooks Principais

- `useGameData()`: Orquestra leaders, tasks, activities, config
- `useLeaders(includeAdmins?)`: Fetch leaders (filtra admins se false)
- `useAuth()`: Usuário atual do AuthContext

## Padrões de Código

### Componentes

```tsx
interface DashboardProps {
  currentLeader: Leader;
  leaders: Leader[];
  onAction: (id: string) => void;
}

export function Dashboard({
  currentLeader,
  leaders,
  onAction,
}: DashboardProps) {
  // Lógica aqui
}
```

### Error Handling

Services lançam errors; SEMPRE catch no componente:

```tsx
try {
  await taskService.completeTask(taskId, leaderId);
  toast.success("Tarefa concluída!");
  refetchLeaders();
} catch (error) {
  console.error("Erro ao completar task:", error);
  toast.error("Erro ao completar tarefa");
}
```

### Styling

- Tailwind classes (theme em `theme.json`)
- Radix UI variants: `<Button variant="default" />`
- Dark mode via `next-themes`

## Arquivos Críticos

| Arquivo                     | Por que é crítico                                 |
| --------------------------- | ------------------------------------------------- |
| `src/lib/services/index.ts` | Hub central de todos os serviços                  |
| `src/lib/scoring.ts`        | Lógica complexa de cálculo (NÃO mexer sem avisar) |
| `src/lib/types.ts`          | Single source of truth para tipos                 |
| `src/hooks/useGameData.ts`  | Orquestração de estado global                     |

## Anti-Patterns (NÃO FAÇA)

❌ Query Supabase diretamente (sempre via services)
❌ Fetch mesmos dados múltiplas vezes (use hooks)
❌ Lógica de negócio em UI components (use hooks/services)
❌ Hardcode multipliers (use configService)
❌ Esquecer de filtrar admins do ranking
❌ Modificar `calculateOverallScore()` sem consultar
