# App Recibos de Sueldo

Este proyecto automatiza el procesamiento de recibos de sueldo en formato PDF.

## Funcionalidades
- **separador.py**: Divide un PDF masivo en archivos individuales por CUIL.
- **capturaNombres.py**: Extrae la relación entre CUIL y Nombre del empleado.
- **generar_csv.py**: Crea una base de datos en CSV lista para importar a plataformas como Wix.

## Instalación
`pip install -r requirements.txt`

## Uso
Ejecuta el separador indicando el archivo PDF:
`python separador.py archivo.pdf`