import React, { useEffect, useRef, useState } from "react";
import TypeBadge from "./TypeBadge";
import Pokeball from "./Pokeball";
import { formatName } from "../lib/types";
import { useToast } from "./Toast";

const TEAM_SIZE = 6;

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

// Winner of one round, decided exactly like the original game:
// type matchup first, average attack strength on a type tie.
function decideRound(player, cpu) {
  const playerType = player.type_one;
  const cpuType = cpu.type_one;
  const playerWins = TYPE_CHART[cpuType].includes(playerType);
  const cpuWins = TYPE_CHART[playerType].includes(cpuType);

  if (playerWins && !cpuWins) {
    return { winner: "player", reason: `${playerType} beats ${cpuType}` };
  }
  if (cpuWins && !playerWins) {
    return { winner: "cpu", reason: `${cpuType} beats ${playerType}` };
  }

  const playerAtk = (player.attack + player.special_attack) / 2;
  const cpuAtk = (cpu.attack + cpu.special_attack) / 2;
  if (playerAtk > cpuAtk) {
    return { winner: "player", reason: `${formatName(player.name)} is stronger` };
  }
  if (cpuAtk > playerAtk) {
    return { winner: "cpu", reason: `${formatName(cpu.name)} is stronger` };
  }
  return { winner: "both", reason: "both Pokémon were knocked out" };
}

function TeamBalls({ team, faintedCount, activeIndex }) {
  return (
    <div className="team-balls">
      {team.map((_, i) => (
        <span
          key={i}
          className={`team-ball${i < faintedCount ? " fainted" : ""}${
            i === activeIndex ? " active" : ""
          }`}
        >
          <Pokeball size={20} />
        </span>
      ))}
    </div>
  );
}

function Fighter({ poke, side, anim }) {
  if (!poke) {
    return (
      <div className={`fighter fighter-${side} fighter-empty`}>
        <div className="fighter-slot">?</div>
        <span className="fighter-name">Ready when you are</span>
      </div>
    );
  }
  return (
    <div className={`fighter fighter-${side}`}>
      <div className="fighter-stage">
        <div className={`sprite-box${anim ? ` sprite-${anim}-${side}` : " sprite-idle"}`}>
          <img id="poke-battle-display" src={poke.image} alt={poke.name} />
        </div>
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

function Battle({ dataArr }) {
  const [playerTeam, setPlayerTeam] = useState([]);
  const [cpuTeam, setCpuTeam] = useState([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [cpuIdx, setCpuIdx] = useState(0);
  const [anim, setAnim] = useState({ player: "", cpu: "" });
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const notify = useToast();
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomPoke = () => dataArr[Math.floor(Math.random() * dataArr.length)];

  function report(message) {
    setLog((prev) => [message, ...prev].slice(0, 8));
  }

  // One click: draw two hidden teams of six, then the rounds play out on
  // their own — the loser of each round sends out their next Pokémon.
  async function startBattle() {
    if (running) return;
    const pTeam = Array.from({ length: TEAM_SIZE }, randomPoke);
    const cTeam = Array.from({ length: TEAM_SIZE }, randomPoke);

    setPlayerTeam(pTeam);
    setCpuTeam(cTeam);
    setPlayerIdx(0);
    setCpuIdx(0);
    setLog([]);
    setRunning(true);
    setAnim({ player: "enter", cpu: "enter" });
    report("Both trainers send out their first Pokémon!");
    await sleep(1300);

    let pi = 0;
    let ci = 0;
    let round = 1;
    while (pi < TEAM_SIZE && ci < TEAM_SIZE) {
      if (cancelledRef.current) return;
      const result = decideRound(pTeam[pi], cTeam[ci]);

      setAnim({
        player: result.winner !== "cpu" ? "attack" : "",
        cpu: result.winner !== "player" ? "attack" : "",
      });
      await sleep(650);
      if (cancelledRef.current) return;

      setAnim({
        player: result.winner === "cpu" || result.winner === "both" ? "faint" : "",
        cpu: result.winner === "player" || result.winner === "both" ? "faint" : "",
      });
      if (result.winner === "player") {
        report(`Round ${round}: ${formatName(cTeam[ci].name)} fainted — ${result.reason}.`);
        ci += 1;
      } else if (result.winner === "cpu") {
        report(`Round ${round}: ${formatName(pTeam[pi].name)} fainted — ${result.reason}.`);
        pi += 1;
      } else {
        report(`Round ${round}: ${result.reason}!`);
        pi += 1;
        ci += 1;
      }
      round += 1;
      await sleep(950);
      if (cancelledRef.current) return;

      setPlayerIdx(pi);
      setCpuIdx(ci);
      if (pi < TEAM_SIZE && ci < TEAM_SIZE) {
        setAnim({
          player: result.winner !== "player" ? "enter" : "",
          cpu: result.winner !== "cpu" ? "enter" : "",
        });
        await sleep(900);
        if (cancelledRef.current) return;
      }
    }

    if (pi < TEAM_SIZE) {
      report(`The CPU is out of Pokémon — you win ${TEAM_SIZE - pi} to 0!`);
      notify("Victory! The CPU's whole team fainted. 🏆", "success");
    } else if (ci < TEAM_SIZE) {
      report(`Your whole team fainted — the CPU wins with ${TEAM_SIZE - ci} left.`);
      notify("Defeat — your whole team fainted. Run it back!", "warn");
    } else {
      report("Unbelievable — both teams wiped each other out. It's a draw!");
      notify("A draw! Both teams were knocked out.", "info");
    }
    setAnim({ player: "", cpu: "" });
    setRunning(false);
  }

  const playerActive = playerIdx < TEAM_SIZE ? playerTeam[playerIdx] : null;
  const cpuActive = cpuIdx < TEAM_SIZE ? cpuTeam[cpuIdx] : null;

  return (
    <div className="game-page">
      <section className="game-header">
        <h1 className="game-title">Battle Arena</h1>
        <p className="game-subtitle">
          One click drafts two hidden teams of six, then the battle plays itself out — type beats
          type, ties go to raw strength, losers swap in their next Pokémon. Last team standing
          wins.
        </p>
      </section>

      <div className="scoreboard">
        <div className="score-side">
          <span className="score-label">You</span>
          {playerTeam.length > 0 ? (
            <TeamBalls team={playerTeam} faintedCount={playerIdx} activeIndex={playerIdx} />
          ) : (
            <span className="score-value">—</span>
          )}
        </div>
        <span className="score-divider">VS</span>
        <div className="score-side">
          <span className="score-label">CPU</span>
          {cpuTeam.length > 0 ? (
            <TeamBalls team={cpuTeam} faintedCount={cpuIdx} activeIndex={cpuIdx} />
          ) : (
            <span className="score-value">—</span>
          )}
        </div>
      </div>

      <div className="game-controls">
        <button id="battle" className="btn btn-primary" onClick={startBattle} disabled={running}>
          {running ? "Battling…" : playerTeam.length ? "New Battle!" : "Start Battle!"}
        </button>
      </div>

      <div id="arena-container" className="arena">
        <Fighter poke={playerActive} side="player" anim={anim.player} />
        <div className="arena-vs">VS</div>
        <Fighter poke={cpuActive} side="cpu" anim={anim.cpu} />
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
