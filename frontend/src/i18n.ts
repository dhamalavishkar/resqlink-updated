import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Rescue Mesh Network": "Rescue Mesh Network",
      "Live Incident Map": "Live Incident Map",
      "Send Message": "Send Message",
      "Rescue Operations": "Rescue Operations",
      "Filters": "Filters",
      "Status": "Status",
      "Resources": "Resources",
      "Route Map": "Route Map",
      "Distance": "Distance",
      "Estimated Time": "Estimated Time",
      "Safety Info": "Safety Info",
      "Settings": "Settings"
    }
  },
  es: {
    translation: {
      "Dashboard": "Tablero",
      "Rescue Mesh Network": "Red de Malla de Rescate",
      "Live Incident Map": "Mapa de Incidentes en Vivo",
      "Send Message": "Enviar Mensaje",
      "Rescue Operations": "Operaciones de Rescate",
      "Filters": "Filtros",
      "Status": "Estado",
      "Resources": "Recursos",
      "Route Map": "Mapa de Rutas",
      "Distance": "Distancia",
      "Estimated Time": "Tiempo Estimado",
      "Safety Info": "Información de Seguridad",
      "Settings": "Configuraciones"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
