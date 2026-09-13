import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import Layout from "../components/Layout"
import { api, getUsuarioToken } from "../services/api"

const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })

function formatMoeda(valor = "") {
  const digitos = String(valor).replace(/\D/g, "")

  if (!digitos) return ""

  let numero = digitos

  while (numero.length > 0) {
    const valorNumerico = Number(numero) / 100

    const formatado = valorNumerico.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    if (formatado.length <= 10) {
      return formatado
    }

    numero = numero.slice(0, -1)
  }

  return ""
}

function valorParaNumero(valor = "") {
  if (!valor) return 0

  return Number(
    valor
      .replace(/\./g, "")
      .replace(",", ".")
  )
}

export default function Planos() {
  const [planos, setPlanos] = useState([])
  const [form, setForm] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const admin = getUsuarioToken()?.tipo === "admin"

  async function carregar() {
    try {
      setCarregando(true)
      setPlanos(await api.planos.listar())
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

  async function salvar(e) {
    e.preventDefault()

    try {
      const dados = {
        nome: form.nome,
        descricao: form.descricao || null,
        tipo: form.tipo,
        valor: valorParaNumero(form.valor),
        ativo: form.ativo
      }

      if (form.id) {
        await api.planos.atualizar(form.id, dados)
      } else {
        await api.planos.criar(dados)
      }

      setForm(null)
      carregar()
    } catch (e) {
      alert(e.message)
    }
  }

  async function excluir(plano) {
    if (!confirm(`Excluir o plano ${plano.nome}?`)) return

    try {
      await api.planos.excluir(plano.id)

      setPlanos((itens) =>
        itens.filter((p) => p.id !== plano.id)
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
              Gestão
            </p>

            <h1>
              Planos
            </h1>

            <p className="descricao">
              Gerencie os planos disponíveis na LifeBen.
            </p>
          </div>

          {admin && (
            <button
              className="botao"
              onClick={() =>
                setForm({
                  nome: "",
                  descricao: "",
                  tipo: "Individual",
                  valor: "",
                  ativo: true
                })
              }
            >
              + Novo plano
            </button>
          )}
        </section>

        {form && (
          <section className="painel formulario">

            <div className="painel-header">
              <div>
                <h2>
                  {form.id ? "Editar plano" : "Novo plano"}
                </h2>

                <p>
                  Cadastre as informações comerciais do plano.
                </p>
              </div>

              <button
                className="link-botao"
                onClick={() => setForm(null)}
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={salvar}>
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
                    Tipo
                  </label>

                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value
                      })
                    }
                  >
                    <option>
                      Individual
                    </option>

                    <option>
                      Familiar
                    </option>

                    <option>
                      Empresarial
                    </option>

                    <option>
                      Coletivo
                    </option>
                  </select>
                </div>

                <div className="campo">
                  <label>
                    Valor
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    maxLength={10}
                    value={form.valor}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor: formatMoeda(e.target.value)
                      })
                    }
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="campo">
                  <label>
                    Status
                  </label>

                  <select
                    value={form.ativo ? "ativo" : "inativo"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ativo: e.target.value === "ativo"
                      })
                    }
                  >
                    <option value="ativo">
                      Ativo
                    </option>

                    <option value="inativo">
                      Inativo
                    </option>
                  </select>
                </div>

                <div className="campo campo-full">
                  <label>
                    Descrição
                  </label>

                  <textarea
                    value={form.descricao}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descricao: e.target.value
                      })
                    }
                    placeholder="Descrição do plano"
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
                    type="submit"
                  >
                    Salvar plano
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
                Planos cadastrados
              </h2>

              <p>
                Planos disponíveis para clientes e propostas.
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
              Carregando planos...
            </div>
          ) : erro ? (
            <div className="estado erro-texto">
              {erro}
            </div>
          ) : planos.length === 0 ? (
            <div className="estado">
              Nenhum plano cadastrado.
            </div>
          ) : (
            planos.map((plano) => (
              <div
                className="proposta"
                key={plano.id}
              >

                <div>
                  <strong>
                    {plano.nome}
                  </strong>

                  <span>
                    {plano.tipo}
                    {plano.descricao
                      ? ` · ${plano.descricao}`
                      : ""}
                  </span>
                </div>

                <div className="proposta-info">

                  <strong>
                    {moeda(plano.valor)}
                  </strong>

                  <span
                    className={`status ${
                      plano.ativo
                        ? "ativo"
                        : "inativo"
                    }`}
                  >
                    {plano.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>

                  {admin && (
                    <>
                      <button
                        className="icone-botao"
                        onClick={() => setForm(plano)}
                        title="Editar plano"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        className="icone-botao perigo"
                        onClick={() => excluir(plano)}
                        title="Excluir plano"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}

                </div>

              </div>
            ))
          )}

        </section>

      </main>
    </Layout>
  )
}
