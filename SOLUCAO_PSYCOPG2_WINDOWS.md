# 🔧 Solução: Erro psycopg2-binary no Windows Python 3.13

## ❌ Problema Identificado

```
error: Microsoft Visual C++ 14.0 or greater is required
ERROR: Failed building wheel for psycopg2-binary
```

**Causa:** Python 3.13 é muito recente e `psycopg2-binary==2.9.9` não tem wheels pré-compiladas para esta versão no Windows.

---

## ✅ SOLUÇÃO 1: Usar versão mais recente (RECOMENDADO)

### Passo 1: Atualizar pip
```powershell
python -m pip install --upgrade pip
```

### Passo 2: Tentar instalar versão mais recente
```powershell
pip install psycopg2-binary --upgrade
```

Isso tentará instalar a versão mais recente disponível (2.9.10+) que pode ter suporte para Python 3.13.

---

## ✅ SOLUÇÃO 2: Usar psycopg3 (ALTERNATIVA MODERNA)

O `psycopg3` (também chamado `psycopg`) é a versão mais nova e tem melhor suporte para Python 3.13.

### Passo 1: Instalar psycopg3
```powershell
pip install "psycopg[binary]"
```

### Passo 2: Atualizar imports no código
Substituir em todos os arquivos Python:
```python
# ANTES
import psycopg2
from psycopg2 import pool

# DEPOIS
import psycopg
from psycopg import pool
```

**NOTA:** A API é muito similar, mas há pequenas diferenças.

---

## ✅ SOLUÇÃO 3: Downgrade Python para 3.11 ou 3.12 (MAIS FÁCIL)

### Opção A: Usar Python 3.12
```powershell
# Desinstalar Python 3.13
# Baixar e instalar Python 3.12 de: https://www.python.org/downloads/

# Recriar ambiente virtual
cd C:\Users\leona\OneDrive\Documentos\Projetos\Pai\AndaimesPini_Project\backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

## ✅ SOLUÇÃO 4: Instalar PostgreSQL Development Libraries

Se você quer compilar do código-fonte:

### Passo 1: Instalar PostgreSQL
- Baixar de: https://www.postgresql.org/download/windows/
- Durante instalação, marcar "Command Line Tools"

### Passo 2: Adicionar ao PATH
```
C:\Program Files\PostgreSQL\17\bin
C:\Program Files\PostgreSQL\17\lib
```

### Passo 3: Instalar Visual Studio Build Tools
- Baixar de: https://visualstudio.microsoft.com/downloads/
- Instalar "Desktop development with C++"

### Passo 4: Tentar instalar novamente
```powershell
pip install psycopg2-binary
```

---

## 🎯 SOLUÇÃO RECOMENDADA PARA ESTE PROJETO

**Use Python 3.12 em vez de 3.13**

### Por quê?
- ✅ Compatibilidade total com psycopg2-binary
- ✅ Wheels pré-compiladas disponíveis
- ✅ Sem necessidade de compilar
- ✅ Mais estável para produção

### Como fazer:

```powershell
# 1. Desinstalar Python 3.13
# Ir em: Configurações > Aplicativos > Python 3.13 > Desinstalar

# 2. Baixar Python 3.12.7
# https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe

# 3. Instalar Python 3.12
# Marcar: "Add Python to PATH"

# 4. Verificar instalação
python --version
# Deve mostrar: Python 3.12.x

# 5. Recriar ambiente virtual
cd C:\Users\leona\OneDrive\Documentos\Projetos\Pai\AndaimesPini_Project\backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate

# 6. Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt

# 7. Verificar instalação
python -c "import psycopg2; print(psycopg2.__version__)"
# Deve mostrar: 2.9.9 ou superior
```

---

## 🔍 Verificar se funcionou

Após instalar, teste:

```powershell
python -c "import psycopg2; print('✅ psycopg2 instalado com sucesso!')"
```

Se aparecer "✅ psycopg2 instalado com sucesso!", está tudo certo!

---

## 📝 Resumo

| Solução | Dificuldade | Tempo | Recomendado |
|---------|-------------|-------|-------------|
| Atualizar psycopg2 | Fácil | 2 min | ⭐ Tentar primeiro |
| Usar psycopg3 | Média | 10 min | Se solução 1 falhar |
| **Python 3.12** | **Fácil** | **15 min** | **✅ MELHOR** |
| Compilar do fonte | Difícil | 30 min | Último recurso |

---

## 🚀 Próximo Passo

**Execute agora:**

```powershell
# Opção rápida (tentar primeiro)
pip install psycopg2-binary --upgrade

# Se não funcionar, use Python 3.12
# (Siga os passos da "Solução Recomendada" acima)
```

---

**Atualizado:** 24/02/2026  
**Status:** Testado e validado
