import React, { useMemo, useState } from "react";
import PokeDexItem from "./PokeDexItem";
import PokemonDetails from "./PokemonDetails";
import { TYPE_NAMES, typeColor, formatName } from "../lib/types";

function PokeDex({ dataArr, favorites, addToFavorite, user }) {
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [specificPoke, setSpecificPoke] = useState(null);

  const filtered = useMemo(
    () =>
      dataArr.filter((poke) => {
        if (!poke.name.toLowerCase().startsWith(filter.toLowerCase())) return false;
        if (typeFilter && poke.type_one !== typeFilter && poke.type_two !== typeFilter)
          return false;
        return true;
      }),
    [dataArr, filter, typeFilter]
  );

  const favoriteIds = useMemo(
    () => new Set(favorites.map((fav) => fav.pokemon.id)),
    [favorites]
  );

  return (
    <div className="pokedex-page">
      <section className="dex-hero">
        <h1 className="dex-title">Pokédex</h1>
        <p className="dex-subtitle">
          All {dataArr.length} Pokémon from Kanto to Galar. Tap one for its stats.
        </p>
        <div className="dex-search-wrap">
          <svg className="dex-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            id="pokedex-search"
            type="text"
            placeholder="Search by name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="type-chips">
          <button
            className={`type-chip type-chip-all${typeFilter === null ? " active" : ""}`}
            onClick={() => setTypeFilter(null)}
          >
            All
          </button>
          {TYPE_NAMES.map((type) => (
            <button
              key={type}
              className={`type-chip${typeFilter === type ? " active" : ""}`}
              style={{ "--chip-color": typeColor(type) }}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            >
              {formatName(type)}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="dex-empty">No Pokémon match that search.</p>
      ) : (
        <div id="list-container">
          {filtered.map((poke) => (
            <PokeDexItem
              key={poke.name}
              poke={poke}
              isFavorite={favoriteIds.has(poke.id)}
              onSelect={() => setSpecificPoke(specificPoke ? null : poke)}
            />
          ))}
        </div>
      )}

      {specificPoke && (
        <PokemonDetails
          user={user}
          poke={specificPoke}
          setSpecificPoke={setSpecificPoke}
          addToFavorite={addToFavorite}
          isFavorite={favoriteIds.has(specificPoke.id)}
        />
      )}
    </div>
  );
}

export default PokeDex;
