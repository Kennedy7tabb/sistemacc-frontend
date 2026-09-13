import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { api } from "../services/api"
import { Pencil, Trash2 } from "lucide-react"

function formatCpf(value = "") {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 3) return digits

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatTelefone(value = "") {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) return digits

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatMoeda(value = "") {
  const digits = String(value).replace(/\D/g, "")

  if (!digits) return ""

  let valor = digits

  // Limita o campo a no máximo 10 caracteres exibidos
  while (valor.length > 0) {
    const numero = Number(valor) / 100

    const formatado = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    if (formatado.length <= 10) {
      return formatado
    }

    valor = valor.slice(0, -1)
  }

  return ""
}

function valorMoedaParaNumero(value = "") {
  if (!value) return null

  return Number(
    value
      .replace(/\./g, "")
      .replace(",", ".")
  )
}

function vazioParaNull(value) {
  return value === "" ? null : value
}

function formatarData(value) {
  if (!value) return ""

  const [ano, mes, dia] = String(value).split("-")
  return `${dia}/${mes}/${ano}`
}

function diasAte(data) {
  if (!data) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [ano, mes, dia] = String(data).split("-").map(Number)
  const dataAlvo = new Date(ano, mes - 1, dia)
  dataAlvo.setHours(0, 0, 0, 0)

  return Math.ceil(
    (dataAlvo.getTime() - hoje.getTime()) / 86400000
  )
}

function ClienteForm({
  cliente,
  planos,
  corretores,
  onCancel,
  onSaved
}) {
  const [form, setForm] = useState({
    nome: cliente?.nome || "",
    cpf: formatCpf(cliente?.cpf || ""),
    data_nascimento: cliente?.data_nascimento || "",
    email: cliente?.email || "",
    telefone: formatTelefone(cliente?.telefone || ""),
    data_adesao: cliente?.data_adesao || "",
    dia_vencimento: cliente?.dia_vencimento ?? "",
    valor_atual:
      cliente?.valor_atual !== null &&
      cliente?.valor_atual !== undefined
        ? formatMoeda(cliente.valor_atual)
        : "",
    status: cliente?.status || "ativo",
    plano_id: cliente?.plano_id ?? "",
    corretor_id: cliente?.corretor_id ?? ""
  })

  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  function alterar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor
    }))
  }

  async function salvar(event) {
    event.preventDefault()
    setErro("")

    if (!form.nome.trim()) {
      return setErro("Informe o nome completo.")
    }

    if (form.cpf.replace(/\D/g, "").length !== 11) {
      return setErro("Informe um CPF válido com 11 números.")
    }

    if (!form.data_nascimento || !form.data_adesao) {
      return setErro("Informe as datas obrigatórias.")
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      return setErro("Digite um e-mail válido.")
    }

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ""),
      data_nascimento: form.data_nascimento,
      email: vazioParaNull(form.email.trim()),
      telefone: vazioParaNull(
        form.telefone.replace(/\D/g, "")
      ),
      data_adesao: form.data_adesao,
      dia_vencimento:
        form.dia_vencimento === ""
          ? null
          : Number(form.dia_vencimento),
      valor_atual: valorMoedaParaNumero(form.valor_atual),
      status: form.status,
      plano_id:
        form.plano_id === ""
          ? null
          : Number(form.plano_id)
    }

    if (!cliente) {
      payload.corretor_id =
        form.corretor_id === ""
          ? null
          : Number(form.corretor_id)
    }

    try {
      setSalvando(true)

      const resultado = cliente
        ? await api.clientes.atualizar(cliente.id, payload)
        : await api.clientes.criar(payload)

      onSaved(resultado)
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="painel formulario">

      <div className="painel-header">

        <div>
          <h2>
            {cliente ? "Editar cliente" : "Novo cliente"}
          </h2>

          <p>
            {cliente
              ? "Atualize os dados do cliente."
              : "Cadastre um novo cliente na LifeBen."}
          </p>
        </div>

        <button
          className="link-botao"
          onClick={onCancel}
        >
          Cancelar
        </button>

      </div>

      <form onSubmit={salvar}>

        <div className="formulario-conteudo">

          <div className="campo">

            <label>
              Nome completo
            </label>

            <input
              value={form.nome}
              onChange={(e) =>
                alterar("nome", e.target.value)
              }
              placeholder="Digite o nome do cliente"
              required
            />

          </div>


          <div className="campo">

            <label>
              CPF
            </label>

            <input
              value={form.cpf}
              onChange={(e) =>
                alterar(
                  "cpf",
                  formatCpf(e.target.value)
                )
              }
              placeholder="Digite o CPF"
              inputMode="numeric"
              required
            />

          </div>


          <div className="campo">

            <label>
              Data de nascimento
            </label>

            <input
              type="date"
              value={form.data_nascimento}
              onChange={(e) =>
                alterar(
                  "data_nascimento",
                  e.target.value
                )
              }
              required
            />

          </div>


          <div className="campo">

            <label>
              Telefone
            </label>

            <input
              value={form.telefone}
              onChange={(e) =>
                alterar(
                  "telefone",
                  formatTelefone(e.target.value)
                )
              }
              placeholder="Digite o telefone"
              inputMode="tel"
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
                alterar("email", e.target.value)
              }
              placeholder="Digite o e-mail"
            />

          </div>


          <div className="campo">

            <label>
              Data de adesão
            </label>

            <input
              type="date"
              value={form.data_adesao}
              onChange={(e) =>
                alterar(
                  "data_adesao",
                  e.target.value
                )
              }
              required
            />

          </div>


          <div className="campo">

            <label>
              Plano
            </label>

            <select
              value={form.plano_id}
              onChange={(e) =>
                alterar(
                  "plano_id",
                  e.target.value
                )
              }
            >

              <option value="">
                Sem plano
              </option>

              {planos
                .filter((plano) => plano.ativo)
                .map((plano) => (
                  <option
                    key={plano.id}
                    value={plano.id}
                  >
                    {plano.nome}
                  </option>
                ))}

            </select>

          </div>


          <div className="campo">

            <label>
              Dia de vencimento
            </label>

            <input
              type="number"
              min="1"
              max="31"
              value={form.dia_vencimento}
              onChange={(e) =>
                alterar(
                  "dia_vencimento",
                  e.target.value
                )
              }
              placeholder="Ex.: 10"
            />

          </div>


          <div className="campo">

            <label>
              Valor atual
            </label>

            <input
              type="text"
              inputMode="decimal"
              maxLength={10}
              value={form.valor_atual}
              onChange={(e) =>
                alterar(
                  "valor_atual",
                  formatMoeda(e.target.value)
                )
              }
              placeholder="0,00"
            />

          </div>


          <div className="campo">

            <label>
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                alterar(
                  "status",
                  e.target.value
                )
              }
            >

              <option value="ativo">
                Ativo
              </option>

              <option value="inativo">
                Inativo
              </option>

              <option value="pendente">
                Pendente
              </option>

            </select>

          </div>


          {!cliente && corretores.length > 0 && (

            <div className="campo">

              <label>
                Corretor responsável
              </label>

              <select
                value={form.corretor_id}
                onChange={(e) =>
                  alterar(
                    "corretor_id",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Sem corretor
                </option>

                {corretores
                  .filter((c) => c.ativo)
                  .map((corretor) => (
                    <option
                      key={corretor.id}
                      value={corretor.id}
                    >
                      {corretor.nome}
                    </option>
                  ))}

              </select>

            </div>

          )}


          {erro && (

            <div className="mensagem erro">
              {erro}
            </div>

          )}


          <div className="formulario-acoes">

            <button
              type="button"
              className="botao-secundario"
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="botao"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : cliente
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
            </button>

          </div>

        </div>

      </form>

    </section>
  )
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [planos, setPlanos] = useState([])
  const [corretores, setCorretores] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [busca, setBusca] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  const admin = getAdmin()

  async function carregar() {
    try {
      setCarregando(true)
      setErro("")

      const [lista, listaPlanos] =
        await Promise.all([
          api.clientes.listar(),
          api.planos.listar()
        ])

      setClientes(lista)
      setPlanos(listaPlanos)

      if (admin) {
        try {
          setCorretores(
            await api.usuarios.corretores()
          )
        } catch {
          setCorretores([])
        }
      }

    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function getAdmin() {
    return getUsuarioTokenLocal()?.tipo === "admin"
  }

  function getUsuarioTokenLocal() {
    try {
      const token = localStorage.getItem("token")

      return token
        ? JSON.parse(atob(token.split(".")[1]))
        : null

    } catch {
      return null
    }
  }

  function salvarConcluido() {
    setMostrarFormulario(false)
    setClienteEditando(null)
    carregar()
  }

  async function excluir(cliente) {
    if (
      !window.confirm(
        `Excluir o cliente ${cliente.nome}?`
      )
    ) {
      return
    }

    try {
      await api.clientes.excluir(cliente.id)

      setClientes((atual) =>
        atual.filter(
          (item) => item.id !== cliente.id
        )
      )

    } catch (error) {
      alert(error.message)
    }
  }

  const filtrados = clientes.filter((cliente) =>
    `${cliente.nome} ${cliente.cpf} ${
      cliente.email || ""
    } ${cliente.telefone || ""}`
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
              Clientes
            </h1>

            <p className="descricao">
              Gerencie os clientes cadastrados na LifeBen.
            </p>

          </div>

          <button
            className="botao"
            onClick={() => {
              setClienteEditando(null)
              setMostrarFormulario(true)
            }}
          >
            + Novo cliente
          </button>

        </section>


        {mostrarFormulario && (

          <ClienteForm
            cliente={clienteEditando}
            planos={planos}
            corretores={corretores}
            onCancel={() => {
              setMostrarFormulario(false)
              setClienteEditando(null)
            }}
            onSaved={salvarConcluido}
          />

        )}


        <section className="painel">

          <div className="painel-header">

            <div>

              <h2>
                Clientes cadastrados
              </h2>

              <p>
                {clientes.length} cliente(s)
                registrado(s) no sistema.
              </p>

            </div>

            <div className="lista-acoes">

              <div className="busca">

                <input
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  placeholder="Buscar cliente..."
                />

              </div>

              <button
                className="link-botao"
                onClick={carregar}
                title="Atualizar"
              >
                Atualizar
              </button>

            </div>

          </div>


          {carregando ? (

            <div className="estado">
              Carregando clientes...
            </div>

          ) : erro ? (

            <div className="estado erro-texto">
              {erro}
            </div>

          ) : filtrados.length === 0 ? (

            <div className="estado">
              Nenhum cliente encontrado.
            </div>

          ) : (

            <div className="lista">

              {filtrados.map((cliente) => (

                <div
                  className="proposta"
                  key={cliente.id}
                >

                  <div className="cliente-resumo">

                    <strong>
                      {cliente.nome}
                    </strong>

                    <span>
                      CPF: {formatCpf(cliente.cpf)}
                      {cliente.telefone
                        ? ` · ${formatTelefone(
                            cliente.telefone
                          )}`
                        : ""}
                    </span>

                    {cliente.faixa_etaria && (
                      <div className="cliente-faixa">
                        <span>
                          Faixa atual: <strong>{cliente.faixa_etaria}</strong>
                          {cliente.idade !== null && cliente.idade !== undefined
                            ? ` · ${cliente.idade} anos`
                            : ""}
                        </span>

                        {cliente.data_proxima_mudanca_faixa && (
                          <span
                            className={
                              diasAte(cliente.data_proxima_mudanca_faixa) <= 60
                                ? "faixa-aviso"
                                : ""
                            }
                          >
                            Próxima mudança:{" "}
                            <strong>
                              {formatarData(cliente.data_proxima_mudanca_faixa)}
                            </strong>
                            {cliente.proxima_faixa_etaria
                              ? ` · ${cliente.proxima_faixa_etaria}`
                              : ""}
                            {cliente.valor_proxima_faixa !== null &&
                            cliente.valor_proxima_faixa !== undefined
                              ? ` · ${Number(cliente.valor_proxima_faixa).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL"
                                  }
                                )}`
                              : ""}
                          </span>
                        )}
                      </div>
                    )}

                  </div>


                  <div className="proposta-info">

                    <strong>
                      {cliente.plano?.nome ||
                        "Sem plano"}
                    </strong>

                    <span
                      className={`status ${cliente.status}`}
                    >
                      {cliente.status}
                    </span>


                    <button
                      className="icone-botao"
                      onClick={() => {
                        setClienteEditando(cliente)
                        setMostrarFormulario(true)
                      }}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>


                    {admin && (

                      <button
                        className="icone-botao perigo"
                        onClick={() =>
                          excluir(cliente)
                        }
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </Layout>
  )
}
