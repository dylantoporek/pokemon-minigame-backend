import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Pokeball from "./Pokeball";

const PokedexIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="2" width="18" height="20" rx="3" />
    <circle cx="8" cy="7" r="2.2" />
    <line x1="13" y1="6" x2="18" y2="6" />
    <line x1="13" y1="9" x2="18" y2="9" />
    <line x1="6" y1="14" x2="18" y2="14" />
    <line x1="6" y1="18" x2="14" y2="18" />
  </svg>
);

const TrackIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 4h6l2 4-3 2-3-1" />
    <path d="M13 4l-2 6 4 3v7" />
    <path d="M9 20h6" />
    <path d="M11 10l-5 2-3-1" />
  </svg>
);

const ArenaIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
    <path d="M5 19l-2 2" />
  </svg>
);

const FavIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21C7 16.5 3 13 3 8.8 3 6 5 4 7.6 4c1.7 0 3.3.9 4.4 2.3C13.1 4.9 14.7 4 16.4 4 19 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z" />
  </svg>
);

function NavBar({ user, setUser, setFavorites }) {
  const navigate = useNavigate();

  function handleClick() {
    if (user === "guest") {
      navigate("/login");
    } else {
      fetch("/api/v1/logout", { method: "DELETE" }).then((r) => {
        if (r.ok) {
          setUser("guest");
          setFavorites([]);
        }
      });
      navigate("/");
    }
  }

  return (
    <header id="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          <Pokeball size={30} className="brand-ball" />
          <span className="brand-name">
            Poké<span className="brand-accent">Dex</span>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            {PokedexIcon}
            <span>Pokédex</span>
          </NavLink>
          <NavLink to="/track" className="nav-link">
            {TrackIcon}
            <span>Race Track</span>
          </NavLink>
          <NavLink to="/arena" className="nav-link">
            {ArenaIcon}
            <span>Arena</span>
          </NavLink>
          <NavLink to="/favorites" className="nav-link">
            {FavIcon}
            <span>Favorites</span>
          </NavLink>
        </nav>

        <div className="nav-user">
          {user !== "guest" && <span className="nav-username">{user.username}</span>}
          <button id="user-button" onClick={handleClick}>
            {user === "guest" ? "Login" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
