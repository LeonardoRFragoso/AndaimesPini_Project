# 🚀 Guia de Deploy - AndaimesPini Project

## 📋 Visão Geral

Este guia explica como fazer deploy do projeto completo:
- **Frontend:** Vercel (React)
- **Backend:** Railway (Flask + PostgreSQL)

---

## 🎯 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [Railway](https://railway.app)
- Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 📦 PARTE 1: Deploy do Backend (Railway)

### Passo 1: Preparar o Repositório

```bash
cd backend
git init
git add .
git commit -m "Preparar backend para deploy"
```

### Passo 2: Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório do projeto
5. Selecione a pasta `backend`

### Passo 3: Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway criará automaticamente o banco

### Passo 4: Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-super-segura-aqui
PORT=${{PORT}}
```

**IMPORTANTE:** Railway fornece automaticamente as variáveis do PostgreSQL. Use as referências `${{Postgres.*}}`.

### Passo 5: Deploy Automático

1. Railway detectará `requirements.txt` e instalará dependências
2. Usará `Procfile` para iniciar a aplicação
3. O deploy acontecerá automaticamente

### Passo 6: Criar Tabelas e Admin

Após o deploy, execute via Railway CLI ou Shell:

```bash
# Criar tabelas
python database.py

# Criar usuário admin
python create_admin.py "Administrador" "admin@andaimespini.com" "senha_segura"
```

### Passo 7: Anotar URL do Backend

Copie a URL gerada pelo Railway (ex: `https://seu-backend.railway.app`)

---

## 🌐 PARTE 2: Deploy do Frontend (Vercel)

### Passo 1: Atualizar URL da API

Edite `frontend/.env.production`:

```env
REACT_APP_API_URL=https://seu-backend.railway.app
```

**Substitua** `seu-backend.railway.app` pela URL real do Railway.

### Passo 2: Preparar o Repositório

```bash
cd frontend
git init
git add .
git commit -m "Preparar frontend para deploy"
```

### Passo 3: Criar Projeto no Vercel

1. Acesse https://vercel.com
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório do projeto
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

### Passo 4: Configurar Variáveis de Ambiente

No Vercel, vá em **Settings** → **Environment Variables**:

```env
REACT_APP_API_URL=https://seu-backend.railway.app
```

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Vercel fará build e deploy automaticamente
3. Aguarde a conclusão (~2-3 minutos)

### Passo 6: Configurar Domínio (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

---

## 🔧 PARTE 3: Configuração CORS

Após deploy, atualize o CORS no backend para aceitar o domínio do Vercel:

Edite `backend/app.py`:

```python
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://seu-frontend.vercel.app"  # Adicione seu domínio Vercel
    ], 
    "supports_credentials": True, 
    "allow_headers": ["Content-Type", "Authorization"], 
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}}, expose_headers=["Content-Type", "Authorization"])
```

Faça commit e push. Railway fará redeploy automaticamente.

---

## ✅ PARTE 4: Verificação

### Testar Backend

```bash
curl https://seu-backend.railway.app/auth/verificar
```

Deve retornar JSON (mesmo que erro 401).

### Testar Frontend

1. Acesse `https://seu-frontend.vercel.app`
2. Faça login com usuário admin
3. Verifique se dados carregam corretamente

---

## 🔄 Atualizações Futuras

### Backend (Railway)

```bash
git add .
git commit -m "Atualização backend"
git push
```

Railway fará redeploy automaticamente.

### Frontend (Vercel)

```bash
git add .
git commit -m "Atualização frontend"
git push
```

Vercel fará redeploy automaticamente.

---

## 🐛 Troubleshooting

### Backend não inicia

**Problema:** Erro ao conectar PostgreSQL

**Solução:**
1. Verifique variáveis de ambiente no Railway
2. Certifique-se que usou `${{Postgres.*}}`
3. Verifique logs: Railway → Deployments → View Logs

### Frontend não conecta ao Backend

**Problema:** Erro CORS ou 404

**Solução:**
1. Verifique `REACT_APP_API_URL` no Vercel
2. Confirme que CORS inclui domínio Vercel
3. Verifique se backend está rodando

### Erro 500 no Backend

**Problema:** Tabelas não criadas

**Solução:**
```bash
# Via Railway CLI
railway run python database.py
```

---

## 📊 Monitoramento

### Railway (Backend)

- **Logs:** Railway → Deployments → View Logs
- **Métricas:** Railway → Metrics
- **Database:** Railway → PostgreSQL → Data

### Vercel (Frontend)

- **Logs:** Vercel → Deployments → Function Logs
- **Analytics:** Vercel → Analytics
- **Performance:** Vercel → Speed Insights

---

## 💰 Custos

### Railway

- **Hobby Plan:** $5/mês
- Inclui: 500h de execução, PostgreSQL

### Vercel

- **Hobby Plan:** Grátis
- Inclui: Builds ilimitados, 100GB bandwidth

---

## 🔐 Segurança

### Checklist de Produção

- [ ] Alterar `SECRET_KEY` para valor seguro
- [ ] Usar senhas fortes para admin
- [ ] Habilitar HTTPS (automático no Vercel/Railway)
- [ ] Configurar CORS apenas para domínios confiáveis
- [ ] Fazer backup regular do PostgreSQL
- [ ] Monitorar logs de erro
- [ ] Limitar tentativas de login (rate limiting)

---

## 📝 Comandos Úteis

### Railway CLI

```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Ver logs
railway logs

# Executar comando
railway run python database.py

# Shell interativo
railway shell
```

### Vercel CLI

```bash
# Instalar
npm install -g vercel

# Login
vercel login

# Deploy manual
vercel --prod

# Ver logs
vercel logs
```

---

## 🎉 Conclusão

Seu sistema está agora em produção!

- **Frontend:** https://seu-frontend.vercel.app
- **Backend:** https://seu-backend.railway.app

**Próximos passos:**
1. Configurar domínio personalizado
2. Configurar backup automático do banco
3. Implementar monitoramento de erros (Sentry)
4. Configurar CI/CD para testes automáticos

---

**Data:** 24/02/2026  
**Status:** ✅ Pronto para Deploy
