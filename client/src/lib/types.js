// Official-style Pokémon type colors.
export const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export const TYPE_NAMES = Object.keys(TYPE_COLORS);

export const typeColor = (type) => TYPE_COLORS[type] || "#A8A77A";

export const formatName = (name = "") =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

export const dexNumber = (id) => `#${String(id).padStart(3, "0")}`;
