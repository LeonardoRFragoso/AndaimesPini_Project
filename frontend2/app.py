import streamlit as st
import registro_pedidos
import visualizacao_pedidos
import inventario
import requests
import pandas as pd

# Definir a função de visualização de pedidos fora do bloco condicional
def visualizar_pedidos():
    st.title("Visualizar Pedidos")

    # Filtros para a busca
    with st.sidebar:
        st.header("Filtros")
        nome_cliente = st.text_input("Nome do Cliente")
        data_inicio = st.date_input("Data Inicial")
        data_fim = st.date_input("Data Final")

    # Montagem dos filtros para enviar na requisição
    filtros = {
        "data_inicio": str(data_inicio),
        "data_fim": str(data_fim)
    }

    if nome_cliente:
        filtros["nome_cliente"] = nome_cliente

    # Realizando a requisição para o backend
    try:
        response = requests.get("http://127.0.0.1:5000/locacoes", params=filtros)
    except requests.exceptions.RequestException as e:
        st.error(f"Erro ao tentar se conectar ao servidor: {e}")
        return  # Interrompe a execução em caso de erro na conexão

    # Verificar se a resposta foi bem-sucedida
    if response.status_code == 200:
        try:
            pedidos = response.json()

            # Verificar o conteúdo dos dados retornados
            st.write("Dados retornados:")
            st.json(pedidos)  # Exibir os dados brutos como JSON para inspeção

            if pedidos:
                # Transformar dados em DataFrame para exibição em tabela
                df = pd.DataFrame(pedidos)

                # Exibir as colunas disponíveis no DataFrame
                st.write("Colunas disponíveis no DataFrame:")
                st.write(df.columns.tolist())

                # Exibir as primeiras linhas para inspecionar os dados
                st.write("Visualização inicial dos dados:")
                st.dataframe(df)

                # Definir as colunas que queremos exibir
                colunas_exibidas = [
                    "Número", "Cliente", "Endereço", "Telefone", 
                    "Data Início", "Data Fim", "Valor Total", 
                    "Valor Pago", "Valor a Receber"
                ]

                # Verificar se todas as colunas estão presentes no DataFrame
                colunas_presentes = [col for col in colunas_exibidas if col in df.columns]

                if colunas_presentes:
                    st.dataframe(df[colunas_presentes])
                else:
                    st.write("Nenhuma coluna correspondente disponível para exibição.")

                # Exibir itens locados para cada pedido
                st.subheader("Itens Locados por Pedido")
                for idx, pedido in df.iterrows():
                    if 'Número' in pedido:  # Verifique se a chave 'Número' está presente
                        st.write(f"Pedido Número: {pedido['Número']}")
                    else:
                        st.write("Pedido sem número identificado.")

                    # Requisição para pegar itens locados pelo número do pedido
                    locacao_id = pedido.get('Número')
                    itens_response = requests.get(f"http://127.0.0.1:5000/locacoes/{locacao_id}/itens")

                    if itens_response.status_code == 200:
                        itens_locados = itens_response.json()
                        if itens_locados:
                            itens_df = pd.DataFrame(itens_locados)
                            if not itens_df.empty:
                                st.table(itens_df)
                            else:
                                st.write("Nenhum item locado encontrado para este pedido.")
                        else:
                            st.write("Nenhum item locado encontrado para este pedido.")
                    else:
                        st.write(f"Erro ao buscar itens para o pedido {locacao_id}: {itens_response.status_code}")

            else:
                st.write("Nenhum pedido encontrado.")
        except ValueError:
            st.error("Erro ao tentar processar a resposta do servidor. Verifique o formato dos dados.")
    else:
        st.error(f"Erro na requisição: {response.status_code}. Por favor, verifique o backend.")

# Definir as páginas do app
menu = ["Registrar Locação", "Visualizar Pedidos", "Gerenciar Inventário"]
escolha = st.sidebar.selectbox("Menu", menu)

if escolha == "Registrar Locação":
    registro_pedidos.main()

elif escolha == "Visualizar Pedidos":
    visualizar_pedidos()

elif escolha == "Gerenciar Inventário":
    inventario.main()
