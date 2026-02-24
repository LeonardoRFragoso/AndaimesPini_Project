# 🚀 PRÓXIMOS PASSOS - Configuração PostgreSQL

## ✅ O QUE JÁ FOI FEITO

1. ✅ **psycopg2-binary instalado** (versão 2.9.11 - compatível com Python 3.13)
2. ✅ **Todas as dependências instaladas** na venv
3. ✅ **17 arquivos convertidos** de SQLite para PostgreSQL
4. ✅ **Arquivo .env criado** com configurações padrão
5. ✅ **Módulo de danos implementado** (frontend + backend)

---

## 📋 CONFIGURAR POSTGRESQL (NECESSÁRIO)

### Opção 1: PostgreSQL já instalado

Se você já tem PostgreSQL instalado, apenas configure a senha no arquivo `.env`:

```powershell
# Editar o arquivo .env
notepad .env
```

Altere a linha:
```
DB_PASSWORD=postgres
```

Para sua senha real do PostgreSQL.

---

### Opção 2: Instalar PostgreSQL agora

#### Passo 1: Baixar PostgreSQL
- Acesse: https://www.postgresql.org/download/windows/
- Baixe a versão 17 (ou 16, 15, 14)
- Execute o instalador

#### Passo 2: Durante a instalação
- **Porta:** 5432 (padrão)
- **Senha do postgres:** Anote a senha que você criar!
- **Locale:** Portuguese, Brazil

#### Passo 3: Criar o banco de dados

Abra o **SQL Shell (psql)** que foi instalado:

```sql
-- Conectar (pressione Enter para usar valores padrão)
-- Digite a senha quando solicitado

-- Criar banco de dados
CREATE DATABASE andaimes_pini;

-- Verificar
\l

-- Sair
\q
```

#### Passo 4: Atualizar .env com sua senha

```powershell
notepad .env
```

Altere:
```
DB_PASSWORD=SUA_SENHA_AQUI
```

---

## 🎯 EXECUTAR AGORA

### 1. Criar tabelas no PostgreSQL

```powershell
.\venv\Scripts\python.exe database.py
```

**Saída esperada:**
```
✓ Pool de conexões PostgreSQL criado com sucesso
✓ Tabelas PostgreSQL criadas ou atualizadas com sucesso!
```

### 2. (Opcional) Migrar dados do SQLite

Se você tem dados no SQLite que quer migrar:

```powershell
.\venv\Scripts\python.exe migrate_to_postgresql.py
```

### 3. Iniciar a aplicação

```powershell
.\venv\Scripts\python.exe app.py
```

**Saída esperada:**
```
✓ Pool de conexões PostgreSQL criado com sucesso
✓ Rotas registradas com sucesso
* Running on http://0.0.0.0:5000
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Teste 1: Verificar conexão PostgreSQL

```powershell
.\venv\Scripts\python.exe -c "import psycopg2; conn = psycopg2.connect(host='localhost', database='andaimes_pini', user='postgres', password='SUA_SENHA'); print('✅ Conexão OK!'); conn.close()"
```

### Teste 2: Verificar tabelas criadas

```powershell
# Abrir psql
psql -U postgres -d andaimes_pini

# Listar tabelas
\dt

# Deve mostrar:
# usuarios
# clientes
# inventario
# locacoes
# itens_locados
# registro_danos
# notificacoes
```

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "password authentication failed"
**Solução:** Verifique a senha no arquivo `.env`

### Erro: "database does not exist"
**Solução:** Execute `CREATE DATABASE andaimes_pini;` no psql

### Erro: "could not connect to server"
**Solução:** 
1. Verifique se PostgreSQL está rodando: `services.msc` → PostgreSQL
2. Reinicie o serviço se necessário

### Erro: "port 5432 is already in use"
**Solução:** Outro PostgreSQL está rodando, use a mesma instância

---

## 📊 RESUMO DO PROJETO

### Endpoints: 47 TOTAL
- Auth: 7 endpoints
- Locações: 8 endpoints
- Clientes: 6 endpoints
- Inventário: 7 endpoints
- Relatórios: 8 endpoints
- Itens Locados: 4 endpoints
- Notificações: 7 endpoints
- **Danos: 5 endpoints** ← NOVO!

### Banco de Dados: PostgreSQL
- 7 tabelas criadas
- Pool de conexões profissional
- Suporte a transações ACID

### Frontend
- Módulo de danos implementado
- Rota `/damages` adicionada
- Interface completa com Material-UI

---

## 🎉 APÓS CONFIGURAR

1. **Inicie o backend:**
   ```powershell
   .\venv\Scripts\python.exe app.py
   ```

2. **Inicie o frontend** (outro terminal):
   ```powershell
   cd ..\frontend
   npm start
   ```

3. **Acesse:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Danos: http://localhost:3000/damages

---

**Precisa de ajuda?** Consulte:
- `SETUP_POSTGRESQL.md` - Guia detalhado
- `MIGRATION_COMPLETE.md` - Checklist completo
- `README_FINAL.md` - Documentação geral
