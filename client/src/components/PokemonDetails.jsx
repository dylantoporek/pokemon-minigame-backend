import React, { useEffect } from "react";
import TypeBadge from "./TypeBadge";
import { typeColor, formatName, dexNumber } from "../lib/types";
import { useToast } from "./Toast";

const STAT_MAX = 255;

const STATS = [
  ["HP", "hp"],
  ["Attack", "attack"],
  ["Defense", "defense"],
  ["Sp. Atk", "special_attack"],
  ["Sp. Def", "special_defense"],
  ["Speed", "speed"],
];

function PokemonDetails({ poke, setSpecificPoke, addToFavorite, user, isFavorite }) {
  const notify = useToast();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSpecificPoke(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSpecificPoke]);

  function handleAddToFavorites() {
    if (user === "guest") {
      notify("You must be logged in to save favorites.", "warn");
    } else if (isFavorite) {
      notify(`${formatName(poke.name)} is already in your favorites.`, "info");
    } else {
      addToFavorite(poke);
    }
  }

  const accent = typeColor(poke.type_one);

  return (
    <div className="modal-overlay" onClick={() => setSpecificPoke(null)}>
      <div
        className="poke-modal"
        role="dialog"
        aria-label={poke.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="poke-modal-header"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${typeColor(
              poke.type_two || poke.type_one
            )} 100%)`,
          }}
        >
          <button id="close-details" aria-label="Close" onClick={() => setSpecificPoke(null)}>
            ✕
          </button>
          <span className="poke-modal-number">{dexNumber(poke.id)}</span>
          <h2 className="poke-modal-name">{formatName(poke.name)}</h2>
          <div className="poke-modal-types">
            <TypeBadge type={poke.type_one} />
            <TypeBadge type={poke.type_two} />
          </div>
          {poke.official_image && (
            <img className="poke-modal-art" src={poke.official_image} alt={poke.name} />
          )}
        </div>

        <div className="poke-modal-body">
          <h3 className="stats-heading">Base stats</h3>
          <div className="stats-grid">
            {STATS.map(([label, key]) => (
              <div className="stat-row" key={key}>
                <span className="stat-label">{label}</span>
                <span className="stat-value">{poke[key]}</span>
                <div className="stat-track">
                  <div
                    className="stat-bar"
                    style={{
                      width: `${Math.min(100, (poke[key] / STAT_MAX) * 100)}%`,
                      backgroundColor: accent,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            id="add-to-fav"
            className={isFavorite ? "is-favorite" : ""}
            onClick={handleAddToFavorites}
          >
            {isFavorite ? "♥ In your favorites" : "♡ Add to favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
