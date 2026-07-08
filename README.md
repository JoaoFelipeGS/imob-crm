# Órbita CRM — CRM para Imobiliária

CRM com pipeline (kanban), cadastro de clientes, anotações, aba de negócios
fechados com controle de comissão. Feito para rodar de graça na Vercel com
banco Postgres no Neon.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + NextAuth.

## 1. Rodando localmente

### Pré-requisitos
- Node.js 18 ou superior
- Uma conta grátis no [Neon](https://neon.tech) (banco Postgres)

### Passo a passo

```bash
# 1. instale as dependências
npm install

# 2. copie o .env.example para .env e preencha com os dados do Neon
cp .env.example .env
```

No Neon, crie um projeto e copie duas strings de conexão:
- **DATABASE_URL**: a connection string com "`-pooler`" no host (usada pelo app)
- **DIRECT_URL**: a connection string sem pooler (usada só pelo Prisma para migrations)

Gere também um `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

```bash
# 3. crie as tabelas no banco
npx prisma db push

# 4. crie o usuário admin e alguns dados de exemplo
npm run db:seed

# 5. rode o projeto
npm run dev
```

Acesse `http://localhost:3000`. Login de teste: `admin@imobiliaria.com` / `123456`
(troque a senha depois — veja seção "Gerenciar usuários" abaixo).

## 2. Deploy grátis (Vercel + Neon)

### 2.1 Banco de dados (Neon)
1. Crie uma conta em [neon.tech](https://neon.tech) (plano grátis).
2. Crie um projeto/banco (ex: `imob-crm`).
3. No painel do Neon, copie a **connection string com pooler** (variável
   `DATABASE_URL`) e a **connection string direta** (`DIRECT_URL`) — geralmente
   aparecem juntas em "Connection Details", uma com `-pooler` no nome do host.

### 2.2 Subir o código para o GitHub
```bash
git init
git add .
git commit -m "CRM imobiliária"
git branch -M main
git remote add origin https://github.com/JoaoFelipeGS/imob-crm.git
git push -u origin main
```
> Se o repositório já existir e estiver vazio, esse comando envia o código direto. Se não estiver vazio, primeiro faça um `git pull origin main --allow-unrelated-histories` e resolva conflitos.

### 2.3 Deploy na Vercel
1. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e
   importe o repositório.
2. Em **Environment Variables**, adicione:
   - `DATABASE_URL` → string com pooler do Neon
   - `DIRECT_URL` → string direta do Neon
   - `NEXTAUTH_SECRET` → gere com `openssl rand -base64 32`
   - `NEXTAUTH_URL` → a URL final do projeto (ex: `https://seu-crm.vercel.app`)
     — dá pra colocar depois do primeiro deploy e fazer redeploy.
3. Clique em **Deploy**.

### 2.4 Criar as tabelas no banco de produção
Depois do primeiro deploy, rode uma única vez a partir da sua máquina
(com o `.env` apontando para o banco do Neon):
```bash
npx prisma db push
npm run db:seed
```
Isso cria as tabelas e o usuário admin no banco de produção.

Pronto — CRM no ar, de graça.

## 3. Gerenciar usuários (corretores)

Por enquanto a criação de corretores é feita direto no banco. Formas simples:
- `npx prisma studio` (abre uma interface visual do banco) e criar um `User`
  manualmente — lembre de gerar o hash da senha com bcrypt antes.
- Ou editar `prisma/seed.ts` e rodar `npm run db:seed` de novo.

Se quiser, posso adicionar uma tela de "Gerenciar equipe" dentro do próprio
CRM para cadastrar corretores pela interface — é só pedir.

## 4. Estrutura do projeto

```
src/app/(app)/pipeline     → board kanban (arrastar clientes entre status)
src/app/(app)/clientes     → cadastro e detalhe do cliente (com anotações)
src/app/(app)/fechados     → negócios fechados e controle de comissão
src/app/api                → rotas da API (clientes, notas, negócios, auth)
prisma/schema.prisma       → modelo do banco de dados
```

## 5. O que já vem pronto
- Login por e-mail/senha (NextAuth)
- Pipeline com 5 etapas + coluna de fechados, drag and drop
- Marcar cliente como perdido
- Cadastro completo de cliente (origem do lead, interesse, imóvel, valor, corretor)
- Anotações por cliente, com autor e data
- Aba de fechados com: valor da venda, valor da comissão, status da comissão
  (pendente / parcial / recebida), previsão de recebimento e data efetiva
- Visual escuro "futurístico" com cyan/violeta, feito do zero em Tailwind
