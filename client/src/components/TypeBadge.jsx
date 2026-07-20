import React from "react";
import { typeColor, formatName } from "../lib/types";

function TypeBadge({ type, size }) {
  if (!type) return null;
  return (
    <span
      className={`type-badge${size === "sm" ? " type-badge-sm" : ""}`}
      style={{ backgroundColor: typeColor(type) }}
    >
      {formatName(type)}
    </span>
  );
}

export default TypeBadge;
