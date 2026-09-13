import { useEffect, useState } from "react"
import { Eye, Download, Pencil, Trash2 } from "lucide-react"
import Layout from "../components/Layout"
import { api } from "../services/api"

const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })

const statusLabel = (s) =>
  ({
    pendente: "Pendente",
    aprovado: "Aprovada",
    recusado: "Recusada",
    aprovada: "Aprovada"
  }[s] || s)

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

export default function Propostas() {
  const [propostas, setPropostas] = useState([])
  const [clientes, setClientes] = useState([])
  const [planos, setPlanos] = useState([])
  const [form, setForm] = useState(null)
  const [busca, setBusca] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  async function carregar() {
    try {
      setCarregando(true)

      const [p, c, pl] = await Promise.all([
        api.propostas.listar(),
        api.clientes.listar(),
        api.planos.listar()
      ])

      setPropostas(p)
      setClientes(c)
      setPlanos(pl)
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

  function novo() {
    setForm({
      cliente_id: "",
      plano_id: "",
      valor_total: "",
      status: "pendente",
      observacoes: ""
    })
  }

  function editar(p) {
    setForm({
      id: p.id,
      cliente_id: p.cliente_id,
      plano_id: p.plano_id,
      valor_total: formatMoeda(p.valor_total),
      status: p.status,
      observacoes: p.observacoes || ""
    })
  }

  async function salvar(e) {
    e.preventDefault()

    try {
      if (!form.id && (!form.cliente_id || !form.plano_id)) {
        throw new Error("Selecione o cliente e o plano.")
      }

      const dados = {
        valor_total: valorParaNumero(form.valor_total),
        status: form.status,
        observacoes: form.observacoes || null
      }

      if (form.id) {
        await api.propostas.atualizar(form.id, dados)
      } else {
        await api.propostas.criar({
          cliente_id: Number(form.cliente_id),
          plano_id: Number(form.plano_id),
          ...dados
        })
      }

      setForm(null)
      carregar()
    } catch (e) {
      alert(e.message)
    }
  }

  async function excluir(p) {
    if (!confirm(`Excluir a proposta #${p.id}?`)) return

    try {
      await api.propostas.excluir(p.id)

      setPropostas((itens) =>
        itens.filter((x) => x.id !== p.id)
      )
    } catch (e) {
      alert(e.message)
    }
  }

  async function abrirPdf(id, baixar = false) {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        baixar
          ? api.propostas.pdfDownloadUrl(id)
          : api.propostas.pdfUrl(id),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Não foi possível gerar o PDF.")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (baixar) {
        const a = document.createElement("a")

        a.href = url
        a.download = `proposta_${id}.pdf`
        a.click()
      } else {
        window.open(url, "_blank")
      }

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 10000)
    } catch (e) {
      alert(e.message)
    }
  }

  const filtradas = propostas.filter((p) =>
    `${p.id} ${p.cliente?.nome || ""} ${p.plano?.nome || ""} ${p.status}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <Layout>
      <main className="conteudo">

        <section className="cabecalho">

          <div>
            <p className="subtitulo">
              Gestão
            </p>

            <h1>
              Propostas
            </h1>

            <p className="descricao">
              Crie, acompanhe e gere as propostas comerciais.
            </p>
          </div>

          <button
            className="botao"
            onClick={novo}
          >
            + Nova proposta
          </button>

        </section>


        {form && (

          <section className="painel formulario">

            <div className="painel-header">

              <div>
                <h2>
                  {form.id
                    ? `Editar proposta #${form.id}`
                    : "Nova proposta"}
                </h2>

                <p>
                  Preencha os dados da cotação.
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
                    Cliente
                  </label>

                  <select
                    value={form.cliente_id}
                    disabled={Boolean(form.id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cliente_id: e.target.value
                      })
                    }
                    required
                  >

                    <option value="">
                      Selecione um cliente
                    </option>

                    {clientes.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.nome} — {c.cpf}
                      </option>
                    ))}

                  </select>

                </div>


                <div className="campo">

                  <label>
                    Plano
                  </label>

                  <select
                    value={form.plano_id}
                    disabled={Boolean(form.id)}
                    onChange={(e) => {
                      const id = e.target.value

                      const plano = planos.find(
                        (p) => p.id === Number(id)
                      )

                      setForm({
                        ...form,
                        plano_id: id,
                        valor_total: plano
                          ? formatMoeda(plano.valor)
                          : form.valor_total
                      })
                    }}
                    required
                  >

                    <option value="">
                      Selecione um plano
                    </option>

                    {planos
                      .filter((p) => p.ativo)
                      .map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.nome} — {moeda(p.valor)}
                        </option>
                      ))}

                  </select>

                </div>


                <div className="campo">

                  <label>
                    Valor total
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    maxLength={10}
                    value={form.valor_total}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor_total: formatMoeda(e.target.value)
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
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value
                      })
                    }
                  >

                    <option value="pendente">
                      Pendente
                    </option>

                    <option value="aprovado">
                      Aprovada
                    </option>

                    <option value="recusado">
                      Recusada
                    </option>

                  </select>

                </div>


                <div className="campo campo-full">

                  <label>
                    Observações
                  </label>

                  <textarea
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        observacoes: e.target.value
                      })
                    }
                    placeholder="Observações da proposta"
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
                    Salvar proposta
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
                Propostas cadastradas
              </h2>

              <p>
                {propostas.length} proposta(s) registrada(s).
              </p>
            </div>

            <div className="lista-acoes">

              <div className="busca">

                <input
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  placeholder="Buscar proposta..."
                />

              </div>

              <button
                className="link-botao"
                onClick={carregar}
              >
                Atualizar
              </button>

            </div>

          </div>


          {carregando ? (

            <div className="estado">
              Carregando propostas...
            </div>

          ) : erro ? (

            <div className="estado erro-texto">
              {erro}
            </div>

          ) : filtradas.length === 0 ? (

            <div className="estado">
              Nenhuma proposta encontrada.
            </div>

          ) : (

            filtradas.map((p) => (

              <div
                className="proposta"
                key={p.id}
              >

                <div>

                  <strong>
                    Proposta #{p.id} ·{" "}
                    {p.cliente?.nome ||
                      `Cliente #${p.cliente_id}`}
                  </strong>

                  <span>
                    {p.plano?.nome ||
                      `Plano #${p.plano_id}`}
                    {" · "}
                    {new Date(
                      p.data_cotacao
                    ).toLocaleDateString("pt-BR")}
                  </span>

                </div>


                <div className="proposta-info">

                  <strong>
                    {moeda(p.valor_total)}
                  </strong>

                  <span
                    className={`status ${p.status}`}
                  >
                    {statusLabel(p.status)}
                  </span>


                  <button
                    className="icone-botao"
                    onClick={() => abrirPdf(p.id)}
                    title="Abrir PDF"
                  >
                    <Eye size={18} />
                  </button>


                  <button
                    className="icone-botao"
                    onClick={() => abrirPdf(p.id, true)}
                    title="Baixar PDF"
                  >
                    <Download size={18} />
                  </button>


                  <button
                    className="icone-botao"
                    onClick={() => editar(p)}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>


                  <button
                    className="icone-botao perigo"
                    onClick={() => excluir(p)}
                    title="Excluir"
                  >
                    <Trash2 size={18} />
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
