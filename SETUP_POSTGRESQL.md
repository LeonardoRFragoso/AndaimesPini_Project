# 🚀 Guia de Migração para PostgreSQL - AndaimesPini Project

## 📋 Pré-requisitos

1. **PostgreSQL instalado** (versão 12 ou superior)
2. **Python 3.8+** com pip
3. **Acesso ao banco SQLite atual** (para migração de dados)

---

## 🔧 PASSO 1: Instalar PostgreSQL

### Windows
```bash
# Baixar e instalar do site oficial
https://www.postgresql.org/download/windows/

# Durante instalação, anote:
# - Senha do usuário postgres
# - Porta (padrão: 5432)
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

---

## 🔧 PASSO 2: Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE andaimes_pini;

# Criar usuário (opcional, mas recomendado)
CREATE USER andaimes_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE andaimes_pini TO andaimes_user;

# Sair
\q
```

---

## 🔧 PASSO 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=andaimes_pini
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações da Aplicação
FLASK_ENV=development
SECRET_KEY=sua_chave_secreta_aqui_gere_uma_aleatoria
PORT=5000
```

**IMPORTANTE**: Substitua `sua_senha_aqui` pela senha real do PostgreSQL!

---

## 🔧 PASSO 4: Instalar Dependências Python

```bash
cd backend
pip install -r requirements.txt
```

Isso instalará:
- Flask 2.3.0
- Flask-CORS 4.0.0
- psycopg2-binary 2.9.9
- python-dotenv 1.0.0

---

## 🔧 PASSO 5: Criar Tabelas no PostgreSQL

```bash
cd backend
python database.py
```

Você deve ver:
```
✓ Pool de conexões PostgreSQL criado com sucesso
✓ Tabelas PostgreSQL criadas ou atualizadas com sucesso!
```

---

## 🔧 PASSO 6: Migrar Dados do SQLite (OPCIONAL)

**Se você tem dados no SQLite que deseja migrar:**

```bash
cd backend
python migrate_to_postgresql.py
```

Siga as instruções na tela. O script irá:
1. Conectar ao SQLite e PostgreSQL
2. Copiar todos os dados tabela por tabela
3. Atualizar as sequences do PostgreSQL
4. Reportar o progresso

---

## 🔧 PASSO 7: Iniciar a Aplicação

```bash
cd backend
python app.py
```

A aplicação deve iniciar em: `http://localhost:5000`

---

## ✅ Verificação

Para verificar se tudo está funcionando:

1. **Teste a conexão ao banco:**
```bash
psql -U postgres -d andaimes_pini -c "SELECT COUNT(*) FROM usuarios;"
```

2. **Teste um endpoint:**
```bash
curl http://localhost:5000/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","senha":"senha123"}'
```

3. **Verifique os logs do backend** - não deve haver erros de conexão

---

## 🔍 Troubleshooting

### Erro: "could not connect to server"
- Verifique se o PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verifique as credenciais no arquivo `.env`
- Verifique se a porta 5432 está aberta

### Erro: "password authentication failed"
- Verifique a senha no arquivo `.env`
- Tente resetar a senha do usuário postgres

### Erro: "database does not exist"
- Execute novamente o comando CREATE DATABASE no psql

### Erro: "relation does not exist"
- Execute `python database.py` para criar as tabelas

---

## 📊 Diferenças SQLite vs PostgreSQL

| Aspecto | SQLite | PostgreSQL |
|---------|--------|------------|
| **Tipo** | Arquivo local | Servidor de banco |
| **Concorrência** | Limitada | Excelente |
| **Performance** | Boa para pequeno volume | Excelente para grande volume |
| **Tipos de dados** | Limitados | Ricos (JSON, Arrays, etc) |
| **AUTOINCREMENT** | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| **Placeholders** | `?` | `%s` |
| **Conexões** | Uma por vez | Pool de conexões |

---

## 🎯 Próximos Passos

Após migração bem-sucedida:

1. ✅ Testar todos os endpoints
2. ✅ Verificar integridade dos dados
3. ✅ Configurar backup automático do PostgreSQL
4. ✅ Otimizar queries com índices
5. ✅ Configurar monitoramento

---

## 🔒 Segurança

**IMPORTANTE - Antes de ir para produção:**

1. **Nunca commite o arquivo `.env`** (já está no .gitignore)
2. **Use senhas fortes** para o banco de dados
3. **Configure SSL/TLS** para conexões PostgreSQL
4. **Limite acesso ao banco** via firewall
5. **Configure backups automáticos**

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs em `backend/logs/`
2. Consulte a documentação do PostgreSQL
3. Revise as configurações do `.env`

---

**Migração criada em:** 24/02/2026
**Versão PostgreSQL recomendada:** 14+
**Status:** ✅ Pronto para uso
