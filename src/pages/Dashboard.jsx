import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { api, getUsuarioToken } from "../services/api"

const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const statusLabel = (status) => ({ pendente: "Pendente", aprovado: "Aprovada", recusado: "Recusada", ativa: "Ativo", ativo: "Ativo", inativo: "Inativo" }[status] || status)

export default function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [planos, setPlanos] = useState([])
  const [propostas, setPropostas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  async function carregar() {
    try {
      setCarregando(true)
      setErro("")
      const [c, p, pr] = await Promise.all([api.clientes.listar(), api.planos.listar(), api.propostas.listar()])
      setClientes(c)
      setPlanos(p)
      setPropostas(pr)
    } catch (error) { setErro(error.message) } finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])

  const usuario = getUsuarioToken()
  const pendentes = propostas.filter((p) => p.status === "pendente")
  const recentes = [...propostas].sort((a, b) => new Date(b.data_cotacao) - new Date(a.data_cotacao)).slice(0, 5)

  return (
    <Layout>
      <main className="conteudo">
        <section className="cabecalho">
          <div>
            <p className="subtitulo">Visão geral</p>
            <h1>Olá, {usuario?.tipo === "admin" ? "administrador" : "corretor"}.</h1>
            <p className="descricao">Gerencie clientes, planos e propostas da LifeBen.</p>
          </div>
          <Link className="botao" to="/propostas">+ Nova proposta</Link>
        </section>

        <section className="cards">
          <div className="card"><span>Clientes</span><strong>{carregando ? "—" : clientes.length}</strong><p>Clientes cadastrados</p></div>
          <div className="card"><span>Planos</span><strong>{carregando ? "—" : planos.filter((p) => p.ativo).length}</strong><p>Planos disponíveis</p></div>
          <div className="card"><span>Propostas</span><strong>{carregando ? "—" : propostas.length}</strong><p>Propostas cadastradas</p></div>
          <div className="card"><span>Propostas pendentes</span><strong>{carregando ? "—" : pendentes.length}</strong><p>Aguardando andamento</p></div>
        </section>

        <section className="painel">
          <div className="painel-header">
            <div><h2>Propostas recentes</h2><p>Últimas cotações cadastradas no sistema.</p></div>
            <button className="link-botao" onClick={carregar}> Atualizar</button>
          </div>
          {erro ? <div className="estado erro-texto">{erro}</div> : recentes.length === 0 ? <div className="estado">Nenhuma proposta cadastrada.</div> : recentes.map((proposta) => (
            <div className="proposta" key={proposta.id}>
              <div><strong>{proposta.cliente?.nome || `Cliente #${proposta.cliente_id}`}</strong><span>{proposta.plano?.nome || `Plano #${proposta.plano_id}`} · {proposta.plano?.tipo || "Plano"}</span></div>
              <div className="proposta-info"><strong>{moeda(proposta.valor_total)}</strong><span className={`status ${proposta.status}`}>{statusLabel(proposta.status)}</span><Link className="link-botao" to="/propostas">Ver </Link></div>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  )
}
