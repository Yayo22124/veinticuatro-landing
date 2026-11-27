export const esMessages = {
  "app.title": "veinticuatro studio — Entrega Privada",
  "app.description":
    "Plataforma privada de visualización y descarga de fotografía y video para clientes de veinticuatro studio.",
  "home.brand": "veinticuatro studio",
  "home.title": "Entrega Privada",
  "home.description":
    "Accede mediante el enlace personalizado y PIN proporcionados por el estudio para visualizar y descargar tu sesión.",
  "language.label": "Idioma",
  "language.es": "ES",
  "language.en": "EN",
  "auth.title": "Galería Privada",
  "auth.subtitle": "Ingresa el PIN de acceso para visualizar esta sesión.",
  "auth.pinLabel": "PIN de acceso",
  "auth.submit": "Ingresar",
  "auth.submitting": "Verificando...",
  "auth.invalidPin": "El PIN ingresado es incorrecto.",
  "auth.unexpectedError": "No se pudo verificar el acceso. Intenta de nuevo.",
  "gallery.photosCount": "{count} fotografías",
  "gallery.videosCount": "{count} videos",
  "gallery.packageAvailable": "Paquete ZIP disponible: {fileName}",
  "gallery.packageUnavailable": "Sin paquete ZIP disponible",
  "gallery.logout": "Cerrar sesión",
} as const;

export type MessageKey = keyof typeof esMessages;
export type Messages = Record<MessageKey, string>;
