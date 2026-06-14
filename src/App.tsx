import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";
import Author from "@/pages/Author";
import Publish from "@/pages/Publish";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Collections from "@/pages/Collections";
import AdminDashboard from "@/pages/AdminDashboard";
import TopicDetail from "@/pages/TopicDetail";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-blue-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/author/:id" element={<Author />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/publish"
          element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <Collections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={
          <div className="min-h-screen bg-space-blue-950 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">页面不存在</h1>
            <p className="text-gray-400 mb-6">您访问的页面不存在或已被移除</p>
            <a href="/" className="btn-primary">返回首页</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}
