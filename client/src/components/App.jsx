import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import PokeDex from "./PokeDex";
import Race from "./Race";
import Battle from "./Battle";
import FavList from "./FavList";
import Login from "./Login";
import Pokeball from "./Pokeball";
import { ToastProvider, useToast } from "./Toast";
import { formatName } from "../lib/types";

function AppRoutes() {
  const [dataArr, setDataArr] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState("guest");
  const notify = useToast();

  useEffect(() => {
    fetch("/api/v1/pokemons")
      .then((res) => res.json())
      .then((data) => setDataArr(data));

    fetch("/api/v1/me").then((r) => {
      if (r.ok) r.json().then((me) => setUser(me));
    });

    fetch("/api/v1/user_favorites").then((r) => {
      if (r.ok) r.json().then((data) => setFavorites(data));
    });
  }, []);

  function addToFavorite(obj) {
    const newFav = { pokemon_id: obj.id };
    fetch("/api/v1/user_favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFav }),
    }).then((r) => {
      if (r.ok) {
        r.json().then((data) => {
          setFavorites((prev) => [...prev, data]);
          notify(`${formatName(data.pokemon.name)} added to your favorites!`, "success");
        });
      }
    });
  }

  function handleDeleteItem(deletedItem) {
    setFavorites((prev) => prev.filter((fav) => fav.id !== deletedItem.id));
    fetch(`/api/v1/user_favorites/${deletedItem.id}`, { method: "DELETE" });
  }

  if (dataArr.length > 300) {
    return (
      <div id="app">
        <NavBar user={user} setUser={setUser} setFavorites={setFavorites} />
        <main className="page">
          <Routes>
            <Route path="/track" element={<Race dataArr={dataArr} />} />
            <Route path="/arena" element={<Battle dataArr={dataArr} />} />
            <Route
              path="/favorites"
              element={<FavList user={user} favorites={favorites} onDeleteItem={handleDeleteItem} />}
            />
            <Route path="/login" element={<Login onLogin={setUser} setFavorites={setFavorites} />} />
            <Route
              path="/"
              element={
                <PokeDex
                  user={user}
                  dataArr={dataArr}
                  favorites={favorites}
                  addToFavorite={addToFavorite}
                />
              }
            />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <Pokeball size={72} className="loading-ball" />
      <p className="loading-title">Loading Pokédex…</p>
      <p className="loading-sub">Catching all 898 Pokémon</p>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
