import React from "react";

// Inline pokéball mark used for the logo, buttons, and the loading spinner.
function Pokeball({ size = 24, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#2a2a2a" strokeWidth="8" />
      <path d="M4 50a46 46 0 0 1 92 0" fill="#d9342b" />
      <rect x="4" y="46" width="92" height="8" fill="#2a2a2a" />
      <circle cx="50" cy="50" r="16" fill="#2a2a2a" />
      <circle cx="50" cy="50" r="10" fill="#fff" stroke="#2a2a2a" strokeWidth="3" />
    </svg>
  );
}

export default Pokeball;
