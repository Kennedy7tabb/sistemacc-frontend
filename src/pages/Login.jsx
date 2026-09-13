import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  async function fazerLogin(event) {
    event.preventDefault()

    try {
      setCarregando(true)

      const dados = await api.login(email, senha)

      localStorage.setItem("token", dados.access_token)

      navigate("/")
    } catch (erro) {
      alert(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="app">

      <main className="conteudo">

        <section className="painel">

          <div className="painel-header">

            <div>
              <h2>
                Entrar
              </h2>

              <p>
                Acesse o sistema LifeBen.
              </p>
            </div>

          </div>

          <form onSubmit={fazerLogin}>

            <div className="formulario-conteudo">

              <div className="campo">

                <label>
                  E-mail
                </label>

                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

              <div className="campo">

                <label>
                  Senha
                </label>

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
                  required
                />

              </div>

              <div className="formulario-acoes">

                <button
                  type="submit"
                  className="botao"
                  disabled={carregando}
                >
                  {carregando ? "Entrando..." : "Entrar"}
                </button>

              </div>

            </div>

          </form>

        </section>

      </main>

    </div>
  )
}

export default Login
