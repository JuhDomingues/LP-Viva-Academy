# Como Verificar Logs de Erro na Vercel

## Opção 1: Via Dashboard (Mais Fácil)

1. **Acesse**: https://vercel.com/dashboard
2. Clique no projeto **viva-academy**
3. Vá na aba **Logs** (no menu superior)
4. Filtre por:
   - Function: `/api/chat`
   - Status: `Error` (500, 400, etc)
5. Clique no erro mais recente para ver detalhes

## Opção 2: Via CLI

```bash
# Instalar CLI (se ainda não tem)
npm i -g vercel

# Login
vercel login

# Ver logs em tempo real
vercel logs --follow

# Ou filtrar por função específica
vercel logs api/chat
```

## 🔍 O que procurar nos logs

### Erro comum 1: Database não configurado
```
Error: connect ECONNREFUSED
Cannot find module '@vercel/postgres'
Database connection failed
```

**Solução**: Criar Postgres na Vercel

### Erro comum 2: KV não configurado
```
Error: KV_URL is not defined
Cannot connect to Redis
Rate limiter error
```

**Solução**: Criar KV store na Vercel

### Erro comum 3: OpenAI error
```
Error: Incorrect API key provided
OpenAI API error: 401
Insufficient quota
```

**Solução**: Verificar OPENAI_API_KEY

### Erro comum 4: Timeout
```
Error: Function execution timed out
FUNCTION_INVOCATION_TIMEOUT
```

**Solução**: Já configurado (maxDuration: 60s)

## 🚨 Erros Mais Prováveis

1. **Postgres não criado** (80% dos casos)
2. **KV não criado** (15% dos casos)
3. **OpenAI key inválida** (5% dos casos)
