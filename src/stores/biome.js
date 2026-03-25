import { persistentAtom } from "@nanostores/persistent";

export const biomeState = persistentAtom(
  "biomeState",
  {
    title: "Ruines d'Élyndra",
    image: "/biomes/elyndra.webp",
    desc: "Une cité perdue avec des pierres runiques",
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);