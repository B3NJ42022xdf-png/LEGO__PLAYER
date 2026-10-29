export type ThemeId =
  | "ninjago"
  | "star-wars"
  | "chima"
  | "scooby-doo"
  | "variado";

export interface LegoTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  /** CSS custom property holding the theme's identity color. */
  colorVar: string;
  /** Tailwind background class for the collection card. */
  cardClass: string;
  /** Tailwind text class for the collection card label. */
  textClass: string;
}

export interface Product {
  id: string;
  name: string;
  theme: ThemeId;
  /** Price in euro cents. */
  priceCents: number;
  description: string;
  image: string;
  pieces: number;
  ageRange: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}
