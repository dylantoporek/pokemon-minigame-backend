import React from "react";
import { Link } from "react-router-dom";
import TypeBadge from "./TypeBadge";
import Pokeball from "./Pokeball";
import { typeColor, formatName, dexNumber } from "../lib/types";

function FavList({ favorites, onDeleteItem, user }) {
  return (
    <div className="fav-page">
      <section className="game-header">
        <h1 className="game-title">Favorites</h1>
        <p className="game-subtitle">Your team of favorites, saved from the Pokédex.</p>
      </section>

      {user === "guest" ? (
        <div className="empty-state">
          <Pokeball size={48} />
          <p>You must have an account to keep favorites.</p>
          <Link to="/login" className="btn btn-primary">
            Login or sign up
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <Pokeball size={48} />
          <p>No favorites yet — open a Pokémon in the Pokédex and add it to your team.</p>
          <Link to="/" className="btn btn-primary">
            Browse the Pokédex
          </Link>
        </div>
      ) : (
        <div className="fav-grid">
          {favorites.map((fav) => (
            <div
              id="fav-container"
              className="fav-card"
              key={fav.id}
              style={{ "--card-color": typeColor(fav.pokemon.type_one) }}
            >
              <span className="poke-card-number">{dexNumber(fav.pokemon.id)}</span>
              <span className="poke-card-sprite">
                <img id="poke-fav-img" src={fav.pokemon.image} alt={fav.pokemon.name} />
              </span>
              <span className="poke-card-name">{formatName(fav.pokemon.name)}</span>
              <span className="poke-card-types">
                <TypeBadge type={fav.pokemon.type_one} size="sm" />
                <TypeBadge type={fav.pokemon.type_two} size="sm" />
              </span>
              <button id="delete-fav" className="fav-remove" onClick={() => onDeleteItem(fav)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavList;
