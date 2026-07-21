import React, { useEffect, useRef, useState } from "react";
import TypeBadge from "./TypeBadge";
import { formatName } from "../lib/types";
import { useToast } from "./Toast";

const LANES = 5;
const HURDLES_PER_LANE = 3;
const PROGRESS_DIVISOR = 500; // progress per second = speed / 500 (same pace as before)
const JUMP_MS = 650;
const STUMBLE_MS = 800;
const STUMBLE_FACTOR = 0.3; // crawl speed while stumbling
const CPU_JUMP_CHANCE = 0.7;
const CPU_JUMP_LEAD = 0.035; // how far ahead of a hurdle a CPU starts its jump
const RACE_CAP_MS = 20000;

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

// Random hurdle spots, kept apart and away from the start and finish.
// CPUs pre-roll whether they clear each one; the player has to earn it.
function genHurdles() {
  const xs = [];
  while (xs.length < HURDLES_PER_LANE) {
    const x = 0.15 + Math.random() * 0.65;
    if (xs.every((other) => Math.abs(other - x) > 0.12)) xs.push(x);
  }
  return xs.sort((a, b) => a - b).map((x) => ({ x, willClear: Math.random() < CPU_JUMP_CHANCE }));
}

function newRunner() {
  return {
    progress: 0,
    jumpUntil: 0,
    stumbleUntil: 0,
    nextHurdle: 0,
    cpuJumpedFor: -1,
    hits: Array(HURDLES_PER_LANE).fill(false),
    finishedAt: 0,
    place: 0,
  };
}

function Lane({ label, poke, hurdles, runner, racing, isPlayer }) {
  const now = performance.now();
  const jumping = runner && now < runner.jumpUntil;
  const stumbling = runner && !jumping && now < runner.stumbleUntil;
  const moving = racing && runner && !runner.finishedAt;

  return (
    <div className={`lane${isPlayer ? " lane-player" : ""}`}>
      <div className="lane-label">
        <span className="lane-tag">{label}</span>
        {poke ? (
          <span className="lane-poke">
            {formatName(poke.name)}
            <span className="lane-speed">
              Speed {poke.speed}
              {runner?.place ? <span className="lane-place">{ORDINALS[runner.place - 1]}</span> : null}
            </span>
          </span>
        ) : (
          <span className="lane-empty">Waiting…</span>
        )}
      </div>
      <div className="lane-strip">
        {hurdles?.map((h, j) => (
          <div
            key={j}
            className={`hurdle${runner?.hits[j] ? " hit" : ""}`}
            style={{ left: `calc(${h.x} * (100% - var(--runner-w)) + (var(--runner-w) / 2))` }}
          />
        ))}
        {poke && (
          <div
            className={`lane-runner${moving ? " running" : ""}${jumping ? " jumping" : ""}${
              stumbling ? " stumbling" : ""
            }`}
            style={{ left: `calc(${runner ? runner.progress : 0} * (100% - var(--runner-w)))` }}
          >
            <div className="runner-anim">
              <img id="poke-track-display" src={poke.image} alt={poke.name} />
            </div>
          </div>
        )}
        <div className="finish-line" />
      </div>
    </div>
  );
}

function Race({ dataArr }) {
  const [lineup, setLineup] = useState([]); // [{poke, hurdles}], index 0 is the player
  const [racing, setRacing] = useState(false);
  const [, setTick] = useState(0); // re-render driver while the loop runs
  const notify = useToast();

  const runnersRef = useRef([]);
  const rafRef = useRef(0);
  const announcedRef = useRef(false);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const randomPoke = () => dataArr[Math.floor(Math.random() * dataArr.length)];

  function generateLineup() {
    if (racing) return;
    const next = Array.from({ length: LANES }, () => ({ poke: randomPoke(), hurdles: genHurdles() }));
    setLineup(next);
    runnersRef.current = next.map(newRunner);
    setTick((n) => n + 1);
  }

  function jump() {
    if (!racing) return;
    const runner = runnersRef.current[0];
    const now = performance.now();
    if (runner && !runner.finishedAt && now >= runner.jumpUntil) {
      runner.jumpUntil = now + JUMP_MS;
    }
  }

  // Space bar jumps while a race is on.
  useEffect(() => {
    if (!racing) return;
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [racing]);

  function announcePlace(place) {
    if (announcedRef.current) return;
    announcedRef.current = true;
    if (place === 1) {
      notify("You won the race! 🏆", "success");
    } else {
      notify(`You finished ${ORDINALS[place - 1]} of ${LANES}. Run it back!`, "warn");
    }
  }

  function startRace() {
    if (racing) return;
    if (lineup.length === 0) {
      return notify("Draw a lineup first — one click on New Lineup fills every lane.", "warn");
    }

    runnersRef.current = lineup.map(newRunner);
    announcedRef.current = false;
    setRacing(true);

    const startT = performance.now();
    let lastT = startT;
    let finishCount = 0;

    const loop = (t) => {
      const dt = Math.min(t - lastT, 50);
      lastT = t;
      let allDone = true;

      runnersRef.current.forEach((runner, i) => {
        if (runner.finishedAt) return;
        allDone = false;
        const { poke, hurdles } = lineup[i];

        const factor = t < runner.stumbleUntil ? STUMBLE_FACTOR : 1;
        runner.progress += (poke.speed / PROGRESS_DIVISOR) * factor * (dt / 1000);

        if (runner.nextHurdle < hurdles.length) {
          const hurdle = hurdles[runner.nextHurdle];
          // CPUs that are going to clear a hurdle jump just before it
          if (
            i > 0 &&
            hurdle.willClear &&
            runner.cpuJumpedFor < runner.nextHurdle &&
            runner.progress >= hurdle.x - CPU_JUMP_LEAD
          ) {
            runner.cpuJumpedFor = runner.nextHurdle;
            runner.jumpUntil = t + JUMP_MS;
          }
          if (runner.progress >= hurdle.x) {
            if (t >= runner.jumpUntil) {
              runner.stumbleUntil = t + STUMBLE_MS;
              runner.hits[runner.nextHurdle] = true;
            }
            runner.nextHurdle += 1;
          }
        }

        if (runner.progress >= 1) {
          runner.progress = 1;
          runner.finishedAt = t;
          runner.place = ++finishCount;
          if (i === 0) announcePlace(runner.place);
        }
      });

      setTick((n) => n + 1);

      if (!allDone && t - startT < RACE_CAP_MS) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // time cap: rank whoever is still on the track by distance covered
        const unfinished = runnersRef.current
          .map((runner, i) => ({ runner, i }))
          .filter(({ runner }) => !runner.finishedAt)
          .sort((a, b) => b.runner.progress - a.runner.progress);
        unfinished.forEach(({ runner, i }) => {
          runner.place = ++finishCount;
          if (i === 0) announcePlace(runner.place);
        });
        setRacing(false);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  const playerPoke = lineup[0]?.poke;

  return (
    <div className="game-page">
      <section className="game-header">
        <h1 className="game-title">Race Track</h1>
        <p className="game-subtitle">
          One click draws you and four rivals. Hurdles are scattered down every lane — clear yours
          with the Jump button (or the space bar) or stumble and lose ground. First across the line
          wins.
        </p>
      </section>

      <div className="game-controls">
        <button id="opponents" className="btn btn-dark" onClick={generateLineup} disabled={racing}>
          New Lineup
        </button>
        <button id="race" className="btn btn-primary" onClick={startRace} disabled={racing}>
          {racing ? "Racing…" : "Race!"}
        </button>
        <button id="jump" className="btn btn-jump" onClick={jump} disabled={!racing}>
          ⬆ Jump <kbd>Space</kbd>
        </button>
      </div>

      {playerPoke && (
        <div className="picked-banner">
          Your racer: <strong>{formatName(playerPoke.name)}</strong>
          <TypeBadge type={playerPoke.type_one} size="sm" />
          <TypeBadge type={playerPoke.type_two} size="sm" />
        </div>
      )}

      <div id="track-background" className="track">
        {Array.from({ length: LANES }, (_, i) => (
          <Lane
            key={lineup[i] ? `${lineup[i].poke.name}-${i}` : i}
            label={i === 0 ? "You" : `CPU ${i}`}
            poke={lineup[i]?.poke}
            hurdles={lineup[i]?.hurdles}
            runner={runnersRef.current[i]}
            racing={racing}
            isPlayer={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

export default Race;
