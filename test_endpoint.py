import requests
import json

def test_reports_endpoint():
    """Testa o endpoint de relatórios diretamente"""
    try:
        url = "http://localhost:5000/reports/overview"
        print(f"Testando endpoint: {url}")
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Dados recebidos: {json.dumps(data, indent=2)}")
        else:
            print(f"Erro: {response.text}")
            
    except Exception as e:
        print(f"Erro ao testar endpoint: {e}")

if __name__ == "__main__":
    test_reports_endpoint()
