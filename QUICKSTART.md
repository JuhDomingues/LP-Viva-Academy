# 🚀 Quickstart - Viva Academy AI Agent

Guia rápido para começar em 5 minutos!

## 1️⃣ Instalar Dependências

```bash
npm install
```

## 2️⃣ Configurar Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais
nano .env
# ou
code .env
```

### Variáveis Mínimas Necessárias

Para testar o agente localmente, você precisa de **no mínimo**:

```env
# OpenAI (obrigatório)
OPENAI_API_KEY=sk-proj-xxxxx

# Vercel Postgres (obrigatório)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Vercel KV (obrigatório para rate limiting)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

Evolution API (WhatsApp) é **opcional** para testes iniciais - você pode testar apenas o chat web.

## 3️⃣ Setup do Projeto

```bash
# Validar ambiente
npm run env:validate

# Inicializar banco de dados
npm run db:init

# Testar integrações
npm run test:integrations
```

## 4️⃣ Rodar Localmente

```bash
npm run dev
```

Acesse: http://localhost:8080

## 5️⃣ Testar o Chat

1. Clique no ícone de chat no canto inferior direito
2. Digite uma mensagem: "Olá, quero saber sobre imigração"
3. O agente deve responder!

---

## 🎯 Próximos Passos

### Configurar WhatsApp

Para ativar o WhatsApp, você precisa:

1. **Obter Evolution API**
   - Opção 1: Usar serviço gerenciado (recomendado)
   - Opção 2: Self-hosted com Docker

2. **Adicionar ao .env**:
```env
EVOLUTION_API_URL=https://sua-instancia.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=viva-academy-bot
WHATSAPP_PHONE_NUMBER=5511999999999
WEBHOOK_SECRET=seu-secret-seguro
```

3. **Escanear QR Code** no painel da Evolution API

4. **Configurar Webhook**:
   - URL: `https://seu-dominio.vercel.app/api/webhook`
   - Events: `messages.upsert`

Ver guia completo em: [SETUP.md](./SETUP.md#2-evolution-api-whatsapp)

### Deploy para Produção

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Lembre-se de configurar as variáveis de ambiente no dashboard do Vercel!

---

## 📚 Documentação

- [SETUP.md](./SETUP.md) - Guia completo de configuração
- [CLAUDE.md](./CLAUDE.md) - Instruções para o Claude Code
- [scripts/README.md](./scripts/README.md) - Documentação dos scripts

## 🆘 Precisa de Ajuda?

### Problema: "OpenAI API Key inválida"

```bash
# Verifique se a key está no formato correto
echo $OPENAI_API_KEY

# Deve começar com: sk-proj-
```

Obter nova key: https://platform.openai.com/api-keys

### Problema: "Database connection failed"

1. Certifique-se que criou o Postgres no Vercel
2. Copie TODAS as variáveis `POSTGRES_*` para o .env
3. Teste: `npm run db:init`

### Problema: "KV connection failed"

1. Crie um KV store no Vercel
2. Copie TODAS as variáveis `KV_*` para o .env
3. Teste: `npm run test:integrations`

### Todos os scripts falharam

```bash
# Validar .env primeiro
npm run env:validate

# Ver quais variáveis estão faltando
```

---

## ✅ Checklist Rápido

- [ ] `npm install` executado
- [ ] `.env` criado e preenchido
- [ ] `npm run env:validate` passou
- [ ] `npm run db:init` criou tabelas
- [ ] `npm run test:integrations` passou
- [ ] `npm run dev` iniciou sem erros
- [ ] Chat web funcionando em localhost:8080

**Pronto!** Você tem um agente de IA funcionando localmente! 🎉

Para adicionar WhatsApp e fazer deploy, veja [SETUP.md](./SETUP.md).
