# LIFEBEN — Frontend

Frontend React/Vite do sistema de gestão da LifeBen, integrado ao backend FastAPI existente.

## O que já está funcional

- Login com JWT e armazenamento do token.
- Proteção das rotas internas.
- Logout.
- Dashboard com contadores reais da API.
- Clientes: listar, pesquisar, cadastrar, editar e excluir (exclusão para admin).
- Máscara de CPF `000.000.000-00` e telefone.
- Planos: listar, cadastrar, editar e excluir (admin).
- Propostas: listar, pesquisar, cadastrar, editar status/valor/observações, excluir e gerar PDF.
- Usuários: listar corretores, criar corretor e ativar/desativar (admin).
- Tratamento de erros retornados pelo FastAPI.
- Layout mantendo a identidade minimalista já usada no projeto.

## Executar

1. Entre nesta pasta no terminal:

   `cd frontend`

2. Instale as dependências:

   `npm install`

3. Inicie o frontend:

   `npm run dev`

4. Acesse:

   `http://localhost:5173/login`

## Backend

O frontend está configurado para chamar:

`http://localhost:8000`

O backend precisa estar rodando nessa porta.

O `main.py` do backend atual já possui CORS para `http://localhost:5173`, que é o endereço usado acima.

Se você abrir o frontend usando `http://127.0.0.1:5173`, o backend deverá também permitir essa origem no CORS.

## Observação sobre a API de login

O endpoint atual do backend recebe `email` e `senha` como parâmetros da requisição `/auth/login?email=...&senha=...`. O frontend respeita exatamente esse contrato para não exigir alteração no backend.
