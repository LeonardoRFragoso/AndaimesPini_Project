# ✅ Checklist de Deploy - AndaimesPini Project

## 📋 Antes do Deploy

### Backend
- [ ] Testar localmente com PostgreSQL
- [ ] Verificar que todas as dependências estão em `requirements.txt`
- [ ] Gerar SECRET_KEY segura
- [ ] Revisar configurações de CORS
- [ ] Testar todos os endpoints

### Frontend
- [ ] Testar build local: `npm run build`
- [ ] Verificar que não há erros no console
- [ ] Testar todas as rotas
- [ ] Verificar responsividade mobile

---

## 🚀 Deploy Backend (Railway)

- [ ] Criar conta no Railway
- [ ] Criar novo projeto
- [ ] Conectar repositório GitHub
- [ ] Adicionar PostgreSQL ao projeto
- [ ] Configurar variáveis de ambiente:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] FLASK_ENV=production
  - [ ] SECRET_KEY
  - [ ] PORT
- [ ] Aguardar deploy completar
- [ ] Copiar URL do backend
- [ ] Executar `python database.py` via Railway CLI
- [ ] Criar usuário admin via Railway CLI
- [ ] Testar endpoint: `curl https://seu-backend.railway.app/auth/verificar`

---

## 🌐 Deploy Frontend (Vercel)

- [ ] Criar conta no Vercel
- [ ] Atualizar `.env.production` com URL do Railway
- [ ] Criar novo projeto no Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar:
  - [ ] Framework: Create React App
  - [ ] Root Directory: frontend
  - [ ] Build Command: npm run build
  - [ ] Output Directory: build
- [ ] Adicionar variável de ambiente:
  - [ ] REACT_APP_API_URL
- [ ] Fazer deploy
- [ ] Copiar URL do Vercel
- [ ] Testar acesso ao frontend

---

## 🔧 Pós-Deploy

- [ ] Atualizar CORS no backend com URL do Vercel
- [ ] Fazer redeploy do backend
- [ ] Testar login no frontend
- [ ] Testar criação de cliente
- [ ] Testar criação de item no inventário
- [ ] Testar criação de locação
- [ ] Verificar notificações
- [ ] Testar módulo de danos
- [ ] Verificar relatórios

---

## 🔐 Segurança

- [ ] Alterar senha padrão do admin
- [ ] Verificar que SECRET_KEY é forte
- [ ] Confirmar HTTPS ativo (automático)
- [ ] Revisar permissões CORS
- [ ] Configurar backup do PostgreSQL
- [ ] Documentar credenciais em local seguro

---

## 📊 Monitoramento

- [ ] Configurar alertas no Railway
- [ ] Verificar logs de erro
- [ ] Monitorar uso de recursos
- [ ] Configurar Analytics no Vercel (opcional)
- [ ] Testar performance

---

## 📝 Documentação

- [ ] Documentar URLs de produção
- [ ] Atualizar README com instruções
- [ ] Documentar processo de deploy
- [ ] Criar guia de troubleshooting
- [ ] Documentar variáveis de ambiente

---

## 🎯 Validação Final

- [ ] Frontend carrega sem erros
- [ ] Login funciona
- [ ] Todas as páginas acessíveis
- [ ] CRUD de clientes funciona
- [ ] CRUD de inventário funciona
- [ ] Criação de locações funciona
- [ ] Relatórios carregam
- [ ] Notificações aparecem
- [ ] Módulo de danos funciona
- [ ] Responsivo em mobile
- [ ] Performance aceitável

---

## ✅ Deploy Completo!

Data: ___/___/______

URLs:
- Frontend: https://_________________.vercel.app
- Backend: https://_________________.railway.app

Credenciais Admin:
- Email: _________________________
- Senha: (armazenada com segurança)

---

**Próximos Passos:**
1. Configurar domínio personalizado
2. Implementar CI/CD
3. Configurar monitoramento avançado
4. Planejar backups regulares
