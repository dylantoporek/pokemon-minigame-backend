import React, { useState } from "react";
import PickerControls from "./PickerControls";
import TypeBadge from "./TypeBadge";
import { formatName } from "../lib/types";
import { useToast } from "./Toast";

const WINNING_SCORE = 5;

// Each type loses to the types listed (same chart as the original app).
const TYPE_CHART = {
  normal: ["fighting"],
  fire: ["water", "rock", "ground"],
  water: ["electric", "grass"],
  electric: ["ground"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "ice", "grass"],
  flying: ["electric", "ice", "rock"],
  psychic: ["dark", "bug", "ghost"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["dark"],
  dragon: ["fairy", "ice"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
};

function Fighter({ poke, side }) {
  if (!poke?.name) {
    return (
      <div className={`fighter fighter-${side} fighter-empty`}>
        <div className="fighter-slot">?</div>
        <span className="fighter-name">{side === "player" ? "Pick your Pokémon" : "Generate a CPU"}</span>
      </div>
    );
  }
  return (
    <div className={`fighter fighter-${side}`}>
      <div className="fighter-stage">
        <img id="poke-battle-display" src={poke.image} alt={poke.name} />
        <div className="fighter-shadow" />
      </div>
      <span className="fighter-name">{formatName(poke.name)}</span>
      <span className="fighter-types">
        <TypeBadge type={poke.type_one} size="sm" />
        <TypeBadge type={poke.type_two} size="sm" />
      </span>
    </div>
  );
}

function Battle({ dataArr, favorites, user }) {
  const [playerPoke, setPlayerPoke] = useState([]);
  const [cpu, setCpu] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [log, setLog] = useState([]);
  const notify = useToast();

  const randomPoke = () => dataArr[Math.floor(Math.random() * dataArr.length)];

  function report(message) {
    setLog((prev) => [message, ...prev].slice(0, 6));
  }

  function resetMatch(message, tone) {
    notify(message, tone);
    setPlayerPoke([]);
    setCpu([]);
    setPlayerScore(0);
    setCpuScore(0);
    setLog([]);
  }

  function scorePlayer() {
    const next = playerScore + 1;
    setPlayerScore(next);
    setCpu([]);
    if (next >= WINNING_SCORE) resetMatch("Congratulations, you won the match! Play again?", "success");
  }

  function scoreCpu() {
    const next = cpuScore + 1;
    setCpuScore(next);
    setPlayerPoke([]);
    if (next >= WINNING_SCORE) resetMatch("You lost the match. Try again!", "warn");
  }

  function calculateWinner() {
    if (!playerPoke[0] || !cpu[0]) {
      return notify("There must be two Pokémon to battle.", "warn");
    }

    const playerType = playerPoke[0].type_one;
    const cpuType = cpu[0].type_one;
    const playerBeatenBy = TYPE_CHART[playerType];
    const cpuBeatenBy = TYPE_CHART[cpuType];

    const playerWins = cpuBeatenBy.includes(playerType);
    const cpuWins = playerBeatenBy.includes(cpuType);

    if (playerWins) {
      report(`Round to you — ${playerType} beats ${cpuType}.`);
      scorePlayer();
    }
    if (cpuWins) {
      report(`Round to the CPU — ${cpuType} beats ${playerType}.`);
      scoreCpu();
    }
    if (playerWins === cpuWins) {
      report("No winner by type. It comes down to strength…");
      winnerByAttack();
    }
  }

  function winnerByAttack() {
    const playerName = formatName(playerPoke[0].name);
    const cpuName = formatName(cpu[0].name);
    const playerAtkAvg = (playerPoke[0].attack + playerPoke[0].special_attack) / 2;
    const cpuAtkAvg = (cpu[0].attack + cpu[0].special_attack) / 2;

    if (playerAtkAvg > cpuAtkAvg) {
      report(`Round to you — ${playerName} is stronger than ${cpuName}.`);
      scorePlayer();
    }
    if (cpuAtkAvg > playerAtkAvg) {
      report(`Round to the CPU — ${cpuName} is stronger than ${playerName}.`);
      scoreCpu();
    }
    if (cpuAtkAvg === playerAtkAvg) {
      report("What are the odds? Both Pokémon were knocked out!");
      setPlayerPoke([]);
      setCpu([]);
    }
  }

  return (
    <div className="game-page">
      <section className="game-header">
        <h1 className="game-title">Battle Arena</h1>
        <p className="game-subtitle">
          Type beats type; ties go to raw strength. First to {WINNING_SCORE} rounds wins the match.
        </p>
      </section>

      <div className="scoreboard">
        <div className={`score-side${playerScore > cpuScore ? " leading" : ""}`}>
          <span className="score-label">You</span>
          <span id="player-score" className="score-value">{playerScore}</span>
        </div>
        <span className="score-divider">VS</span>
        <div className={`score-side${cpuScore > playerScore ? " leading" : ""}`}>
          <span className="score-label">CPU</span>
          <span id="cpu-score" className="score-value">{cpuScore}</span>
        </div>
      </div>

      <PickerControls
        dataArr={dataArr}
        favorites={favorites}
        user={user}
        onPick={(poke) => setPlayerPoke([poke])}
        extraButtons={[{ id: "random-cpu", label: "Generate CPU", onClick: () => setCpu([randomPoke()]) }]}
        action={{ id: "battle", label: "Battle!", onClick: calculateWinner }}
      />

      <div id="arena-container" className="arena">
        <Fighter poke={playerPoke[0]} side="player" />
        <div className="arena-vs">VS</div>
        <Fighter poke={cpu[0]} side="cpu" />
      </div>

      {log.length > 0 && (
        <div className="battle-log">
          {log.map((entry, i) => (
            <p key={`${i}-${entry}`} className={i === 0 ? "log-latest" : ""}>
              {entry}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Battle;
