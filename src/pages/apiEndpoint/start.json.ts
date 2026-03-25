import { type APIRoute } from "astro";
import { setupCollections } from "../../../backend/functions/user";
import { createPlayer } from "../../../backend/functions/player";

const roles = [
  {
    id: 1,
    slug: "chevalier",
    title: "Le Chevalier",
    description: "Un guerrier en armure forgé dans l'acier et la bravoure",
    for: +3,
    def: +1,
    mag: -2,
    agi: -2,
  },
  {
    id: 2,
    slug: "mage",
    title: "La Mage",
    description: "Tisseuse de sorts, elle plie les éléments à sa volonté",
    for: -1,
    def: -2,
    mag: +3,
    agi: 0,
  },
  {
    id: 3,
    slug: "chimiste",
    title: "Le Chimiste",
    description:
      "Maître des potions et des runes, il transforme la nature en arme",
    for: -1,
    def: -1,
    mag: 0,
    agi: +2,
  },
  {
    id: 4,
    slug: "ombre",
    title: "L'Ombre",
    description:
      "Assassin des ténèbres, il frappe vite et disparaît sans laisser de traces",
    for: -1,
    def: -2,
    mag: 0,
    agi: +3,
  },
];

export const POST: APIRoute = async ({ locals, request, redirect }) => {
    try {
        const params = await request.json();
        console.log("[start] Params :",params);
        const role = roles.find((el) => el.id == params.role);
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await setupCollections(id);
            await createPlayer(id, {name: params.nom, class: role?.slug, isCurrent: true, currentHP: 100, maxHP: 100, for: role?.for, def: role?.def, mag : role?.mag, agi: role?.agi});

            return new Response(
                JSON.stringify({ reply: "Collections set up correctly" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        } else {
            return new Response(
                JSON.stringify({ reply: "You must be connected to set up collections" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }
    } catch (error) {
      console.error("[API error]", error);
      return new Response(
        JSON.stringify({ reply: "There was an error", error: error?.message ?? String(error) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
};