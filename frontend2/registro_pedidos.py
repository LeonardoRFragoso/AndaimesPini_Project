import streamlit as st
import requests
from datetime import datetime
from components import page_header, show_success, show_error  # Importar funções reutilizáveis do components.py

# Função principal para o registro de locações
def main():
    # Título da página
    page_header("Registrar nova locação")

    # Função para registrar uma nova locação
    def registrar_locacao(numero_nota, cliente_info, data_inicio, dias_combinados, data_fim, valor_total, valor_pago_entrega, valor_receber_final, itens):
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
            response = requests.post("http://127.0.0.1:5000/locacoes", json=nova_locacao)
            if response.status_code == 201:
                show_success("Locação registrada com sucesso!")
            else:
                show_error(f"Erro ao registrar locação: {response.status_code}, {response.text}")
        except requests.exceptions.RequestException as e:
            show_error(f"Erro ao conectar com a API: {e}")

    # Interface de Registro de Locação
    st.header("Número da Nota")
    numero_nota = st.text_input("Número da Nota")

    if not numero_nota:
        st.warning("Por favor, insira o número da nota antes de continuar.")

    st.header("Dados do Responsável pela Locação")

    # Coletar informações do cliente/responsável pela locação
    cliente_info = {
        "nome": st.text_input("Nome"),
        "endereco": st.text_input("Endereço"),
        "referencia": st.text_input("Referência"),
        "referencia_rapida": st.text_input("Referência Rápida"),
        "telefone": st.text_input("Telefone")
    }

    st.header("Detalhes da Locação")

    data_inicio = st.date_input("Data de Início da Locação", datetime.now())

    # Novo campo: Quantidade de dias combinados
    dias_combinados = st.number_input("Quantidade de dias combinados", min_value=1, step=1)

    data_fim = st.date_input("Data de Fim ou Prorrogação da Locação")

    # Valores da Locação
    valor_total = st.number_input("Valor Total da Locação", min_value=0.0)
    valor_pago_entrega = st.number_input("Valor Pago no Ato da Entrega", min_value=0.0)
    valor_receber_final = st.number_input("Valor a Receber no Final da Locação", min_value=0.0)

    itens_selecionados = []

    # Exibir os itens do inventário diretamente no frontend
    st.subheader("Selecione os itens do inventário")

    # Categoria de Andaimes
    with st.expander("Andaimes"):
        modelos_andaimes = ["1,0m", "1,5m"]
        modelo_selecionado_andaime = st.selectbox("Selecione o modelo de Andaime", modelos_andaimes)

        escolha_calculo = st.radio("Calcular por", ["Peças", "Metros"], key="calculo_andaime")

        if escolha_calculo == "Peças":
            quantidade_andaime = st.number_input(
                f"Quantidade de {modelo_selecionado_andaime} (peças)",
                min_value=0, step=1, key="quantidade_andaime_pecas"
            )
        else:
            quantidade_andaime = st.number_input(
                f"Quantidade de {modelo_selecionado_andaime} (metros)",
                min_value=0.0, step=0.1, key="quantidade_andaime_metros"
            )

        if quantidade_andaime > 0:
            unidade = "peças" if escolha_calculo == "Peças" else "metros"
            itens_selecionados.append({"modelo": modelo_selecionado_andaime, "quantidade": quantidade_andaime, "unidade": unidade})

    # Categoria de Diagonais
    with st.expander("Diagonais"):
        modelos_diagonais = ["1,0m", "1,5m"]
        modelo_selecionado_diagonal = st.selectbox("Selecione o modelo de Diagonal", modelos_diagonais)

        quantidade_diagonal = st.number_input(
            f"Quantidade de {modelo_selecionado_diagonal} (peças)",
            min_value=0, step=1, key="quantidade_diagonal"
        )

        if quantidade_diagonal > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_diagonal, "quantidade": quantidade_diagonal, "unidade": "peças"})

    # Categoria de Pranchões
    with st.expander("Pranchões"):
        modelos_pranchoes = ["Madeira 1,2m", "Madeira 1,7m", "Ferro 1,5m"]
        modelo_selecionado_pranchao = st.selectbox("Selecione o modelo de Pranchão", modelos_pranchoes)

        quantidade_pranchao = st.number_input(
            f"Quantidade de {modelo_selecionado_pranchao} (peças)",
            min_value=0, step=1, key="quantidade_pranchao"
        )

        if quantidade_pranchao > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_pranchao, "quantidade": quantidade_pranchao, "unidade": "peças"})

    # Equipamentos adicionais - Ajustando a categoria Escoras
    with st.expander("Escoras"):
        modelos_escoras = ["2,8m", "3,0m", "3,2m", "3,5m", "3,8m", "4,0m"]
        modelo_selecionado_escora = st.selectbox("Selecione o modelo de Escora", modelos_escoras)

        quantidade_escora = st.number_input(
            f"Quantidade de {modelo_selecionado_escora} (peças)",
            min_value=0, step=1, key="quantidade_escora"
        )

        if quantidade_escora > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_escora, "quantidade": quantidade_escora, "unidade": "peças"})

    # Categoria de Forcados
    with st.expander("Forcados"):
        modelos_forcados = ["Forcado pequeno", "Forcado médio", "Forcado grande"]
        modelo_selecionado_forcado = st.selectbox("Selecione o modelo de Forcado", modelos_forcados)

        quantidade_forcado = st.number_input(
            f"Quantidade de {modelo_selecionado_forcado} (peças)",
            min_value=0, step=1, key="quantidade_forcado"
        )

        if quantidade_forcado > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_forcado, "quantidade": quantidade_forcado, "unidade": "peças"})

    # Categoria de Sapatas
    with st.expander("Sapatas"):
        modelos_sapatas = ["Sapata regulável", "Sapata fixa"]
        modelo_selecionado_sapata = st.selectbox("Selecione o modelo de Sapata", modelos_sapatas)

        quantidade_sapata = st.number_input(
            f"Quantidade de {modelo_selecionado_sapata} (peças)",
            min_value=0, step=1, key="quantidade_sapata"
        )

        if quantidade_sapata > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_sapata, "quantidade": quantidade_sapata, "unidade": "peças"})

    # Categoria de Rodízios
    with st.expander("Rodízios"):
        modelos_rodizio = ["Rodízio simples", "Rodízio com trava"]
        modelo_selecionado_rodizio = st.selectbox("Selecione o modelo de Rodízio", modelos_rodizio)

        quantidade_rodizio = st.number_input(
            f"Quantidade de {modelo_selecionado_rodizio} (peças)",
            min_value=0, step=1, key="quantidade_rodizio"
        )

        if quantidade_rodizio > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_rodizio, "quantidade": quantidade_rodizio, "unidade": "peças"})

    # Categoria de Madeira de sustentação
    with st.expander("Madeira de sustentação"):
        modelos_madeira = ["Madeira Média", "Madeira Grande"]
        modelo_selecionado_madeira = st.selectbox("Selecione o modelo de Madeira de sustentação", modelos_madeira)

        quantidade_madeira = st.number_input(
            f"Quantidade de {modelo_selecionado_madeira} (peças)",
            min_value=0, step=1, key="quantidade_madeira"
        )

        if quantidade_madeira > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_madeira, "quantidade": quantidade_madeira, "unidade": "peças"})

    # Categoria de Ferro de sustentação
    with st.expander("Ferro de sustentação"):
        modelos_ferro = ["Ferro 2,0m", "Ferro 3,0m"]
        modelo_selecionado_ferro = st.selectbox("Selecione o modelo de Ferro de sustentação", modelos_ferro)

        quantidade_ferro = st.number_input(
            f"Quantidade de {modelo_selecionado_ferro} (peças)",
            min_value=0, step=1, key="quantidade_ferro"
        )

        if quantidade_ferro > 0:
            itens_selecionados.append({"modelo": modelo_selecionado_ferro, "quantidade": quantidade_ferro, "unidade": "peças"})

    # Registrar locação ao pressionar o botão
    if st.button("Registrar Locação"):
        if all(cliente_info.values()) and data_inicio and data_fim and valor_total and itens_selecionados and numero_nota and dias_combinados:
            registrar_locacao(numero_nota, cliente_info, data_inicio, dias_combinados, data_fim, valor_total, valor_pago_entrega, valor_receber_final, itens_selecionados)
        else:
            show_error("Preencha todos os campos para registrar a locação.")
