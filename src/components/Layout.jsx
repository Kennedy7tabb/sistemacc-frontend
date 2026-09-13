import { NavLink, useNavigate } from "react-router-dom"
import { clearAuth, getUsuarioToken } from "../services/api"

export default function Layout({ children }) {
  const navigate = useNavigate()
  const usuario = getUsuarioToken()
  const admin = usuario?.tipo === "admin"

  function sair() {
    clearAuth()
    navigate("/login", { replace: true })
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">LIFEBEN</div>

        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? "ativo" : ""}>
            Dashboard
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => isActive ? "ativo" : ""}>
             Clientes
          </NavLink>
          <NavLink to="/planos" className={({ isActive }) => isActive ? "ativo" : ""}>
             Planos
          </NavLink>
          <NavLink to="/propostas" className={({ isActive }) => isActive ? "ativo" : ""}>
             Propostas
          </NavLink>
          {admin && (
            <NavLink to="/usuarios" className={({ isActive }) => isActive ? "ativo" : ""}>
              Usuários
            </NavLink>
          )}
        </nav>

        <div className="usuario-area">
          <div className="usuario">{admin ? "Administrador" : "Corretor"}</div>
          <button className="sair" onClick={sair} title="Sair">
            Sair
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}
