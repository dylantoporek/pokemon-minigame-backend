import React, { useState } from "react";
import { useToast } from "./Toast";

// Shared control bar for the Race and Arena pages: search for your Pokémon,
// pick a random one or a random favorite, plus game-specific buttons.
function PickerControls({ dataArr, favorites, user, onPick, extraButtons = [], action, disabled }) {
  const [pokeName, setPokeName] = useState("");
  const notify = useToast();

  function handleSubmit(e) {
    e.preventDefault();
    const match = dataArr.find((poke) => poke.name.toLowerCase() === pokeName.toLowerCase());
    if (!match) {
      return notify(`No Pokémon named "${pokeName}" — check the spelling in the Pokédex.`, "warn");
    }
    onPick(match);
    setPokeName("");
  }

  function randomPlayerPoke() {
    onPick(dataArr[Math.floor(Math.random() * dataArr.length)]);
  }

  function randomFavPoke() {
    if (user === "guest") {
      return notify("You must be logged in to use your favorites.", "warn");
    }
    if (favorites.length === 0) {
      return notify("You need at least one favorite to use this button!", "warn");
    }
    const randomFav = favorites[Math.floor(Math.random() * favorites.length)];
    const match = dataArr.find((poke) => poke.name === randomFav.pokemon.name);
    if (match) onPick(match);
  }

  return (
    <div className="picker-controls">
      <form className="picker-search" onSubmit={handleSubmit}>
        <input
          type="text"
          list="pokemon-names"
          placeholder="Choose your Pokémon…"
          value={pokeName}
          disabled={disabled}
          onChange={(e) => setPokeName(e.target.value)}
        />
        <datalist id="pokemon-names">
          {dataArr.map((poke) => (
            <option key={poke.name} value={poke.name} />
          ))}
        </datalist>
        <button type="submit" className="btn btn-dark" disabled={disabled}>
          Search
        </button>
      </form>

      <div className="picker-buttons">
        <button className="btn" onClick={randomPlayerPoke} disabled={disabled}>
          Random Pokémon
        </button>
        <button className="btn" onClick={randomFavPoke} disabled={disabled}>
          Random Favorite
        </button>
        {extraButtons.map((b) => (
          <button key={b.id} id={b.id} className="btn" onClick={b.onClick} disabled={disabled}>
            {b.label}
          </button>
        ))}
        {action && (
          <button id={action.id} className="btn btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default PickerControls;
