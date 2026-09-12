import confetti from "canvas-confetti";

/**
 * Fires a localized fantasy ember & gold confetti burst from an origin point.
 */
export function fireQuestConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 45,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ["#ff8c42", "#ffd166", "#ff5f2e", "#4ade80", "#fbbf24"],
    ticks: 180,
    gravity: 1.1,
    scalar: 0.9,
    shapes: ["circle", "square"],
    disableForReducedMotion: true,
  });
}

/**
 * Fires an epic double-cannon golden shower for Level-Up and streak milestones.
 */
export function fireLevelUpConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#ffd166", "#ff8c42", "#ec4899", "#8b5cf6", "#4ade80"],
    disableForReducedMotion: true,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
