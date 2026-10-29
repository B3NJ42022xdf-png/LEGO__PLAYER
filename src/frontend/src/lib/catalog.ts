import type { LegoTheme, Product, ThemeId } from "@/types";

export const THEMES: LegoTheme[] = [
  {
    id: "ninjago",
    name: "Ninjago",
    tagline: "Maestros del Spinjitzu",
    colorVar: "--theme-ninjago",
    cardClass: "bg-[oklch(0.5_0.2_25)]",
    textClass: "text-[oklch(0.98_0.02_85)]",
  },
  {
    id: "star-wars",
    name: "Star Wars",
    tagline: "Una galaxia de ladrillos",
    colorVar: "--theme-starwars",
    cardClass: "bg-[oklch(0.32_0.09_255)]",
    textClass: "text-[oklch(0.98_0.02_85)]",
  },
  {
    id: "chima",
    name: "Chima",
    tagline: "Leyendas de los animales",
    colorVar: "--theme-chima",
    cardClass: "bg-[oklch(0.62_0.19_145)]",
    textClass: "text-[oklch(0.99_0.01_145)]",
  },
  {
    id: "scooby-doo",
    name: "Scooby-Doo",
    tagline: "Misterios por resolver",
    colorVar: "--theme-scooby",
    cardClass: "bg-[oklch(0.5_0.2_305)]",
    textClass: "text-[oklch(0.98_0.02_305)]",
  },
  {
    id: "variado",
    name: "Variado",
    tagline: "Ciudad, bomberos y más",
    colorVar: "--theme-variado",
    cardClass: "bg-[oklch(0.68_0.16_200)]",
    textClass: "text-[oklch(0.2_0.03_220)]",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "ninjago-dragon",
    name: "Dragón Ninjago",
    theme: "ninjago",
    priceCents: 5999,
    description:
      "Un imponente dragón articulado con alas desplegables y detalles dorados. Incluye cuatro minifiguras ninja listas para la batalla y una base de exhibición con rocas.",
    image: "/assets/generated/product-ninjago-dragon.dim_800x800.jpg",
    pieces: 876,
    ageRange: "9+",
  },
  {
    id: "ninjago-mech",
    name: "Mech Ninjago",
    theme: "ninjago",
    priceCents: 5999,
    description:
      "Robot caminante con cabina para piloto, brazos articulados y cañones de energía. Perfecto para recrear las batallas más épicas del mundo ninja.",
    image: "/assets/generated/product-ninjago-mech.dim_800x800.jpg",
    pieces: 742,
    ageRange: "8+",
  },
  {
    id: "star-wars-xwing",
    name: "Caza Estelar X-Wing",
    theme: "star-wars",
    priceCents: 5999,
    description:
      "Réplica detallada del caza estelar con alas en configuración de ataque, cabina abatible y dos minifiguras de piloto. Un clásico imprescindible.",
    image: "/assets/generated/product-starwars-xwing.dim_800x800.jpg",
    pieces: 689,
    ageRange: "9+",
  },
  {
    id: "chima-lion",
    name: "Guerrero León de Chima",
    theme: "chima",
    priceCents: 5999,
    description:
      "Criatura alada con armadura tribal y jinete minifigura. Defiende el reino de Chima con esta fiera construible llena de color.",
    image: "/assets/generated/product-chima-lion.dim_800x800.jpg",
    pieces: 512,
    ageRange: "7+",
  },
  {
    id: "scooby-van",
    name: "Furgoneta Misteriosa",
    theme: "scooby-doo",
    priceCents: 5999,
    description:
      "La mítica furgoneta de la pandilla con puertas correderas, techo desmontable y cuatro minifiguras más el inseparable perro detective.",
    image: "/assets/generated/product-scooby-van.dim_800x800.jpg",
    pieces: 604,
    ageRange: "8+",
  },
  {
    id: "variado-city",
    name: "Circuito Urbano",
    theme: "variado",
    priceCents: 4999,
    description:
      "Set de ciudad con coche de carreras, camioneta de reparto y dos minifiguras. Ideal para empezar a construir tu propia metrópolis de ladrillos.",
    image: "/assets/generated/product-variado-city.dim_800x800.jpg",
    pieces: 438,
    ageRange: "6+",
  },
  {
    id: "variado-fire",
    name: "Camión de Bomberos",
    theme: "variado",
    priceCents: 5999,
    description:
      "Camión de bomberos con escalera extensible, mangueras y dos bomberos minifigura. Rescates de emergencia garantizados.",
    image: "/assets/generated/product-variado-fire.dim_800x800.jpg",
    pieces: 571,
    ageRange: "7+",
  },
];

export function getTheme(id: ThemeId): LegoTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function productsByTheme(id: ThemeId): Product[] {
  return PRODUCTS.filter((product) => product.theme === id);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
