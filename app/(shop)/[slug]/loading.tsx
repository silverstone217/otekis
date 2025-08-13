import React from "react";

const LoadingShoPage = () => {
  return (
    <div className="w-full min-h-[70dvh] flex items-center justify-center flex-col gap-4">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <p className="opacity-70 text-xl">Chargement de la boutique...</p>
      {/* css anim load */}
      <div className="flipping-cards">
        <div className="card">l</div>
        <div className="card">o</div>
        <div className="card">a</div>
        <div className="card">d</div>
        <div className="card">i</div>
        <div className="card">n</div>
        <div className="card">g</div>
      </div>
    </div>
  );
};

export default LoadingShoPage;
