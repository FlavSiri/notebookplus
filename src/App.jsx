// src/App.jsx
// -------------------------------------------------------
// Componente raíz. Enrutamiento simple por URL.
// -------------------------------------------------------

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SubjectDetail from "./pages/SubjectDetail";
import "./index.css";

function App() {
  const path = window.location.pathname;

  // Páginas que manejan su propio layout (sin Navbar extra)
  const standalonePages = ["/login", "/perfil"];
  // La ruta a /asignatura/{id} también maneja su propio Navbar internal
  const isSubjectPage = path.startsWith("/asignatura/");
  const noNavbar = standalonePages.includes(path) || isSubjectPage;

  const renderPage = () => {
    if (path === "/login")  return <Login />;
    if (path === "/perfil") return <Profile />;
    if (isSubjectPage)      return <SubjectDetail />;
    return <Home />;
  };

  return (
    <div>
      {!noNavbar && <Navbar />}
      {renderPage()}
    </div>
  );
}

export default App;

