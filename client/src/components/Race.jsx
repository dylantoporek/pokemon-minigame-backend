import React, { useRef, useState } from "react";
import PickerControls from "./PickerControls";
import TypeBadge from "./TypeBadge";
import { formatName } from "../lib/types";
import { useToast } from "./Toast";

const RACE_DURATION_MS = 7000;

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
            className="lane-runner"
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

function Race({ dataArr, favorites, user }) {
  const [ani, setAni] = useState(false);
  const [playerPoke, setPlayerPoke] = useState([]);
  const [cpus, setCpus] = useState([{}, {}, {}, {}]);
  const notify = useToast();
  const timerRef = useRef(null);

  const randomPoke = () => dataArr[Math.floor(Math.random() * dataArr.length)];

  function generateOpponents() {
    setCpus([randomPoke(), randomPoke(), randomPoke(), randomPoke()]);
  }

  function startRace() {
    if (ani) return;
    if (!playerPoke[0] || !cpus[0].name) {
      return notify("There must be 5 Pokémon to race — pick yours and generate opponents.", "warn");
    }

    const playerSpeed = playerPoke[0].speed;
    const racerSpeeds = [playerSpeed, ...cpus.map((cpu) => cpu.speed)];
    setAni(true);
    timerRef.current = setTimeout(() => {
      if (Math.max(...racerSpeeds) === playerSpeed) {
        notify("You won the race! 🏆", "success");
      } else {
        notify("You lost the race. Pick a speedier Pokémon!", "warn");
      }
      setPlayerPoke([]);
      setCpus([{}, {}, {}, {}]);
      setAni(false);
    }, RACE_DURATION_MS);
  }

  return (
    <div className="game-page">
      <section className="game-header">
        <h1 className="game-title">Race Track</h1>
        <p className="game-subtitle">
          Five Pokémon, one straightaway — the highest Speed stat takes it. Choose your racer,
          spin up four rivals, and go.
        </p>
      </section>

      <PickerControls
        dataArr={dataArr}
        favorites={favorites}
        user={user}
        disabled={ani}
        onPick={(poke) => setPlayerPoke([poke])}
        extraButtons={[
          { id: "opponents", label: "Generate Opponents", onClick: generateOpponents },
        ]}
        action={{ id: "race", label: ani ? "Racing…" : "Race!", onClick: startRace }}
      />

      {playerPoke[0]?.name && (
        <div className="picked-banner">
          Your racer: <strong>{formatName(playerPoke[0].name)}</strong>
          <TypeBadge type={playerPoke[0].type_one} size="sm" />
          <TypeBadge type={playerPoke[0].type_two} size="sm" />
        </div>
      )}

      <div id="track-background" className="track">
        <Lane label="You" poke={playerPoke[0]} ani={ani} isPlayer />
        {cpus.map((cpu, i) => (
          <Lane key={cpu.name || i} label={`CPU ${i + 1}`} poke={cpu} ani={ani} />
        ))}
      </div>
    </div>
  );
}

export default Race;
