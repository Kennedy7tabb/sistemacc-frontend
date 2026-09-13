import { useEffect, useState } from "react"
import { UserPlus, Power } from "lucide-react"
import Layout from "../components/Layout"
import { api } from "../services/api"

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  async function carregar() {
    try {
      setCarregando(true)
      setUsuarios(await api.usuarios.corretores())
      setErro("")
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function criar(e) {
    e.preventDefault()

    try {
      await api.usuarios.criar(form)
      setForm(null)
      carregar()
    } catch (e) {
      alert(e.message)
    }
  }

  async function alternar(u) {
    try {
      const atualizado = u.ativo
        ? await api.usuarios.desativar(u.id)
        : await api.usuarios.ativar(u.id)

      setUsuarios((lista) =>
        lista.map((x) =>
          x.id === atualizado.id ? atualizado : x
        )
      )
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <Layout>
      <main className="conteudo">

        <section className="cabecalho">

          <div>
            <p className="subtitulo">
              Administração
            </p>

            <h1>
              Usuários
            </h1>

            <p className="descricao">
              Gerencie os corretores que utilizam a plataforma.
            </p>
          </div>

          <button
            className="botao"
            onClick={() =>
              setForm({
                nome: "",
                email: "",
                senha: "",
                tipo: "corretor"
              })
            }
          >
            <UserPlus size={18} />
            + Novo corretor
          </button>

        </section>


        {form && (

          <section className="painel formulario">

            <div className="painel-header">

              <div>
                <h2>
                  Novo corretor
                </h2>

                <p>
                  Crie um acesso para um corretor.
                </p>
              </div>

              <button
                className="link-botao"
                onClick={() => setForm(null)}
              >
                Cancelar
              </button>

            </div>


            <form onSubmit={criar}>

              <div className="formulario-conteudo">

                <div className="campo">

                  <label>
                    Nome
                  </label>

                  <input
                    value={form.nome}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nome: e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div className="campo">

                  <label>
                    E-mail
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value
                      })
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
                    minLength="6"
                    value={form.senha}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        senha: e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div className="formulario-acoes">

                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() => setForm(null)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="botao"
                  >
                    Criar acesso
                  </button>

                </div>

              </div>

            </form>

          </section>

        )}


        <section className="painel">

          <div className="painel-header">

            <div>
              <h2>
                Corretores
              </h2>

              <p>
                {usuarios.length} corretor(es) cadastrado(s).
              </p>
            </div>

            <button
              className="link-botao"
              onClick={carregar}
            >
              Atualizar
            </button>

          </div>


          {carregando ? (

            <div className="estado">
              Carregando usuários...
            </div>

          ) : erro ? (

            <div className="estado erro-texto">
              {erro}
            </div>

          ) : usuarios.length === 0 ? (

            <div className="estado">
              Nenhum corretor cadastrado.
            </div>

          ) : (

            usuarios.map((u) => (

              <div
                className="proposta"
                key={u.id}
              >

                <div>

                  <strong>
                    {u.nome}
                  </strong>

                  <span>
                    {u.email}
                  </span>

                </div>


                <div className="proposta-info">

                  <span
                    className={`status ${
                      u.ativo ? "ativo" : "inativo"
                    }`}
                  >
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>


                  <button
                    className="icone-botao"
                    onClick={() => alternar(u)}
                    title={
                      u.ativo
                        ? "Desativar"
                        : "Ativar"
                    }
                  >
                    <Power size={18} />
                  </button>

                </div>

              </div>

            ))

          )}

        </section>

      </main>
    </Layout>
  )
}
