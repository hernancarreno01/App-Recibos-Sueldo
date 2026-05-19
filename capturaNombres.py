import sys
import fitz  # PyMuPDF
import re
import csv
import os

def extraer_empleados(pdf_entrada, csv_salida="empleados.csv"):

    if not os.path.exists(pdf_entrada):
        print(f"No existe el archivo: {pdf_entrada}")
        return

    doc = fitz.open(pdf_entrada)

    empleados = {}

    print("Procesando PDF...\n")

    for num_pagina in range(len(doc)):

        pagina = doc.load_page(num_pagina)
        texto = pagina.get_text()

        lineas = [l.strip() for l in texto.split("\n") if l.strip()]

        cuil_encontrado = None
        nombre_encontrado = None

        # =========================
        # BUSCAR CUIL
        # =========================

        for linea in lineas:

            match_cuil = re.search(r'\b(\d{11})\b', linea)

            if match_cuil:
                cuil_encontrado = match_cuil.group(1)
                break

        # =========================
        # BUSCAR NOMBRE
        # =========================
        # Busca líneas tipo:
        # CUTRINI, ADRIAN JAVIER

        for linea in lineas:

            linea = linea.strip()

            if re.match(r'^[A-ZÁÉÍÓÚÑ\s]+,\s*[A-ZÁÉÍÓÚÑ\s]+$', linea):

                # Evitar textos que no sean nombres
                if len(linea) > 5 and len(linea) < 60:
                    nombre_encontrado = linea
                    break

        # =========================
        # GUARDAR
        # =========================

        if cuil_encontrado and nombre_encontrado:

            if cuil_encontrado not in empleados:

                empleados[cuil_encontrado] = nombre_encontrado

                print(f"Página {num_pagina + 1}")
                print(f"CUIL: {cuil_encontrado}")
                print(f"Nombre: {nombre_encontrado}")
                print("-" * 40)

    doc.close()

    # =========================
    # CREAR CSV
    # =========================

    with open(csv_salida, mode="w", newline="", encoding="utf-8-sig") as archivo:

        writer = csv.writer(archivo)

        writer.writerow(["CUIL", "NOMBRE"])

        for cuil, nombre in empleados.items():

            writer.writerow([cuil, nombre])

    print(f"\nCSV generado correctamente: {csv_salida}")


if __name__ == "__main__":

    # Permite usar: python capturaNombres.py nombre_archivo.pdf
    archivo_input = sys.argv[1] if len(sys.argv) > 1 else "04-2026.pdf"
    extraer_empleados(archivo_input)
