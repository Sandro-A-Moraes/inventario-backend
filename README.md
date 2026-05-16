# Inventario Backend

API backend em Node.js + TypeScript para autenticação e base de gerenciamento de
usuários, com estrutura modular, Prisma ORM e documentação Swagger.

## Status do projeto

O projeto está em desenvolvimento ativo.

Funcionalidades implementadas até o momento:

- Cadastro de usuário
- Login com geração de access token e refresh token
- Login com geração de access token e refresh token (entregues como HttpOnly
  cookies)
- Logout com revogação de refresh token
- Renovação de sessão por refresh token
- Endpoint de perfil autenticado (`/me`)
- Healthcheck da API
- Documentação Swagger
- Teste unitário inicial do `AuthService`

Funcionalidades ainda não implementadas:

- Módulos de domínio de inventário (produtos, estoque, movimentações, etc.)

## Stack e tecnologias

- Runtime: Node.js
- Linguagem: TypeScript
- Framework HTTP: Express
- ORM: Prisma (adapter PostgreSQL)
- Banco de dados: PostgreSQL
- Autenticação: JWT (`jsonwebtoken`) + `bcrypt`
- Documentação: Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- Testes: Vitest
- Qualidade: ESLint + Prettier + Husky + Commitlint
- Utilitário de revisão por IA: Gemini (`@google/generative-ai`)

## Arquitetura atual

O projeto segue uma organização modular por domínio, com separação de
responsabilidades:

- `controller`: camada HTTP (recebe request, retorna response)
- `service`: regras de negócio
- `repository`: acesso a dados
- `types`: contratos de entrada/saída
- `infra/http`: inicialização da aplicação, middlewares e roteamento
- `shared`: utilitários e componentes compartilhados (erros, config, tokens)

### Estrutura de pastas (resumo)

```text
prisma/
	schema.prisma
	migrations/
src/
	ai/
		run-agent.ts
		agent/
	generated/
		prisma/
	infra/
		http/
			app.ts
			server.ts
			middleware/
			routes/
	lib/
		prisma.ts
	modules/
		auth/
			controller/
			repository/
			routes/
			service/
			types/
		middleware/
		user/
			repository/
			types/
	shared/
		config/
		errors/
		types/
		utils/
```

## Modelagem de dados (Prisma)

Atualmente existem duas entidades no banco:

### User

- `id` (UUID, PK)
- `fullName`
- `email` (único)
- `hashedPassword`
- `tokenVersion` (inteiro, default `0`)
- `createdAt`
- `updatedAt`

### RefreshToken

- `id` (UUID, PK)
- `jti` (único)
- `tokenHash` (único)
- `userId` (FK para `User`)
- `userAgent` (opcional)
- `ipAddress` (opcional)
- `createdAt`
- `expiresAt`
- `revokedAt` (opcional)

Observações importantes:

- O refresh token é armazenado em hash (`sha256`), não em texto puro.
- O `tokenVersion` do usuário é usado para invalidar access tokens antigos.

## Fluxo de autenticação

### Registro

1. Valida formato de e-mail.
2. Verifica se já existe usuário com o e-mail.
3. Faz hash da senha com `bcrypt`.
4. Cria o usuário no banco.

### Login

1. Busca usuário por e-mail.
2. Compara senha com `bcrypt.compare`.
3. Gera `jti` aleatório.
4. Gera refresh token (JWT) e salva hash do token no banco.
5. Gera access token com `sub`, `email` e `tokenVersion`.
6. Os tokens são definidos como cookies HttpOnly: `accessToken` (15m) e
   `refreshToken` (7d).

### Logout

1. Lê o refresh token do cookie HttpOnly `refreshToken`.
2. Busca hash no banco.
3. Revoga token (`revokedAt`).
4. Incrementa `tokenVersion` do usuário para invalidar access tokens ativos.

### Refresh

1. Valida presença do refresh token no cookie HttpOnly `refreshToken`.
2. Busca token por hash.
3. Verifica se existe, não está revogado e não expirou.
4. Busca usuário.
5. Gera novo par de tokens e salva novo refresh token no banco. O novo
   `accessToken` é entregue como cookie HttpOnly.

### Endpoint protegido (`/me`)

O middleware de autenticação:

1. Lê `Authorization: Bearer <token>`.
2. Verifica assinatura do access token.
3. Busca `tokenVersion` atual do usuário.
4. Compara com o `tokenVersion` presente no JWT.
5. Se válido, injeta `userId` na request.

## Rotas disponíveis

Prefixo base: `/api/v1`

### Health

- `GET /health`

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-05-08T12:00:00.000Z",
  "uptime": 1234.56
}
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me` (protegida por Bearer token)

Observação: o endpoint `POST /auth/login` define os cookies HttpOnly
`accessToken` e `refreshToken`. Os endpoints `POST /auth/refresh` e
`POST /auth/logout` leem o refresh token a partir do cookie HttpOnly
`refreshToken` (não é necessário enviar o token no corpo da requisição).

## Tratamento de erros

O middleware global trata:

- `AppError`: retorna o `statusCode` definido pela regra de negócio.
- `PrismaClientKnownRequestError`:
  - `P2002` -> `409` (`This value already exists`)
  - Demais erros de banco -> `500`
- Erros não mapeados -> `500` (`Internal server error`)

## Variáveis de ambiente

Crie um arquivo `.env` na raiz. Exemplo base:

```env
PORT="3000"
BASE_URL="http://localhost:3000/api/v1"
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
JWT_SECRET_KEY="your_jwt_secret_key"
JWT_REFRESH_SECRET_KEY="your_jwt_secret_key"
GEMINI_API_KEY="sua_chave_aqui"
FRONTEND_URL="http://localhost:5173"
```

Descrição rápida:

- `PORT`: porta HTTP da API.
- `BASE_URL`: base usada no Swagger para documentação de servidores.
- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma.
- `JWT_SECRET_KEY`: segredo do access token.
- `JWT_REFRESH_SECRET_KEY`: segredo do refresh token.
- `GEMINI_API_KEY`: chave da integração de revisão por IA.
- `FRONTEND_URL`: origem permitida no CORS.

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- npm
- PostgreSQL disponível

### Passo a passo

1. Instalar dependências:

```bash
npm install
```

2. Configurar variáveis de ambiente (`.env`) com base no `.env.example`.

3. Gerar cliente Prisma:

```bash
npm run prisma:generate
```

4. Aplicar migrações no banco:

```bash
npm run prisma:migrate
```

5. Subir API em modo desenvolvimento:

```bash
npm run dev
```

Servidor padrão: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

## Scripts disponíveis

- `npm run dev`: inicia servidor com `tsx watch`
- `npm run start`: inicia servidor sem watch
- `npm run build`: valida compilação TypeScript (`tsc --noEmit`)
- `npm run lint`: roda ESLint
- `npm run lint:fix`: corrige problemas de lint automaticamente
- `npm run test`: executa testes em modo run
- `npm run test:watch`: executa testes em modo watch
- `npm run test:coverage`: executa testes com cobertura
- `npm run prisma:generate`: gera cliente Prisma
- `npm run prisma:migrate`: cria/aplica migration (`prisma migrate dev`)
- `npm run prisma:studio`: abre Prisma Studio
- `npm run ai:review`: executa agente de revisão por IA em arquivos alterados

## Testes

Framework: Vitest.

Atualmente há cobertura inicial do serviço de autenticação.

Configuração importante:

- Existe setup global de testes (`src/test/setup-env.ts`) para definir segredos
  JWT em ambiente de teste.
- Isso evita falha de import quando o módulo de ambiente exige variáveis
  obrigatórias.

Comandos principais:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## CORS e segurança

- CORS habilitado com origem baseada em `FRONTEND_URL`.
- Access token com expiração de `15m`.
- Refresh token com expiração de `7d`.
- Invalidação de sessões por `tokenVersion` no usuário.
- Refresh tokens revogáveis por `revokedAt`.

## Swagger

A documentação OpenAPI é gerada a partir de anotações nas rotas
(`src/modules/**/routes/*.ts`). As rotas de autenticação foram atualizadas para
documentar que os tokens podem ser entregues/leídos via cookies HttpOnly
(`accessToken` e `refreshToken`).

URL local:

- `http://localhost:3000/docs`

Exemplos rápidos com `curl` (salvando/reenviando cookies):

1. Login (salva cookies em `cookies.txt`):

```bash
curl -c cookies.txt -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/auth/login -d '{"email":"john@example.com","password":"securePassword123!"}'
```

2. Refresh (envia cookie salvo):

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/v1/auth/refresh
```

3. Logout (envia cookie salvo):

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/v1/auth/logout
```

## Utilitário de revisão por IA

O projeto possui um agente interno para revisão de alterações em arquivos
TypeScript:

- Entrada: arquivos modificados no git
- Filtros: ignora `node_modules`, `dist`, testes e arquivos do próprio agente
- Limites atuais: até 3 arquivos e contexto total aproximado de 12k caracteres
- Modelo configurado: `gemini-2.5-flash`

Execução:

```bash
npm run ai:review
```

Requer `GEMINI_API_KEY` válido no `.env`.

## Convenções e qualidade de código

- Lint: ESLint com TypeScript
- Formatação: Prettier
- Hooks: Husky + lint-staged
- Commits: Commitlint com Conventional Commits

## Próximos passos sugeridos

- Expandir testes unitários para `login`, `refresh`, `logout` e middleware de
  autenticação.
- Adicionar testes de integração HTTP para as rotas de auth.
- Implementar os módulos de inventário (domínio principal).
- Avaliar política de rotação/revogação avançada de refresh tokens.

---

Se você quiser, eu também posso montar uma seção de exemplos de requisições com
`curl` para cada endpoint de auth.
