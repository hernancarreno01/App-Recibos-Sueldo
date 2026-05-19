import os
import pandas as pd # Si no lo tienes, corre: pip install pandas

def generar_csv_wix():
    ruta_recibos = "recibos_separados"
    if not os.path.exists(ruta_recibos):
        print(f"Error: La carpeta '{ruta_recibos}' no existe. Ejecuta primero 'separador.py'.")
        return

    datos = []

    for archivo in os.listdir(ruta_recibos):
        if archivo.endswith(".pdf"):
            cuil = archivo.replace(".pdf", "")
            
            # El DNI suelen ser los dígitos del 3 al 10 en un CUIL
            # Ajustamos por si el CUIL tiene 11 dígitos
            dni = cuil[2:10] if len(cuil) == 11 else cuil
            
            datos.append({
                "CUIL": cuil,
                "DNI": dni,
                "NombreArchivo": archivo
            })

    df = pd.DataFrame(datos)
    df.to_csv("base_de_datos_wix.csv", index=False, encoding='utf-8')
    print("¡CSV generado con éxito como 'base_de_datos_wix.csv'!")

if __name__ == "__main__":
    generar_csv_wix()