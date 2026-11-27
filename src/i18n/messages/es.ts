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
} as const;

export type MessageKey = keyof typeof esMessages;
export type Messages = Record<MessageKey, string>;
