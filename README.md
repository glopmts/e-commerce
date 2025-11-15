# 🛒 E-Commerce Platform

Uma plataforma de e-commerce moderna e completa construída com Next.js 15+, tRPC, e integração com Mercado Pago para pagamentos via PIX.

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias de ponta:

- **[Next.js 15+](https://nextjs.org/)** - Framework React com App Router e Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[tRPC](https://trpc.io/)** - Type-safe APIs sem necessidade de schemas
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional robusto
- **[Better Auth](https://www.better-auth.com/)** - Autenticação moderna e segura
- **[Mercado Pago](https://www.mercadopago.com.br/)** - Gateway de pagamento via PIX
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- [x] Registro de usuários com validação de email
- [x] Login seguro com Better Auth
- [x] Recuperação de senha
- [x] Perfis de usuário (Cliente e Administrador)
- [x] Proteção de rotas

### 🛍️ Catálogo de Produtos
- [x] Listagem de produtos com filtros avançados
- [x] Busca por nome, categoria e preço
- [x] Detalhes completos do produto
- [x] Galeria de imagens
- [x] Gestão de estoque em tempo real

### ⭐ Sistema de Avaliações
- [x] Avaliação de produtos (1-5 estrelas)
- [x] Comentários e reviews
- [x] Média de avaliações
- [x] Validação: apenas compradores podem avaliar
- [x] Moderação de comentários

### 🛒 Carrinho de Compras
- [x] Adicionar/remover produtos
- [x] Atualizar quantidades
- [x] Cálculo automático de totais
- [x] Persistência entre sessões

### 💳 Pagamentos
- [x] Integração completa com Mercado Pago
- [x] Pagamento via PIX com QR Code
- [x] Confirmação automática de pagamento
- [x] Webhooks para atualização de status
- [x] Histórico de pedidos

### 📊 Painel Administrativo
- [x] Gestão de produtos (CRUD completo)
- [x] Gerenciamento de pedidos
- [x] Controle de estoque
- [x] Relatórios de vendas
- [x] Moderação de avaliações

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **pnpm** ou **yarn**
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

## 🔧 Instalação

### 1. Clone o repositório

\`\`\`bash
git clone https://github.com/seu-usuario/seu-ecommerce.git
cd seu-ecommerce
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
# ou
pnpm install
# ou
yarn install
\`\`\`

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

\`\`\`env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecommerce?schema=public"

# Better Auth
BETTER_AUTH_SECRET="seu-secret-super-seguro-aqui"
BETTER_AUTH_URL="http://localhost:3000"

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="seu-access-token-aqui"
MERCADO_PAGO_PUBLIC_KEY="sua-public-key-aqui"
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="sua-public-key-aqui"

# Webhooks
WEBHOOK_SECRET="seu-webhook-secret-aqui"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
\`\`\`

### 4. Configure o banco de dados

\`\`\`bash
# Gerar o Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Seed do banco de dados
npx prisma db seed
\`\`\`

### 5. Inicie o servidor de desenvolvimento

\`\`\`bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

\`\`\`
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── (shop)/            # Rotas da loja
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes de UI
│   ├── cart/             # Componentes do carrinho
│   ├── product/          # Componentes de produto
│   └── reviews/          # Componentes de avaliação
├── server/               # Lógica do servidor
│   ├── routers/         # Routers do tRPC
│   ├── procedures/      # Procedures do tRPC
│   └── context.ts       # Contexto do tRPC
├── lib/                 # Utilitários e configurações
│   ├── auth.ts         # Configuração Better Auth
│   ├── db.ts           # Cliente Prisma
│   ├── trpc.ts         # Configuração tRPC
│   └── mercadopago.ts  # Cliente Mercado Pago
├── prisma/
│   ├── schema.prisma   # Schema do banco de dados
│   └── seed.ts         # Dados iniciais
├── types/              # Tipos TypeScript
└── validations/        # Schemas Zod
\`\`\`

## 🎯 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:push      # Sincroniza schema sem migration
npm run db:migrate   # Cria e executa migrations
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula banco com dados iniciais

# Qualidade de Código
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
npm run format       # Formata código com Prettier
\`\`\`

## 🔐 Configuração do Better Auth

1. Acesse o arquivo `lib/auth.ts`
2. Configure os providers desejados
3. Personalize as páginas de autenticação em `app/(auth)/`

## 💰 Configuração do Mercado Pago

### 1. Obter credenciais

1. Acesse o [Painel do Mercado Pago](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Copie o `Access Token` e `Public Key`

### 2. Configurar Webhooks

Para receber notificações de pagamento:

1. Configure a URL do webhook: `https://seu-dominio.com/api/webhooks/mercadopago`
2. Adicione o `WEBHOOK_SECRET` no `.env`
3. Selecione os eventos: `payment.created`, `payment.updated`

## 📊 Modelo de Dados

### Principais entidades:

- **User**: Usuários do sistema
- **Product**: Produtos do catálogo
- **Category**: Categorias de produtos
- **Cart**: Carrinho de compras
- **Order**: Pedidos realizados
- **Review**: Avaliações de produtos
- **Payment**: Informações de pagamento

Veja o schema completo em `prisma/schema.prisma`

## 🧪 Validações

Todas as validações são feitas com **Zod** para garantir type-safety:

\`\`\`typescript
// Exemplo de validação de produto
const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
})
\`\`\`

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras plataformas

- **Railway**: Suporte nativo para PostgreSQL
- **Render**: Free tier disponível
- **AWS/GCP**: Para maior controle

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Seu Nome
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- Next.js Team pela framework incrível
- tRPC pela simplicidade type-safe
- Mercado Pago pela API bem documentada
- Comunidade open-source

---

⭐ Se este projeto foi útil, considere dar uma estrela!
\`\`\`

Criei um README completo e profissional para seu e-commerce! O documento inclui:

✅ **Descrição detalhada** de todas as tecnologias
✅ **Lista completa de funcionalidades** organizadas por categoria
✅ **Guia de instalação** passo a passo
✅ **Configuração de variáveis de ambiente** com exemplos
✅ **Estrutura de pastas** bem documentada
✅ **Scripts disponíveis** para desenvolvimento
✅ **Instruções de deploy** para produção
✅ **Seções de contribuição e licença**

Você pode personalizá-lo alterando o nome do projeto, suas URLs e informações de contato. O README está em português brasileiro e segue as melhores práticas de documentação! 🎉
