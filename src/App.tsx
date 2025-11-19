import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { SignOut, House, Trophy, Books, Gauge } from "@phosphor-icons/react";
import { LoginPage } from "@/pages/LoginPage";
import { LeaderDashboard } from "@/pages/LeaderDashboard";
import { RankingPage } from "@/pages/RankingPage";
import { AlbumPage } from "@/pages/AlbumPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { LeaderProfileModal } from "@/components/modals/LeaderProfileModal";
import { PeerEvaluationModal } from "@/components/modals/PeerEvaluationModal";
import { useGameData } from "@/hooks/useGameData";
import type { Leader } from "@/lib/types";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function Layout({
  children,
  currentUser,
  handleLogout,
}: {
  children: React.ReactNode;
  currentUser: any;
  handleLogout: () => void;
}) {
  const location = useLocation();

  const NavButton = ({
    path,
    icon: Icon,
    label,
  }: {
    path: string;
    icon: any;
    label: string;
  }) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className="flex items-center gap-2"
        >
          <Icon size={20} weight={isActive ? "fill" : "regular"} />
          <span className="hidden md:inline">{label}</span>
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <Trophy weight="fill" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Copa dos Líderes</h1>
                <p className="text-xs text-muted-foreground">
                  {currentUser.role === "admin"
                    ? "Administrador"
                    : `Técnico ${currentUser.name}`}
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {currentUser.role === "leader" ? (
                <>
                  <NavButton path="/dashboard" icon={House} label="Vestiário" />
                  <NavButton path="/ranking" icon={Trophy} label="Ranking" />
                  <NavButton path="/album" icon={Books} label="Álbum" />
                </>
              ) : (
                <NavButton path="/admin" icon={Gauge} label="Painel" />
              )}

              <Button variant="ghost" onClick={handleLogout} className="ml-2">
                <SignOut size={20} />
                <span className="hidden md:inline ml-2">Sair</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function AppContent() {
  const {
    currentUser,
    leaders,
    tasks,
    activities,
    selectedLeader,
    evaluatingLeader,
    leadersLoading,
    getCurrentLeader,
    handleLogin,
    handleLogout,
    handleTaskComplete,
    handlePeerEvaluation,
    handleUpdateLeader,
    handleCreateTask,
    handleDeleteTask,
    handleInitializeSampleData,
    setSelectedLeader,
    setEvaluatingLeader,
  } = useGameData();

  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Show loading state while fetching leaders
  if (currentUser.role === "leader" && leadersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Carregando vestiário...</p>
        </div>
      </div>
    );
  }

  const currentLeader = getCurrentLeader();
  
  const leaderTasks = currentLeader
    ? (tasks || []).filter((t) => t.leaderId === currentLeader.id)
    : [];

  return (
    <>
      <Layout currentUser={currentUser} handleLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={currentUser.role === "admin" ? "/admin" : "/dashboard"}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              currentUser.role === "leader" && currentLeader ? (
                <LeaderDashboard
                  currentLeader={currentLeader}
                  tasks={leaderTasks}
                  leaders={leaders || []}
                  onTaskComplete={handleTaskComplete}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/ranking"
            element={
              currentUser.role === "leader" ? (
                <RankingPage
                  leaders={leaders || []}
                  activities={activities || []}
                  onLeaderClick={setSelectedLeader}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/album"
            element={
              currentUser.role === "leader" ? (
                <AlbumPage
                  leaders={leaders || []}
                  onLeaderClick={setSelectedLeader}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              currentUser.role === "admin" ? (
                <AdminDashboard
                  leaders={leaders || []}
                  tasks={tasks || []}
                  onUpdateLeader={handleUpdateLeader}
                  onCreateTask={handleCreateTask}
                  onDeleteTask={handleDeleteTask}
                  onInitializeSampleData={handleInitializeSampleData}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/login" element={<Navigate to="/" />} />
        </Routes>
      </Layout>

      <LeaderProfileModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
        onEvaluate={(leader) => {
          setSelectedLeader(null);
          setEvaluatingLeader(leader);
        }}
      />

      <PeerEvaluationModal
        leader={evaluatingLeader}
        open={!!evaluatingLeader}
        onOpenChange={(open) => !open && setEvaluatingLeader(null)}
        onSubmit={handlePeerEvaluation}
      />

      <Toaster />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
