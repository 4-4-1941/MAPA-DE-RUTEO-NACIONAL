const Exportador = {
    exportarGeoJSON: function() {
        const raw = localStorage.getItem('datosEpidemiologicos');
        if (!raw || JSON.parse(raw).length === 0) {
            alert('No hay datos guardados para exportar.');
            return;
        }
        const datos = JSON.parse(raw);
        // Convertir a FeatureCollection de GeoJSON
        const features = datos.map(reg => {
            return {
                type: "Feature",
                properties: {
                    id_punto: reg.id_punto,
                    nombre_punto: reg.nombre_punto,
                    fecha_registro: reg.fecha_registro,
                    ...reg.datos
                },
                geometry: {
                    type: "Point",
                    coordinates: reg.coordenadas
                }
            };
        });

        const geojson = {
            type: "FeatureCollection",
            features: features
        };

        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos_epidemiologicos_${new Date().toISOString().slice(0,10)}.geojson`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ Exportados ${features.length} registros.`);
    }
};
