import React from "react";
import TypeBadge from "./TypeBadge";
import { typeColor, formatName, dexNumber } from "../lib/types";

function PokeDexItem({ poke, onSelect, isFavorite }) {
  return (
    <button
      id="poke-item"
      className="poke-card"
      onClick={onSelect}
      style={{ "--card-color": typeColor(poke.type_one) }}
    >
      <span className="poke-card-number">{dexNumber(poke.id)}</span>
      {isFavorite && (
        <span className="poke-card-fav" title="In your favorites">
          ♥
        </span>
      )}
      <span className="poke-card-sprite">
        {poke.image && <img src={poke.image} alt={poke.name} loading="lazy" />}
      </span>
      <span id="poke-name" className="poke-card-name">
        {formatName(poke.name)}
      </span>
      <span className="poke-card-types">
        <TypeBadge type={poke.type_one} size="sm" />
        <TypeBadge type={poke.type_two} size="sm" />
      </span>
    </button>
  );
}

export default PokeDexItem;
