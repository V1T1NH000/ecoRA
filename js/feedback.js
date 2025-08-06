const sounds = {
  correct: new Audio("/assets/audio/correct.mp3"),
  wrong: new Audio("/assets/audio/wrong.mp3"),
  levelup: new Audio("/assets/audio/levelup.mp3")
};

export function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {});
  }
}

export function flashElement(el, success = true) {
  el.classList.add(success ? "border-green-500" : "border-red-500");
  setTimeout(() => el.classList.remove("border-green-500", "border-red-500"), 400);
}
