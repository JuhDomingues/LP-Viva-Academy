# Configuração do Webhook Evolution API

Este documento descreve como configurar o webhook da Evolution API para receber mensagens do WhatsApp.

## URL do Webhook

A URL do webhook para configurar na Evolution API é:

```
https://www.vivaacademy.app/api/webhook
```

**IMPORTANTE**: Se você estiver usando um domínio diferente, substitua `www.vivaacademy.app` pelo seu domínio.

## Configuração na Evolution API

### Método 1: Via Interface Web

1. Acesse o painel da Evolution API: `https://chat.layermarketing.com.br`
2. Navegue até a instância `Viva_academy`
3. Vá em "Webhook" ou "Configurações de Webhook"
4. Configure os seguintes campos:
   - **URL**: `https://www.vivaacademy.app/api/webhook`
   - **Eventos**: Marque `MESSAGES_UPSERT`
   - **Método**: POST
   - **Header** (opcional): `x-webhook-signature` com o valor do `WEBHOOK_SECRET`

### Método 2: Via API (cURL)

Execute o seguinte comando para configurar o webhook via API:

```bash
curl -X POST 'https://chat.layermarketing.com.br/webhook/set/Viva_academy' \
  -H 'Content-Type: application/json' \
  -H 'apikey: CE10D95C5E99-4653-9DDC-A3D1ACE1B6B0' \
  -d '{
    "enabled": true,
    "url": "https://www.vivaacademy.app/api/webhook",
    "webhookByEvents": true,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "CONNECTION_UPDATE"
    ]
  }'
```

### Método 3: Via código (JavaScript/TypeScript)

Use o serviço `evolution-api.ts` que já está implementado:

```typescript
import { getEvolutionAPI } from './src/lib/evolution-api';

const evolutionAPI = getEvolutionAPI();
await evolutionAPI.setWebhook('https://www.vivaacademy.app/api/webhook');
```

## Como Funciona

### Fluxo de Mensagens

1. **Usuário envia mensagem** no WhatsApp
2. **Evolution API recebe** a mensagem
3. **Webhook é chamado** com os dados da mensagem
4. **Backend processa** com validações:
   - Valida assinatura do webhook (segurança)
   - Verifica rate limiting
   - Extrai texto da mensagem
5. **Agente de IA processa** a mensagem
6. **Resposta é enviada** de volta para o WhatsApp do usuário

### Eventos Suportados

- `MESSAGES_UPSERT`: Novas mensagens recebidas ✅ (principal)
- `MESSAGES_UPDATE`: Atualizações em mensagens
- `CONNECTION_UPDATE`: Status da conexão WhatsApp

### Segurança

O webhook implementa validação de assinatura usando `WEBHOOK_SECRET`:

```
x-webhook-signature: HMAC-SHA256(payload, WEBHOOK_SECRET)
```

**Webhook Secret configurado**: `viva_webhook_secret_2024`

Em desenvolvimento, a validação é opcional. Em produção, é obrigatória.

## Estrutura do Payload

Exemplo de payload recebido do WhatsApp:

```json
{
  "event": "messages.upsert",
  "instance": "Viva_academy",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "ABCD1234"
    },
    "message": {
      "conversation": "Olá, tenho dúvidas sobre imigração"
    },
    "messageTimestamp": 1234567890,
    "pushName": "João Silva"
  }
}
```

## Testando o Webhook

### 1. Teste Local (Desenvolvimento)

Para testar localmente, use ngrok ou similar para expor localhost:

```bash
# Terminal 1: Rode o servidor local
npm run dev

# Terminal 2: Exponha com ngrok
ngrok http 3000

# Use a URL do ngrok como webhook
https://abc123.ngrok.io/api/webhook
```

### 2. Teste de Produção

1. Configure o webhook com a URL de produção
2. Envie uma mensagem de teste no WhatsApp para o número conectado
3. Verifique os logs no Vercel Dashboard

### 3. Verificar Status da Conexão

```bash
curl -X GET 'https://chat.layermarketing.com.br/instance/connectionState/Viva_academy' \
  -H 'apikey: CE10D95C5E99-4653-9DDC-A3D1ACE1B6B0'
```

Resposta esperada:
```json
{
  "state": "open"
}
```

## Logs e Debugging

### Ver logs no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `viva-academy`
3. Vá em "Logs" ou "Functions"
4. Filtre por `/api/webhook`

### Logs importantes

```typescript
// Webhook processing error
console.error('Webhook processing error:', error);

// Message sent successfully
console.log('WhatsApp response sent to:', phoneNumber);

// Human handoff requested
console.log('Human handoff requested for:', phoneNumber);
```

## Troubleshooting

### Webhook não recebe mensagens

1. Verifique se o webhook está configurado corretamente na Evolution API
2. Teste se a URL está acessível: `curl https://www.vivaacademy.app/api/webhook`
3. Verifique logs no Vercel
4. Confirme que a instância está conectada (QR Code escaneado)

### Erro 401 (Unauthorized)

- Verifique se o `WEBHOOK_SECRET` no `.env` está correto
- Em desenvolvimento, a validação é opcional

### Erro 429 (Rate Limit)

- Usuário enviou muitas mensagens muito rápido
- Aguarde alguns minutos antes de tentar novamente

### Mensagens não são respondidas

- Verifique se `OPENAI_API_KEY` está configurado
- Verifique logs de erro no Vercel
- Teste a API do OpenAI separadamente

## Variáveis de Ambiente Necessárias

Certifique-se que as seguintes variáveis estão configuradas:

```env
# Evolution API
EVOLUTION_API_URL=https://chat.layermarketing.com.br
EVOLUTION_API_KEY=CE10D95C5E99-4653-9DDC-A3D1ACE1B6B0
EVOLUTION_INSTANCE_NAME=Viva_academy
WEBHOOK_SECRET=viva_webhook_secret_2024

# OpenAI (para o agente de IA)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Database (para histórico de conversas)
POSTGRES_URL=postgres://...
```

## Próximos Passos

Após configurar o webhook:

1. ✅ Webhook recebe mensagens do WhatsApp
2. ✅ Agente de IA processa e responde automaticamente
3. ✅ Histórico de conversas é salvo no banco de dados
4. ✅ Rate limiting protege contra spam
5. 🔲 Configurar notificações para handoff humano (Slack, email)
6. 🔲 Dashboard para visualizar conversas do WhatsApp
7. 🔲 Métricas e analytics de conversas

## Suporte

Para problemas ou dúvidas:
- Verifique logs no Vercel Dashboard
- Revise a documentação da Evolution API
- Teste endpoints individuais com cURL
