#!/usr/bin/env python3
import sys
import os
sys.path.append('backend')

from models.report import Relatorios

def test_reports():
    print("Testing reports functionality...")
    
    try:
        # Test the function directly
        result = Relatorios.obter_dados_resumo_com_filtros()
        print(f"Result: {result}")
        
        if "error" in result:
            print(f"Error found: {result['error']}")
        else:
            print("Success! Report data retrieved.")
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_reports()
