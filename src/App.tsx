import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const RedirectOnReload = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname !== "/login") {
      navigate("/"); // Redirect to main app route
    }
  }, []);

  return null;
};

const App = () => (
  <BrowserRouter>
    <RedirectOnReload />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
