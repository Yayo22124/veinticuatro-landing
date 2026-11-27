export interface GalleryCoverConfig {
  mobileFileName: string;
  desktopFileName: string;
}

export const GALLERY_COVERS: Record<string, GalleryCoverConfig> = {
  "xv-aime": {
    mobileFileName: "foto-XV-aime479.webp",
    desktopFileName: "foto-XV-aime481.webp",
  },
};

export const STUDIO_SOCIAL_LINKS = {
  instagram:
    "https://www.instagram.com/veinticuatro.studioo?utm_source=ig_web_button_share_sheet&hvrq=ZDNlZDc0MzIxNw==",
  facebook: "https://www.facebook.com/profile.php?id=61592466637236&sk=about",
  whatsapp: "https://wa.me/527641151920",
  whatsappDisplay: "+52 764 115 1920",
} as const;
