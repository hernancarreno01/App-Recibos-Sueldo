import sys
import fitz  # PyMuPDF
import re
import os

def separar_recibos(archivo_entrada):
    if not os.path.exists(archivo_entrada):
        print(f"Error: No se encuentra el archivo '{archivo_entrada}'. Asegúrate de que el nombre sea correcto.")
        return

    doc = fitz.open(archivo_entrada)
    recibos_por_cuil = {}

    print("Analizando páginas...")

    for num_pagina in range(len(doc)):
        pagina = doc.load_page(num_pagina)
        texto = pagina.get_text()
        
        # Buscamos el CUIL: Un patrón de 11 números seguidos
        # Según tu imagen, el CUIL está claro en el encabezado
        match = re.search(r'(\d{11})', texto)
        
        if match:
            cuil = match.group(1)
            if cuil not in recibos_por_cuil:
                recibos_por_cuil[cuil] = []
            recibos_por_cuil[cuil].append(num_pagina)
            print(f"Página {num_pagina + 1}: Detectado CUIL {cuil}")

    # Creamos una carpeta para los resultados
    if not os.path.exists("recibos_separados"):
        os.makedirs("recibos_separados")

    # Generamos los PDFs individuales
    print("\nGenerando archivos individuales...")
    for cuil, paginas in recibos_por_cuil.items():
        nuevo_pdf = fitz.open()
        for p in paginas:
            nuevo_pdf.insert_pdf(doc, from_page=p, to_page=p)
        
        nombre_salida = f"recibos_separados/{cuil}.pdf"
        nuevo_pdf.save(nombre_salida)
        nuevo_pdf.close()
        print(f"Creado: {nombre_salida} ({len(paginas)} páginas)")

    doc.close()
    print("\n¡Proceso terminado!")

if __name__ == "__main__":
    # Permite usar: python separador.py nombre_archivo.pdf
    archivo_input = sys.argv[1] if len(sys.argv) > 1 else "04-2026.pdf"
    separar_recibos(archivo_input)