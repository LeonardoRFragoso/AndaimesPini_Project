import streamlit as st
import requests

# Função principal para o gerenciamento do inventário
def main():
    st.title("Gerenciar Inventário")

    # Escolher entre Adicionar, Remover ou Atualizar um item
    opcao = st.selectbox("Escolha a ação", ["Adicionar Item", "Atualizar Item", "Remover Item"])

    if opcao == "Adicionar Item":
        nome_item = st.text_input("Nome do Item")
        quantidade = st.number_input("Quantidade", min_value=0, step=1)
        tipo_item = st.text_input("Tipo de Item")

        if st.button("Adicionar"):
            if nome_item and quantidade and tipo_item:
                item = {"nome_item": nome_item, "quantidade": quantidade, "tipo_item": tipo_item}
                response = requests.post("http://127.0.0.1:5000/inventario", json=item)
                if response.status_code == 201:
                    st.success("Item adicionado com sucesso!")
                else:
                    st.error(f"Erro ao adicionar item: {response.status_code}")
            else:
                st.warning("Preencha todos os campos antes de adicionar o item.")

    elif opcao == "Atualizar Item":
        nome_item = st.text_input("Nome do Item a ser atualizado")
        nova_quantidade = st.number_input("Nova Quantidade", min_value=0, step=1)

        if st.button("Atualizar"):
            if nome_item and nova_quantidade >= 0:
                atualizacao = {"nome_item": nome_item, "nova_quantidade": nova_quantidade}
                response = requests.put("http://127.0.0.1:5000/inventario", json=atualizacao)
                if response.status_code == 200:
                    st.success("Item atualizado com sucesso!")
                else:
                    st.error(f"Erro ao atualizar item: {response.status_code}")
            else:
                st.warning("Preencha todos os campos para atualizar o item.")

    elif opcao == "Remover Item":
        nome_item = st.text_input("Nome do Item a ser removido")

        if st.button("Remover"):
            if nome_item:
                response = requests.delete(f"http://127.0.0.1:5000/inventario/{nome_item}")
                if response.status_code == 200:
                    st.success("Item removido com sucesso!")
                else:
                    st.error(f"Erro ao remover item: {response.status_code}")
            else:
                st.warning("Informe o nome do item para remover.")
