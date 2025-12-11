# 🚀 Configuração de Variáveis de Ambiente na Vercel

Guia para configurar as variáveis de ambiente no dashboard da Vercel.

## 📋 Pré-requisitos

- Projeto já conectado à Vercel
- API Keys das integrações em mãos

## 🔧 Como Adicionar Variáveis na Vercel

### Método 1: Via Dashboard (Recomendado)

1. **Acesse o Dashboard**
   ```
   https://vercel.com/[seu-usuario]/viva-academy/settings/environment-variables
   ```

2. **Adicionar cada variável**:
   - Nome: `OPENAI_API_KEY`
   - Valor: `sk-proj-sua-chave-aqui`
   - Ambientes: Marque **Production**, **Preview** e **Development**
   - Clique em **Save**

3. **Repita para todas as variáveis** (veja lista abaixo)

### Método 2: Via CLI (Mais Rápido)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link do projeto (se ainda não estiver linkado)
vercel link

# Adicionar variável
vercel env add OPENAI_API_KEY

# Quando perguntado, cole o valor e selecione os ambientes
```

### Método 3: Pull/Push em Massa

```bash
# Puxar variáveis existentes da Vercel
vercel env pull .env.vercel

# Editar .env.vercel localmente

# Enviar de volta (cada variável individualmente)
# Vercel não tem push em massa, precisa usar CLI ou dashboard
```

## 📝 Variáveis Obrigatórias

### 1. OpenAI (Obrigatório)

```bash
vercel env add OPENAI_API_KEY
# Cole: sk-proj-xxxxx

vercel env add OPENAI_MODEL
# Cole: gpt-4-turbo-preview

vercel env add OPENAI_TEMPERATURE
# Cole: 0.7
```

### 2. Vercel Postgres (Auto-configurado)

✅ **Não precisa adicionar manualmente!**

Quando você criar o database Postgres no Vercel:
- Dashboard → Storage → Create Database → Postgres
- A Vercel automaticamente adiciona todas as variáveis `POSTGRES_*`

### 3. Vercel KV (Auto-configurado)

✅ **Não precisa adicionar manualmente!**

Quando você criar o KV store no Vercel:
- Dashboard → Storage → Create Database → KV
- A Vercel automaticamente adiciona todas as variáveis `KV_*`

### 4. Evolution API (WhatsApp) - Opcional

```bash
vercel env add EVOLUTION_API_URL
# Cole: https://sua-instancia.evolution-api.com

vercel env add EVOLUTION_API_KEY
# Cole: sua-api-key

vercel env add EVOLUTION_INSTANCE_NAME
# Cole: viva-academy-bot

vercel env add WHATSAPP_PHONE_NUMBER
# Cole: 5511999999999

vercel env add WEBHOOK_SECRET
# Cole: seu-secret-seguro-aqui
```

### 5. Configurações da Aplicação

```bash
vercel env add NODE_ENV
# Cole: production

vercel env add ALLOWED_ORIGINS
# Cole: https://www.vivaacademy.app,https://vivaacademy.app

vercel env add RATE_LIMIT_WINDOW_MS
# Cole: 60000

vercel env add RATE_LIMIT_MAX_REQUESTS
# Cole: 20
```

### 6. Outras Variáveis

```bash
vercel env add VITE_FACEBOOK_PIXEL_ID
# Cole: 1854846648400452

vercel env add VITE_API_BASE_URL
# Cole: /api
```

## 🎯 Configuração via Dashboard - Passo a Passo

### Passo 1: Acessar Configurações

1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **viva-academy**
3. Vá em **Settings** (engrenagem no topo)
4. No menu lateral, clique em **Environment Variables**

### Passo 2: Adicionar OpenAI

```
Name: OPENAI_API_KEY
Value: sk-proj-[sua-chave-aqui]
Environments: ✅ Production ✅ Preview ✅ Development
```

Clique em **Save**

Repita para:
- `OPENAI_MODEL` = `gpt-4-turbo-preview`
- `OPENAI_TEMPERATURE` = `0.7`

### Passo 3: Criar Postgres Database

1. No menu lateral, vá em **Storage**
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Escolha região: **São Paulo (gru1)**
5. Clique em **Create**

✅ **Pronto!** As variáveis `POSTGRES_*` foram adicionadas automaticamente.

### Passo 4: Criar KV Store

1. No menu lateral, vá em **Storage**
2. Clique em **Create Database**
3. Selecione **KV**
4. Escolha região: **São Paulo (gru1)**
5. Clique em **Create**

✅ **Pronto!** As variáveis `KV_*` foram adicionadas automaticamente.

### Passo 5: Verificar Variáveis

1. Volte em **Settings** → **Environment Variables**
2. Você deve ver todas as variáveis listadas:

```
✅ OPENAI_API_KEY
✅ OPENAI_MODEL
✅ OPENAI_TEMPERATURE
✅ POSTGRES_URL
✅ POSTGRES_PRISMA_URL
✅ POSTGRES_URL_NON_POOLING
✅ KV_URL
✅ KV_REST_API_URL
✅ KV_REST_API_TOKEN
✅ KV_REST_API_READ_ONLY_TOKEN
```

## 🔄 Redesign Após Adicionar Variáveis

**IMPORTANTE**: Depois de adicionar variáveis, você precisa **redesdobrar** o projeto:

```bash
# Via CLI
vercel --prod

# Ou via Dashboard
# Vá em Deployments → Clique nos 3 pontinhos → Redeploy
```

## 🧪 Testar se Funcionou

1. **Acesse o endpoint de health**:
   ```
   https://vivaacademy.app/api/health
   ```

2. **Você deve ver**:
   ```json
   {
     "status": "healthy",
     "services": {
       "database": "healthy",
       "evolutionAPI": "healthy",
       "openai": "configured"
     }
   }
   ```

## 📊 Diferenças entre Ambientes

| Aspecto | Local (.env) | Vercel (Dashboard) |
|---------|-------------|-------------------|
| **Onde** | Arquivo `.env` na raiz | Dashboard da Vercel |
| **Quando usar** | `npm run dev` | Site em produção |
| **Como adicionar** | Editar arquivo | Dashboard ou CLI |
| **Segurança** | ⚠️ Não commitar no git | ✅ Seguro (não exposto) |
| **Banco de dados** | Pode usar o mesmo da Vercel | Criado na Vercel |

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca commite .env no git**
   - Já configurado no `.gitignore`

2. **Use valores diferentes entre ambientes**
   - Desenvolvimento: Pode usar banco de teste
   - Produção: Use banco de produção

3. **Rotacione keys regularmente**
   - OpenAI: Regenere a cada 3-6 meses
   - Webhook secrets: Troque se suspeitar de vazamento

### ❌ Evite

- Compartilhar API keys por email/chat
- Usar mesma key em múltiplos projetos
- Commitar .env no git
- Expor keys em logs

## 💡 Dicas Pro

### Usar .env.local para desenvolvimento

```bash
# Criar .env.local (ignorado pelo git)
cp .env.example .env.local

# Editar com suas keys
code .env.local
```

### Sincronizar com Vercel

```bash
# Baixar variáveis da Vercel para local
vercel env pull .env.local

# Agora você tem as mesmas variáveis localmente!
```

### Testar antes de deployar

```bash
# 1. Baixar env da Vercel
vercel env pull .env.local

# 2. Renomear para .env
mv .env.local .env

# 3. Testar localmente
npm run test:integrations

# 4. Se tudo ok, fazer deploy
vercel --prod
```

## 🆘 Troubleshooting

### "Variable not found in production"

1. Verifique se adicionou a variável
2. Marque os 3 ambientes (Production, Preview, Development)
3. Redesploy o projeto

### "Cannot connect to database"

1. Certifique que criou o Postgres database na Vercel
2. As variáveis devem ter sido adicionadas automaticamente
3. Verifique em Settings → Environment Variables
4. Redesploy

### "OpenAI API key invalid"

1. Verifique se copiou a key completa
2. Sem espaços no início/fim
3. Regenere a key se necessário
4. Redesploy após atualizar

## ✅ Checklist Final

Antes de ir para produção:

- [ ] OpenAI API key adicionada na Vercel
- [ ] Postgres database criado (variáveis auto-adicionadas)
- [ ] KV store criado (variáveis auto-adicionadas)
- [ ] Evolution API configurada (se usar WhatsApp)
- [ ] `ALLOWED_ORIGINS` configurado corretamente
- [ ] Projeto redesployado após adicionar variáveis
- [ ] `/api/health` retorna status "healthy"
- [ ] Chat web testado em produção
- [ ] WhatsApp testado (se configurado)

---

**Resumo**: Configure OpenAI no dashboard, crie Postgres e KV (auto-configuram), e redesploy! 🚀
