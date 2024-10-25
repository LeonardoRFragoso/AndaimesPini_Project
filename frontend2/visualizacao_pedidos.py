import streamlit as st
import requests
import pandas as pd

def main():
    st.title("Visualizar Pedidos")

    # Filtros para a busca
    with st.sidebar:
        st.header("Filtros")
        nome_cliente = st.text_input("Nome do Cliente")
        numero_nota = st.text_input("Número da Nota")
        data_inicio = st.date_input("Data Inicial")
        data_fim = st.date_input("Data Final")
        item_filtro = st.selectbox("Item do Pedido", ["", "Andaimes", "Escoras"])

    # Montagem dos filtros para enviar na requisição
    filtros = {
        "data_inicio": str(data_inicio),
        "data_fim": str(data_fim)
    }

    if nome_cliente:
        filtros["nome_cliente"] = nome_cliente
    if numero_nota:
        filtros["numero_nota"] = numero_nota
    if item_filtro:
        filtros["item"] = item_filtro

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

            if pedidos:
                # Definir os nomes das colunas (com base na estrutura dos dados)
                colunas = ["ID", "Cliente ID", "Data Início", "Data Fim", "Valor Total", "Valor Pago", "Valor a Receber"]

                # Transformar os dados em DataFrame
                df = pd.DataFrame(pedidos, columns=colunas)

                # Exibir a tabela completa
                st.dataframe(df)
            else:
                st.write("Nenhum pedido encontrado.")
        except ValueError:
            st.error("Erro ao tentar processar a resposta do servidor. Verifique o formato dos dados.")
    else:
        st.error(f"Erro na requisição: {response.status_code}. Por favor, verifique o backend.")
