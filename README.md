
# Sistema de Gestão de Locações

Este é um projeto de Sistema de Gestão de Locações desenvolvido com **React.js** e utilizando **Material-UI** para a interface de usuário. O sistema permite que os usuários registrem locações e visualizem pedidos, oferecendo uma interface responsiva e moderna.

## Tecnologias Utilizadas

- **React.js** - Biblioteca JavaScript para construção de interfaces de usuário.
- **Material-UI** - Biblioteca de componentes React prontos para usar, com design seguindo as diretrizes do Material Design.
- **React Router** - Utilizado para o roteamento entre as diferentes páginas do sistema.
- **CSS Modules** - Para estilização dos componentes de maneira modular e organizada.

## Funcionalidades

- **Sidebar Expansível/Recolhível**: A barra lateral pode ser expandida ou recolhida para mostrar/ocultar os textos descritivos dos itens.
- **Navbar Fixa**: A barra de navegação superior permanece fixa no topo da página, ajustando-se dinamicamente ao estado da sidebar.
- **Páginas Dinâmicas**: O sistema permite o registro de novas locações e visualização de pedidos já realizados.
- **Responsividade Completa**: O layout se adapta perfeitamente a dispositivos móveis, tablets e desktops.

## Como Executar o Projeto

### Pré-requisitos

- **Node.js** (versão recomendada: >= 14.x)
- **npm** (ou **yarn**) instalado em sua máquina.

### Passos para executar:

1. Clone o repositório:

   ```bash
   git clone https://github.com/LeonardoRFragoso/AndaimesPini_Project
   cd sistema-gestao-locacoes
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

4. Acesse o projeto em seu navegador:

   ```bash
   http://localhost:3000
   ```

## Estrutura do Projeto

```bash
├── public/                # Arquivos estáticos e HTML
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   │   ├── Navbar.js      # Componente da barra de navegação superior
│   │   ├── Sidebar.js     # Componente da barra lateral expansível
│   ├── pages/             # Páginas principais do sistema
│   │   ├── HomePage.js    # Página inicial
│   └── styles/            # Arquivos CSS do projeto
│       ├── navbar.css     # Estilização da barra de navegação
│       ├── sidebar.css    # Estilização da barra lateral
│       ├── HomePage.css   # Estilização da página inicial
├── package.json           # Informações do projeto e dependências
└── README.md              # Este arquivo
```

### Principais Componentes

- **Navbar**: Componente da barra de navegação superior. Ajusta-se dinamicamente à largura da sidebar e fornece links para navegação entre as páginas do sistema.
  
- **Sidebar**: Componente da barra lateral que pode ser recolhida ou expandida. Contém links de navegação para as páginas de Registro de Locações e Visualização de Pedidos.

- **HomePage**: Página inicial com botões de ação para registrar locações e visualizar pedidos.

### Principais Arquivos CSS

- **navbar.css**: Estilos relacionados à barra de navegação. Inclui a transição suave quando a sidebar é recolhida ou expandida.
  
- **sidebar.css**: Estilos da barra lateral. Controla as transições entre os estados "recolhido" e "expandido".

- **HomePage.css**: Estilos da página inicial, incluindo botões, cards e layout responsivo.

## Melhoria Contínua

O projeto está em constante evolução e novas funcionalidades estão sendo adicionadas para melhorar a experiência do usuário e a funcionalidade do sistema.

## Melhorias Sugeridas

- Implementar autenticação de usuários.
- Melhorar a usabilidade com formulários dinâmicos.
- Adicionar testes unitários com **Jest** ou **React Testing Library**.
  
## Contribuição

Contribuições são bem-vindas! Se você encontrar algum problema ou tiver sugestões de melhoria, sinta-se à vontade para abrir uma issue ou enviar um pull request.

1. Faça um fork do projeto.
2. Crie uma nova branch para sua feature ou correção de bug (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Envie para o repositório (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

**Desenvolvido por Leonardo Fragoso**.

# LeonardoRFragoso-AndaimesPini_Project
