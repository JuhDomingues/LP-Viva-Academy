# Scripts de Integração

Scripts para configurar e testar as integrações do agente de IA.

## 📝 Scripts Disponíveis

### `validate-env.ts`

Valida se todas as variáveis de ambiente necessárias estão configuradas.

```bash
npm run env:validate
```

**O que faz:**
- Verifica variáveis obrigatórias e opcionais
- Agrupa por categoria (OpenAI, Evolution API, Database, KV, App)
- Valida formatos (temperatura, número de telefone, etc.)
- Mostra exemplos para variáveis faltando

**Saída:**
```
✅ OPENAI_API_KEY               [SET]
❌ EVOLUTION_API_URL            [MISSING]
⚠️  OPENAI_TEMPERATURE          [OPTIONAL]
```

### `test-integrations.ts`

Testa todas as integrações com APIs externas.

```bash
npm run test:integrations
```

**O que testa:**
1. **OpenAI API** - Envia mensagem de teste
2. **Evolution API** - Verifica conexão WhatsApp
3. **Vercel Postgres** - Verifica conexão e tabelas
4. **Vercel KV** - Testa operações read/write
5. **Rate Limiter** - Verifica funcionamento

**Saída:**
```
✅ OpenAI API
   Connected successfully. Response: "OK"
   Duration: 1234ms

❌ Evolution API (WhatsApp)
   WhatsApp not connected. State: close
   Duration: 567ms
```

### `init-database.ts`

Inicializa o banco de dados com schema completo.

```bash
npm run db:init
```

**O que faz:**
1. Testa conexão com Postgres
2. Lê o arquivo `lib/db/schema.sql`
3. Executa todos os comandos SQL
4. Cria tabelas, índices e triggers
5. Verifica que tudo foi criado corretamente

**Reset do Database:**
```bash
npm run db:reset  # Remove todas as tabelas
npm run db:init   # Recria tudo do zero
```

⚠️ **ATENÇÃO**: `db:reset` deleta todos os dados!

## 🚀 Setup Completo

Execute todos os scripts em sequência:

```bash
npm run setup
```

Isso irá:
1. Validar variáveis de ambiente
2. Inicializar banco de dados
3. Testar todas as integrações

## 🔧 Desenvolvimento

### Rodando Scripts Localmente

Os scripts usam `tsx` para executar TypeScript diretamente.

```bash
# Com npm scripts (recomendado)
npm run env:validate

# Diretamente com tsx
npx tsx scripts/validate-env.ts
```

### Adicionando Novos Scripts

1. Crie o arquivo em `scripts/`
2. Adicione o script no `package.json`:

```json
{
  "scripts": {
    "seu-script": "tsx scripts/seu-script.ts"
  }
}
```

### Estrutura de um Script

```typescript
// scripts/exemplo.ts

// Imports necessários
import { sql } from '@vercel/postgres';

// Função principal
async function main() {
  console.log('Executando...');

  try {
    // Sua lógica aqui

    console.log('✅ Sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
main();
```

## 📋 Checklist de Setup

Ordem recomendada para configurar o projeto:

1. [ ] Copiar `.env.example` para `.env`
2. [ ] Preencher variáveis do OpenAI
3. [ ] Preencher variáveis do Evolution API
4. [ ] Criar Vercel Postgres e preencher variáveis
5. [ ] Criar Vercel KV e preencher variáveis
6. [ ] Executar `npm run env:validate`
7. [ ] Executar `npm run db:init`
8. [ ] Executar `npm run test:integrations`
9. [ ] Testar agente localmente com `npm run dev`

## 🐛 Troubleshooting

### "Cannot find module 'tsx'"

```bash
npm install
```

### "Database connection failed"

Verifique se as variáveis `POSTGRES_*` estão corretas no `.env`:

```bash
npm run env:validate
```

### "OpenAI API Key invalid"

1. Verifique se copiou a key completa
2. Confirme que tem créditos na conta OpenAI
3. Teste manualmente:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Scripts não encontram .env

Certifique-se que:
1. O arquivo `.env` está na raiz do projeto
2. Não tem espaços no nome do arquivo
3. As variáveis estão no formato correto: `KEY=value`

## 📚 Documentação Adicional

- [SETUP.md](../SETUP.md) - Guia completo de configuração
- [.env.example](../.env.example) - Template de variáveis
- [schema.sql](../lib/db/schema.sql) - Schema do banco de dados

## 🤝 Contribuindo

Ao adicionar novos scripts:

1. Documente o propósito e uso
2. Inclua tratamento de erros
3. Forneça mensagens claras
4. Adicione ao package.json
5. Atualize este README
