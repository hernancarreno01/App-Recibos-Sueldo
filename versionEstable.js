import { session } from 'wix-storage';
import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(async function () {
    const loggedCuil = session.getItem("userCuil");

    // 1. CONTROL DE ACCESO SEGURIZADO
    if (!loggedCuil) {
        wixLocation.to("/acceso-empleados");
        return;
    }

    if ($w("#loader")) $w("#loader").show();

    // 2. CARGAR DATOS PERSONALES DEL EMPLEADO (Nombre + Apellido unificados)
    await cargarDatosEmpleado(loggedCuil);

    // 3. FILTRADO DE HISTORIAL DE RECIBOS DE SUELDO
    $w("#datasetRecibos").onReady(() => {
        $w("#datasetRecibos").setFilter(
            wixData.filter().eq("title", loggedCuil)
        )
        .then(() => {
            if ($w("#loader")) $w("#loader").hide();
            if ($w("#repeater1")) $w("#repeater1").show();
        })
        .catch((err) => console.error("Error al filtrar dataset de recibos:", err));
    });

    // 4. CONFIGURACIÓN CORRECTA DEL BOTÓN DE DESCARGA (UNA SOLA PESTAÑA NUEVA)
    if ($w("#repeater1")) {
        $w("#repeater1").onItemReady(($item, itemData) => {
            if ($item("#txtPeriodo")) $item("#txtPeriodo").text = itemData.periodo;

            if ($item("#btnDescargar")) {
                if (itemData.archivo) {
                    // Asignamos el enlace directamente a las propiedades del botón de Wix
                    $item("#btnDescargar").link = itemData.archivo;
                    // Forzamos a que el navegador lo abra obligatoriamente en una pestaña nueva limpia
                    $item("#btnDescargar").target = "_blank";
                } else {
                    $item("#btnDescargar").link = "";
                }
            }
        });
    }

    // 5. ESCUCHADOR PARA ABRIR EL CUADRO DE CAMBIO DE CLAVE
    $w("#btnAbrirCambio").onClick(() => {
        if ($w("#inputNuevaClave")) $w("#inputNuevaClave").value = "";
        if ($w("#txtMsgClave")) $w("#txtMsgClave").hide(); 
        
        if ($w("#boxCambioClave")) {
            $w("#boxCambioClave").expand()
                .then(() => {
                    return $w("#boxCambioClave").show();
                });
        }
    });

    // 6. ACCIÓN DEL BOTÓN CANCELAR (Cerrar cuadro flotante)
    $w("#btnCancelar").onClick(() => {
        if ($w("#boxCambioClave")) {
            $w("#boxCambioClave").hide()
                .then(() => {
                    return $w("#boxCambioClave").collapse();
                });
        }
    });

    // 7. GUARDAR LA NUEVA CLAVE EN LA COLECCIÓN INDEPENDIENTE
    $w("#btnGuardarClave").onClick(async () => {
        const nuevaClave = $w("#inputNuevaClave").value ? $w("#inputNuevaClave").value.trim() : "";
        
        if (nuevaClave && nuevaClave.length >= 4) {
            $w("#btnGuardarClave").disable();
            try {
                const results = await wixData.query("UsuariosCredenciales")
                    .eq("title", loggedCuil)
                    .find();
                
                if (results.items.length > 0) {
                    let usuarioCredencial = results.items[0];
                    usuarioCredencial.claveModificada = nuevaClave;

                    await wixData.update("UsuariosCredenciales", usuarioCredencial);

                    $w("#txtMsgClave").text = "✔️ Clave actualizada.";
                    $w("#txtMsgClave").show();
                    
                    setTimeout(() => {
                        if ($w("#boxCambioClave")) {
                            $w("#boxCambioClave").hide().then(() => $w("#boxCambioClave").collapse());
                        }
                        $w("#btnGuardarClave").enable();
                    }, 2000);
                } else {
                    $w("#txtMsgClave").text = "❌ Error: Perfil no encontrado.";
                    $w("#txtMsgClave").show();
                    $w("#btnGuardarClave").enable();
                }
            } catch (err) {
                console.error("Error al procesar el cambio de clave:", err);
                $w("#txtMsgClave").text = "❌ Error al guardar.";
                $w("#txtMsgClave").show();
                $w("#btnGuardarClave").enable();
            }
        } else {
            $w("#txtMsgClave").text = "La clave debe tener 4 caracteres o más.";
            $w("#txtMsgClave").show();
        }
    });

    // 8. BOTÓN PARA CERRAR SESIÓN
    $w("#btnLogout").onClick(() => {
        session.clear();
        wixLocation.to("/");
    });
});

async function cargarDatosEmpleado(cuil) {
    try {
        const cuilLimpio = String(cuil).replace(/\D/g, ""); 
        let cuilFormateado = cuil; 
        
        if (cuilLimpio.length === 11) {
            cuilFormateado = `${cuilLimpio.substring(0, 2)}-${cuilLimpio.substring(2, 10)}-${cuilLimpio.substring(10, 11)}`;
        }

        const result = await wixData.query("UsuariosCredenciales")
            .eq("title", cuil)
            .find();

        if (result.items.length > 0) {
            const empleado = result.items[0];
            const nombreDb = (empleado.nombre || "").trim();
            const apellidoDb = (empleado.apellido || "").trim();

            if (nombreDb || apellidoDb) {
                const nombreCompleto = `${nombreDb} ${apellidoDb}`.trim();
                if ($w("#txtSaludoEmpleado")) $w("#txtSaludoEmpleado").text = `¡Bienvenido/a, ${nombreCompleto}!`;
            } else {
                if ($w("#txtSaludoEmpleado")) $w("#txtSaludoEmpleado").text = "¡Bienvenido/a!";
            }
        } else {
            if ($w("#txtSaludoEmpleado")) $w("#txtSaludoEmpleado").text = "¡Bienvenido/a!";
        }

        if ($w("#txtCuilFormateado")) $w("#txtCuilFormateado").text = `CUIL: ${cuilFormateado}`;

    } catch (error) {
        console.error("Error al cargar los datos unificados del empleado:", error);
        if ($w("#txtSaludoEmpleado")) $w("#txtSaludoEmpleado").text = "¡Bienvenido/a!";
    }
}