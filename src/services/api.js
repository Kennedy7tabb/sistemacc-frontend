const API_URL = "http://136.248.106.15:8000"

function getToken() {
  return localStorage.getItem("token")
}

export function getAuthToken() {
  return getToken()
}

export function clearAuth() {
  localStorage.removeItem("token")
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getUsuarioToken() {
  const token = getToken()
  if (!token) return null

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    return {
      id: payload.sub ? Number(payload.sub) : null,
      tipo: payload.tipo || null
    }
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  })

  let data = null
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    data = await response.json()
  } else if (response.status !== 204) {
    data = await response.text()
  }

  if (response.status === 401 && path !== "/auth/login") {
    clearAuth()
    window.location.href = "/login"
    throw new Error("Sessão expirada. Faça login novamente.")
  }

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((item) => item.msg).join("\n")
      : data?.detail || "Ocorreu um erro na API."

    throw new Error(detail)
  }

  return data
}

export const api = {
  login: (email, senha) =>
    request(`/auth/login?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`, {
      method: "POST"
    }),

  clientes: {
    listar: () => request("/clientes/"),
    buscar: (id) => request(`/clientes/${id}`),
    criar: (dados) => request("/clientes/", { method: "POST", body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
    excluir: (id) => request(`/clientes/${id}`, { method: "DELETE" })
  },

  planos: {
    listar: () => request("/planos/"),
    buscar: (id) => request(`/planos/${id}`),
    criar: (dados) => request("/planos/", { method: "POST", body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/planos/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
    excluir: (id) => request(`/planos/${id}`, { method: "DELETE" })
  },

  propostas: {
    listar: () => request("/propostas/"),
    buscar: (id) => request(`/propostas/${id}`),
    criar: (dados) => request("/propostas/", { method: "POST", body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/propostas/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
    excluir: (id) => request(`/propostas/${id}`, { method: "DELETE" }),
    pdfUrl: (id) => `${API_URL}/propostas/${id}/pdf`,
    pdfDownloadUrl: (id) => `${API_URL}/propostas/${id}/pdf/download`
  },

  usuarios: {
    corretores: () => request("/usuarios/corretores"),
    buscarCorretor: (id) => request(`/usuarios/corretores/${id}`),
    criar: (dados) => request("/usuarios/", { method: "POST", body: JSON.stringify(dados) }),
    desativar: (id) => request(`/usuarios/corretores/${id}/desativar`, { method: "PUT" }),
    ativar: (id) => request(`/usuarios/corretores/${id}/ativar`, { method: "PUT" })
  }
}
