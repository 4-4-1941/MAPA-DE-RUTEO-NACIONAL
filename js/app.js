const App = {
    map: null,
    markerUser: null,
    routingControl: null,
    puntosLayer: null,
    currentFeature: null,
    geoJsonData: null,

    init: function() {
        // 1. Inicializar mapa con coordenadas de Lima
        this.map = L.map('map', { 
            center: [-12.0464, -77.0428], 
            zoom: 14,
            zoomControl: true
        });

        // 2. Capa base del INEI (WMS)
        L.tileLayer.wms(CONFIG.wmsUrl, {
            layers: CONFIG.wmsLayer,
            format: 'image/png',
            transparent: true,
            attribution: 'INEI - Perú'
        }).addTo(this.map);

        // 3. Cargar capa de OpenStreetMap como respaldo (opcional)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // 4. Cargar los croquis (desde window.croquisData)
        this.cargarCroquis(window.croquisData);

        // 5. Activar GPS
        this.activarGPS();

        // 6. Evento del botón GPS
        document.getElementById('btn-gps').addEventListener('click', () => {
            this.centrarEnGPS();
        });

        // 7. Evento del botón exportar
        document.getElementById('btn-export').addEventListener('click', () => {
            if (typeof Exportador !== 'undefined') {
                Exportador.exportarGeoJSON();
            } else {
                alert('Módulo de exportación no cargado.');
            }
        });

        // 8. Inicializar formulario dinámico
        if (typeof Formulario !== 'undefined') {
            Formulario.generarCampos(CONFIG.campos);
            document.getElementById('btn-save').addEventListener('click', () => {
                Formulario.guardarDatos(this.currentFeature);
            });
        }

        console.log('✅ App inicializada correctamente.');
    },

    cargarCroquis: function(data) {
        if (this.puntosLayer) {
            this.map.removeLayer(this.puntosLayer);
        }
        this.geoJsonData = data;
        this.puntosLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: 14,
                    fillColor: CONFIG.colorPendiente,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                });
            },
            onEachFeature: (feature, layer) => {
                // Popup con botón de ruteo
                const nombre = feature.properties.nombre || 'Punto sin nombre';
                const id = feature.properties.id || 'N/A';
                layer.bindPopup(`
                    <strong>${nombre}</strong><br>
                    ID: ${id}<br>
                    <button onclick="App.iniciarRuta(${layer.getLatLng().lat}, ${layer.getLatLng().lng})">🗺️ Trazar Ruta</button>
                    <button onclick="App.seleccionarPunto(this, '${id}')" style="background:#27ae60;margin-top:4px;">📋 Registrar Muestra</button>
                `);
                // Guardar referencia del feature en el layer
                layer.feature = feature;
            }
        }).addTo(this.map);
    },

    activarGPS: function() {
        if (!navigator.geolocation) {
            alert('Tu dispositivo no soporta GPS. Usa la ubicación manual.');
            return;
        }
        navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (!this.markerUser) {
                    const icon = L.divIcon({ className: 'gps-marker', html: '📍', iconSize: [30, 30] });
                    this.markerUser = L.marker([lat, lng], { icon: icon }).addTo(this.map);
                } else {
                    this.markerUser.setLatLng([lat, lng]);
                }
                // Si es la primera vez, centrar
                if (!this._centrado) {
                    this.map.setView([lat, lng], 16);
                    this._centrado = true;
                }
            },
            (err) => { console.warn('Error GPS:', err); },
            { enableHighAccuracy: true, maximumAge: 10000 }
        );
    },

    centrarEnGPS: function() {
        if (this.markerUser) {
            const pos = this.markerUser.getLatLng();
            this.map.setView(pos, 17);
        } else {
            alert('Aún no se obtiene señal GPS. Asegúrate de estar al aire libre.');
        }
    },

    iniciarRuta: function(lat, lng) {
        // Eliminar ruta anterior si existe
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
            this.routingControl = null;
        }
        if (!this.markerUser) {
            alert('Esperando señal GPS. No se puede calcular ruta.');
            return;
        }
        const origen = this.markerUser.getLatLng();
        const destino = L.latLng(lat, lng);
        
        this.routingControl = L.Routing.control({
            waypoints: [origen, destino],
            routeWhileDragging: false,
            show: false, // No mostrar panel de instrucciones
            addWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#007bff', weight: 6, opacity: 0.9 }]
            }
        }).addTo(this.map);

        // Mostrar resumen en el panel
        this.routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            const dist = (route.summary.totalDistance / 1000).toFixed(2);
            const time = Math.round(route.summary.totalTime / 60);
            document.getElementById('panel-coord').innerHTML = `📏 ${dist} km | ⏱️ ${time} min`;
            document.getElementById('panel-title').innerHTML = `📍 Ruta hacia destino`;
        });
    },

    seleccionarPunto: function(btn, id) {
        // Buscar el feature asociado
        const feature = this.geoJsonData.features.find(f => f.properties.id === id);
        if (feature) {
            this.currentFeature = feature;
            const coords = feature.geometry.coordinates;
            document.getElementById('panel-coord').innerHTML = `📍 ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
            document.getElementById('panel-title').innerHTML = `📋 ${feature.properties.nombre}`;
            // Expandir el panel
            document.getElementById('form-panel').style.maxHeight = '70vh';
            // Limpiar mensaje anterior
            document.getElementById('save-message').innerHTML = '';
            // Rellenar campos automáticos si existen
            if (typeof Formulario !== 'undefined') {
                Formulario.cargarEnFormulario(null); // limpiar
            }
        }
    }
};
