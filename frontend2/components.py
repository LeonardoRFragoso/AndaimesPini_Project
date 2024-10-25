import streamlit as st
import requests
from datetime import datetime

# Função para exibir o cabeçalho da página
def page_header(title):
    """Exibe o título da página."""
    st.title(title)

# Função para exibir mensagens de sucesso
def show_success(message):
    """Exibe uma mensagem de sucesso."""
    st.success(message)

# Função para exibir mensagens de erro
def show_error(message):
    """Exibe uma mensagem de erro."""
    st.error(message)

# Função para registrar uma nova locação
def registrar_locacao(numero_nota, cliente_info, data_inicio, dias_combinados, data_fim, valor_total, valor_pago_entrega, valor_receber_final, itens):
    """
    Registra uma nova locação, enviando os dados para a API.

    Parâmetros:
        numero_nota (str): Número da nota de locação.
        cliente_info (dict): Informações do cliente.
        data_inicio (datetime): Data de início da locação.
        dias_combinados (int): Dias combinados de locação.
        data_fim (datetime): Data de término da locação.
        valor_total (float): Valor total da locação.
        valor_pago_entrega (float): Valor pago no ato da entrega.
        valor_receber_final (float): Valor a receber no final da locação.
        itens (list): Lista de itens locados.
    """
    nova_locacao = {
        "numero_nota": numero_nota,
        "cliente_info": cliente_info,
        "data_inicio": data_inicio.strftime('%Y-%m-%d'),
        "dias_combinados": dias_combinados,
        "data_fim": data_fim.strftime('%Y-%m-%d'),
        "valor_total": valor_total,
        "valor_pago_entrega": valor_pago_entrega,
        "valor_receber_final": valor_receber_final,
        "itens": itens
    }

    # Exibir os dados para debug antes de enviar para a API
    st.write("Dados para registro:", nova_locacao)

    try:
        # Enviar os dados da locação para a API
        response = requests.post("http://127.0.0.1:5000/locacoes", json=nova_locacao)
        if response.status_code == 201:
            show_success("Locação registrada com sucesso!")
        else:
            show_error(f"Erro ao registrar locação: {response.status_code}, {response.text}")
    except requests.exceptions.RequestException as e:
        show_error(f"Erro ao conectar com a API: {e}")

