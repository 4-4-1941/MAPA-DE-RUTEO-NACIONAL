// CONFIGURACIÓN CENTRAL - EDITE AQUÍ SUS CAMPOS EPIDEMIOLÓGICOS
const CONFIG = {
    // URL del WMS del INEI (capa base)
    wmsUrl: 'https://ide.inei.gob.pe/geoserver/ows?',
    wmsLayer: 'inei:lima_metropolitana_vial', // Cambiar por la capa que necesite
    // Colores para los croquis
    colorPendiente: '#e74c3c', // Rojo: aún no visitado
    colorVisitado: '#2ecc71',  // Verde: ya registrado
    // Campos del formulario (agregue o quite según su estudio)
    campos: [
        { id: 'codigo', label: 'Código de Paciente', type: 'text', required: true },
        { id: 'edad', label: 'Edad (años)', type: 'number', required: true },
        { id: 'sexo', label: 'Sexo', type: 'select', options: ['Masculino', 'Femenino'], required: true },
        { id: 'sintomas', label: 'Síntoma Principal', type: 'select', options: ['Fiebre', 'Tos seca', 'Dolor de cabeza', 'Dificultad respiratoria', 'Dolor muscular'], required: true },
        { id: 'fecha_inicio', label: 'Fecha de inicio de síntomas', type: 'date', required: true },
        { id: 'hospitalizado', label: '¿Requirió hospitalización?', type: 'select', options: ['Sí', 'No'], required: true },
        { id: 'observaciones', label: 'Observaciones de campo', type: 'textarea', required: false }
    ]
};
