import React from "react";
import "./DripFluid.css";

const DripFluid = () => {
  return (
    <div className="drip-container" aria-hidden="true">
      <div className="drip-fluid" />
      <div className="drop drop-1" />
      <div className="drop drop-2" />
      <div className="drop drop-3" />
      <div className="drop drop-4" />
    </div>
  );
};

export default DripFluid;