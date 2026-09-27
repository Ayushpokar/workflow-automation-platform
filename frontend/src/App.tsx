import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

import { WorkflowsPage } from "./pages/WorkflowsPage";
import { NewWorkflowPage } from "./pages/NewWorkflowPage";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
          <Route path="/workflows/new" element={<ProtectedRoute><NewWorkflowPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/workflows" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;