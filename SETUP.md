# Guia de Configuração - Viva Academy AI Agent

Este guia irá te ajudar a configurar todas as integrações necessárias para o funcionamento completo do agente de IA.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Vercel (para Postgres e KV)
- Conta OpenAI com créditos disponíveis
- Instância Evolution API configurada (para WhatsApp)

## 🚀 Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Validar ambiente
npm run env:validate

# 4. Inicializar banco de dados
npm run db:init

# 5. Testar integrações
npm run test:integrations
```

## 🔧 Configuração Detalhada

### 1. OpenAI API

#### Obter API Key

1. Acesse https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a chave gerada

#### Configurar no .env

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
```

#### Modelos Recomendados

- **Produção**: `gpt-4-turbo-preview` (melhor qualidade)
- **Desenvolvimento**: `gpt-3.5-turbo` (mais econômico)
- **Alto Volume**: `gpt-4-turbo` (rápido e eficiente)

#### Monitoramento de Custos

- Dashboard: https://platform.openai.com/usage
- Configure limites de gasto em: https://platform.openai.com/account/limits

### 2. Evolution API (WhatsApp)

Evolution API é uma API open-source para integração com WhatsApp via QR Code.

#### Opções de Instalação

**Opção A: Usar Serviço Gerenciado**
- https://evolution-api.com/ (recomendado para produção)
- Já configurado e otimizado
- Suporte técnico incluído

**Opção B: Auto-hospedagem**

```bash
# Clone o repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configure o .env
cp .env.example .env

# Inicie com Docker
docker-compose up -d
```

#### Configurar Instância

1. Acesse o painel da Evolution API
2. Crie uma nova instância (dê o nome: `viva-academy-bot`)
3. Escaneie o QR Code com o WhatsApp Business
4. Aguarde a conexão ser estabelecida

#### Configurar Webhook

1. No painel da Evolution API, vá em Settings → Webhooks
2. Configure:
   - **URL**: `https://seu-dominio.com/api/webhook`
   - **Events**: Marque `messages.upsert`
   - **Webhook Secret**: Gere um secret seguro

#### Configurar no .env

```env
EVOLUTION_API_URL=https://sua-instancia.evolution-api.com
EVOLUTION_API_KEY=your-api-key-here
EVOLUTION_INSTANCE_NAME=viva-academy-bot
WHATSAPP_PHONE_NUMBER=5511999999999
WEBHOOK_SECRET=your-secure-webhook-secret
```

#### Testar Conexão

```bash
# Verificar se instância está conectada
curl -X GET "https://sua-instancia.evolution-api.com/instance/connectionState/viva-academy-bot" \
  -H "apikey: your-api-key"
```

### 3. Vercel Postgres

#### Criar Database

1. Acesse https://vercel.com/dashboard
2. Vá em Storage → Create Database
3. Selecione "Postgres" → Continue
4. Escolha a região (recomendado: `gru1` - São Paulo)
5. Clique em "Create"

#### Obter Credenciais

1. No dashboard do database, vá em `.env.local` tab
2. Copie todas as variáveis `POSTGRES_*`
3. Cole no seu `.env`

#### Inicializar Schema

```bash
npm run db:init
```

Este comando irá:
- Criar todas as tabelas (chat_sessions, conversations, messages, leads, chat_events)
- Criar índices para performance
- Configurar triggers para updated_at

#### Reset Database (se necessário)

```bash
npm run db:reset  # Remove todas as tabelas
npm run db:init   # Recria tudo
```

#### Monitoramento

- Dashboard: https://vercel.com/dashboard/stores
- Você pode ver queries, métricas e logs

### 4. Vercel KV (Redis)

Usado para rate limiting e cache.

#### Criar KV Store

1. Acesse https://vercel.com/dashboard
2. Vá em Storage → Create Database
3. Selecione "KV" → Continue
4. Escolha a região (mesma do Postgres)
5. Clique em "Create"

#### Obter Credenciais

1. No dashboard do KV, vá em `.env.local` tab
2. Copie todas as variáveis `KV_*`
3. Cole no seu `.env`

#### Testar KV

```bash
# O script de teste já inclui testes de KV
npm run test:integrations
```

### 5. Configurações Adicionais

#### CORS e Allowed Origins

Para produção, configure domínios específicos:

```env
ALLOWED_ORIGINS=https://www.vivaacademy.app,https://vivaacademy.app
```

Para desenvolvimento local:

```env
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

#### Rate Limiting

Configure os limites de taxa:

```env
RATE_LIMIT_WINDOW_MS=60000      # 1 minuto
RATE_LIMIT_MAX_REQUESTS=20      # 20 requisições por minuto
```

- WhatsApp users: 50 mensagens/minuto (hardcoded)
- Web users: configurável via env vars

## 🧪 Testes

### Validar Variáveis de Ambiente

```bash
npm run env:validate
```

Verifica se todas as variáveis necessárias estão configuradas.

### Testar Integrações

```bash
npm run test:integrations
```

Testa:
- ✅ OpenAI API (envia mensagem de teste)
- ✅ Evolution API (verifica conexão WhatsApp)
- ✅ Vercel Postgres (verifica tabelas)
- ✅ Vercel KV (testa read/write)
- ✅ Rate Limiter (testa funcionamento)

### Testar Agente Completo

#### Teste Web Chat

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:8080
# Clique no ícone de chat no canto inferior direito
# Envie uma mensagem de teste
```

#### Teste WhatsApp

1. Envie uma mensagem para o número configurado
2. Aguarde a resposta do agente
3. Verifique os logs no Vercel

## 📊 Monitoramento

### Logs do Vercel

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Visualize logs em tempo real
vercel logs
```

### Visualizar Banco de Dados

Você pode conectar ao Postgres usando qualquer cliente SQL:

```bash
# Via CLI do Vercel
vercel env pull .env.local
psql $POSTGRES_URL_NON_POOLING
```

Queries úteis:

```sql
-- Ver sessões ativas
SELECT * FROM chat_sessions WHERE is_active = true;

-- Ver leads qualificados
SELECT * FROM leads WHERE is_qualified = true ORDER BY created_at DESC;

-- Estatísticas de mensagens
SELECT
  COUNT(*) as total_messages,
  COUNT(DISTINCT conversation_id) as total_conversations,
  AVG(tokens_used) as avg_tokens
FROM messages WHERE role = 'assistant';

-- Top leads por score
SELECT name, qualification_score, budget_range, timeline
FROM leads
ORDER BY qualification_score DESC
LIMIT 10;
```

## 🔒 Segurança

### Proteger API Keys

1. **Nunca commite .env no git**
   - O .gitignore já está configurado
   - Use .env.example como template

2. **Rotacionar Keys Regularmente**
   - OpenAI: https://platform.openai.com/api-keys
   - Evolution API: No painel de admin

3. **Webhook Security**
   - Sempre use WEBHOOK_SECRET
   - Valide assinaturas em produção

### Limites de Rate

Configure limites apropriados para evitar abuso:

```env
RATE_LIMIT_WINDOW_MS=60000      # 1 minuto
RATE_LIMIT_MAX_REQUESTS=20      # Max 20 requisições
```

## 🐛 Troubleshooting

### OpenAI: "Invalid API Key"

```bash
# Verifique se a key está correta
echo $OPENAI_API_KEY

# Teste a key manualmente
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Evolution API: "Instance not connected"

1. Verifique se o QR Code foi escaneado
2. Confirme que o WhatsApp está aberto no celular
3. Reinicie a instância no painel

### Postgres: "Connection refused"

1. Verifique se as variáveis POSTGRES_* estão corretas
2. Confirme que o database foi criado no Vercel
3. Teste a conexão:

```bash
npm run db:init
```

### KV: "Authentication failed"

1. Verifique se as variáveis KV_* estão corretas
2. Confirme que o KV store foi criado
3. Teste:

```bash
npm run test:integrations
```

### Webhook: "Invalid signature"

1. Confirme que WEBHOOK_SECRET está igual no Evolution API e no .env
2. Em desenvolvimento, pode desabilitar temporariamente

## 📞 Suporte

- **Issues**: https://github.com/vivaacademy/agent/issues
- **Documentação Evolution API**: https://doc.evolution-api.com/
- **Documentação OpenAI**: https://platform.openai.com/docs
- **Documentação Vercel**: https://vercel.com/docs

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] `npm run env:validate` passa sem erros
- [ ] `npm run test:integrations` passa sem erros
- [ ] Database inicializado com sucesso
- [ ] WhatsApp conectado via QR Code
- [ ] Webhook configurado e testado
- [ ] Rate limiting testado
- [ ] Logs monitorados no Vercel
- [ ] Backup strategy definida
- [ ] Custos de APIs monitorados

## 🚀 Deploy

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy para produção
vercel --prod

# Configure as env vars no dashboard do Vercel
# https://vercel.com/dashboard/[seu-projeto]/settings/environment-variables
```

Variáveis que devem ser configuradas no Vercel:
- Todas as variáveis do .env.example
- Especialmente: OPENAI_API_KEY, EVOLUTION_API_KEY, WEBHOOK_SECRET
- POSTGRES_* e KV_* são auto-configuradas quando você conecta os recursos

---

**Pronto!** Seu agente de IA está configurado e pronto para uso. 🎉
