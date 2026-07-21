import React, { useEffect, useRef, useState } from "react";
import TypeBadge from "./TypeBadge";
import { formatName } from "../lib/types";
import { useToast } from "./Toast";

const RACE_DURATION_MS = 7000;
const LANES = 5;

function Lane({ label, poke, ani, isPlayer }) {
  return (
    <div className={`lane${isPlayer ? " lane-player" : ""}`}>
      <div className="lane-label">
        <span className="lane-tag">{label}</span>
        {poke?.name ? (
          <span className="lane-poke">
            {formatName(poke.name)}
            <span className="lane-speed">Speed {poke.speed}</span>
          </span>
        ) : (
          <span className="lane-empty">Waiting…</span>
        )}
      </div>
      <div className="lane-strip">
        {poke?.name && (
          <div
            className={`lane-runner${ani ? " running" : ""}`}
            style={{ animation: ani ? `sprint ${500 / poke.speed}s forwards` : "" }}
          >
            <img id="poke-track-display" src={poke.image} alt={poke.name} />
          </div>
        )}
        <div className="finish-line" />
      </div>
    </div>
  );
}

function Race({ dataArr }) {
  const [ani, setAni] = useState(false);
  const [racers, setRacers] = useState([]); // index 0 is the player's racer
  const notify = useToast();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const randomPoke = () => dataArr[Math.floor(Math.random() * dataArr.length)];

  function generateRacers() {
    if (ani) return;
    setRacers(Array.from({ length: LANES }, randomPoke));
  }

  function startRace() {
    if (ani) return;
    if (racers.length === 0) {
      return notify("Draw a lineup first — one click on New Lineup fills every lane.", "warn");
    }

    const playerSpeed = racers[0].speed;
    const topSpeed = Math.max(...racers.map((poke) => poke.speed));
    setAni(true);
    timerRef.current = setTimeout(() => {
      if (topSpeed === playerSpeed) {
        notify("You won the race! 🏆", "success");
      } else {
        notify("You lost the race. Draw a new lineup and try again!", "warn");
      }
      setAni(false);
    }, RACE_DURATION_MS);
  }

  return (
    <div className="game-page">
      <section className="game-header">
        <h1 className="game-title">Race Track</h1>
        <p className="game-subtitle">
          One click draws you and four rivals; the highest Speed stat takes the straightaway.
        </p>
      </section>

      <div className="game-controls">
        <button id="opponents" className="btn btn-dark" onClick={generateRacers} disabled={ani}>
          New Lineup
        </button>
        <button id="race" className="btn btn-primary" onClick={startRace} disabled={ani}>
          {ani ? "Racing…" : "Race!"}
        </button>
      </div>

      {racers[0]?.name && (
        <div className="picked-banner">
          Your racer: <strong>{formatName(racers[0].name)}</strong>
          <TypeBadge type={racers[0].type_one} size="sm" />
          <TypeBadge type={racers[0].type_two} size="sm" />
        </div>
      )}

      <div id="track-background" className="track">
        {Array.from({ length: LANES }, (_, i) => (
          <Lane
            key={racers[i] ? `${racers[i].name}-${i}` : i}
            label={i === 0 ? "You" : `CPU ${i}`}
            poke={racers[i]}
            ani={ani}
            isPlayer={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

export default Race;
