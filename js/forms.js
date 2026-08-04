const Formulario = {
    campos: [],
    datosGuardados: [],

    generarCampos: function(camposConfig) {
        this.campos = camposConfig;
        const container = document.getElementById('form-container');
        container.innerHTML = '';
        camposConfig.forEach(campo => {
            const div = document.createElement('div');
            div.className = 'form-group';
            const label = document.createElement('label');
            label.htmlFor = campo.id;
            label.textContent = campo.label + (campo.required ? ' *' : '');
            div.appendChild(label);

            let input;
            if (campo.type === 'select') {
                input = document.createElement('select');
                input.id = campo.id;
                input.required = campo.required;
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '-- Seleccionar --';
                input.appendChild(opt);
                campo.options.forEach(op => {
                    const opt2 = document.createElement('option');
                    opt2.value = op;
                    opt2.textContent = op;
                    input.appendChild(opt2);
                });
            } else if (campo.type === 'textarea') {
                input = document.createElement('textarea');
                input.id = campo.id;
                input.rows = 2;
            } else {
                input = document.createElement('input');
                input.type = campo.type;
                input.id = campo.id;
                input.required = campo.required;
            }
            div.appendChild(input);
            container.appendChild(div);
        });
    },

    cargarEnFormulario: function(data) {
        // Limpia los campos
        this.campos.forEach(campo => {
            const el = document.getElementById(campo.id);
            if (el) el.value = '';
        });
    },

    guardarDatos: function(feature) {
        if (!feature) {
            document.getElementById('save-message').innerHTML = '❌ Selecciona un punto en el mapa primero.';
            document.getElementById('save-message').style.color = '#e74c3c';
            return;
        }
        // Recolectar datos
        const registro = {
            id_punto: feature.properties.id,
            nombre_punto: feature.properties.nombre,
            coordenadas: feature.geometry.coordinates,
            fecha_registro: new Date().toISOString(),
            datos: {}
        };
        let valido = true;
        this.campos.forEach(campo => {
            const el = document.getElementById(campo.id);
            if (el) {
                const valor = el.value.trim();
                if (campo.required && !valor) {
                    valido = false;
                    el.style.borderColor = '#e74c3c';
                } else {
                    el.style.borderColor = '#dfe6e9';
                    registro.datos[campo.id] = valor;
                }
            }
        });

        if (!valido) {
            document.getElementById('save-message').innerHTML = '⚠️ Completa todos los campos obligatorios.';
            document.getElementById('save-message').style.color = '#e74c3c';
            return;
        }

        // Guardar en LocalStorage
        let historial = JSON.parse(localStorage.getItem('datosEpidemiologicos')) || [];
        historial.push(registro);
        localStorage.setItem('datosEpidemiologicos', JSON.stringify(historial));

        // Cambiar color del punto a visitado
        if (App.puntosLayer) {
            App.puntosLayer.eachLayer(layer => {
                if (layer.feature && layer.feature.properties.id === feature.properties.id) {
                    layer.setStyle({ fillColor: CONFIG.colorVisitado });
                }
            });
        }

        document.getElementById('save-message').innerHTML = '✅ Muestra guardada correctamente.';
        document.getElementById('save-message').style.color = '#27ae60';
        // Limpiar campos
        this.campos.forEach(campo => {
            const el = document.getElementById(campo.id);
            if (el) el.value = '';
        });
    }
};
