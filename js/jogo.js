// js/jogo.js (ajustado)

import { user } from "./user.js";

const itemsContainer = document.getElementById("items");
const dropZones = document.querySelectorAll(".drop-zone");
const scoreDisplay = document.getElementById("score");

const correctSound = document.getElementById("sound-correct");
const wrongSound = document.getElementById("sound-wrong");

let score = 0;
let currentItems = [];

const lixos = [
  { name: "Garrafa PET", type: "plastico", emoji: "🧴" },
  { name: "Jornal velho", type: "papel", emoji: "📰" },
  { name: "Garrafa de vidro", type: "vidro", emoji: "🍾" },
  { name: "Casca de banana", type: "organico", emoji: "🍌" },
  { name: "Caixa de papelão", type: "papel", emoji: "📦" },
  { name: "Pote de iogurte", type: "plastico", emoji: "🥣" },
  { name: "Vidro quebrado", type: "vidro", emoji: "💔🍾" },
  { name: "Restos de comida", type: "organico", emoji: "🥗" }
];

function playSound(type) {
  const sound = type === "correct" ? correctSound : wrongSound;
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `Pontos: ${score}`;
}

function startRound() {
  itemsContainer.innerHTML = "";
  currentItems = [...lixos].sort(() => 0.5 - Math.random()).slice(0, 4);
  currentItems.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "draggable-item relative cursor-grab bg-white rounded shadow p-3 text-center w-28 select-none";
    div.dataset.type = item.type;
    div.dataset.name = item.name;
    div.dataset.index = idx;
    div.style.touchAction = "none";
    div.innerHTML = `<div class="text-xl">${item.emoji}</div><div class="text-xs mt-1">${item.name}</div>`;

    let offsetX = 0, offsetY = 0;
    let dragging = false;

    div.addEventListener("pointerdown", (e) => {
      dragging = true;
      div.setPointerCapture(e.pointerId);
      const rect = div.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      div.style.position = "fixed";
      div.style.zIndex = 1000;
      div.style.width = rect.width + "px";
      div.style.transition = "none";
      moveAt(e.pageX, e.pageY);
      div.classList.add("opacity-90");
    });

    function moveAt(pageX, pageY) {
      div.style.left = pageX - offsetX + "px";
      div.style.top = pageY - offsetY + "px";
    }

    div.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moveAt(e.pageX, e.pageY);
    });

    div.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      div.releasePointerCapture(e.pointerId);
      div.classList.remove("opacity-90");

      let dropped = false;
      dropZones.forEach(zone => {
        const zRect = zone.getBoundingClientRect();
        const dRect = div.getBoundingClientRect();
        const overlap = !(dRect.right < zRect.left ||
                          dRect.left > zRect.right ||
                          dRect.bottom < zRect.top ||
                          dRect.top > zRect.bottom);
        if (overlap) {
          dropped = true;
          const expected = zone.dataset.type.trim().toLowerCase();
          const received = div.dataset.type.trim().toLowerCase();

          if (expected === received) {
            playSound("correct");
            score += 10;  // SÓ soma aqui!
            zone.classList.add("bg-opacity-70");
            flash(zone, true);
            showPopup(div, "✅", true);
          } else {
            playSound("wrong");
            flash(zone, false);
            showPopup(div, "❌", false);
          }

          setTimeout(() => {
            div.remove();
            checkRoundEnd();
          }, 400);
        }
      });

      if (!dropped) {
        div.style.position = "";
        div.style.left = "";
        div.style.top = "";
        div.style.transition = "all .2s";
      }

      updateScoreDisplay();
    });

    itemsContainer.appendChild(div);
  });

  updateScoreDisplay();
}

function showTopMessage(msg) {
  // Remove mensagem antiga se existir
  const existing = document.getElementById("top-msg");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.id = "top-msg";
  div.textContent = msg;
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.background = "#16a34a"; // verde Tailwind emerald-600
  div.style.color = "white";
  div.style.padding = "1rem 2rem";
  div.style.borderRadius = "0 0 0.5rem 0.5rem";
  div.style.fontWeight = "bold";
  div.style.zIndex = "9999";
  div.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  div.style.opacity = "1";
  div.style.transition = "opacity 0.5s ease";

  document.body.appendChild(div);

  // Fade out e remove depois de 2 segundos
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 500);
  }, 2000);
}

let rodadaAtual = 0;
const maxRodadas = 3;

function checkRoundEnd() {
  if (itemsContainer.children.length === 0) {
    user.addScore(score);
    rodadaAtual++;

    // salva pontuação da rodada atual pra resultado
    localStorage.setItem("ecoRA_lastGameScore", score);

    if (rodadaAtual < maxRodadas) {
      showTopMessage("Nova rodada! Vamos reciclar mais!");
      setTimeout(() => {
        startRound();
      }, 600);
    } else {
      showTopMessage("Jogo finalizado! Confira seu resultado.");
      setTimeout(() => {
        window.location.href = "resultado.html";
      }, 1500);
    }
  }
}




function flash(el, correct) {
  const cls = correct ? "ring-4 ring-green-300" : "ring-4 ring-red-300";
  el.classList.add(...cls.split(" "));
  setTimeout(() => {
    el.classList.remove(...cls.split(" "));
  }, 400);
}

function showPopup(itemEl, symbol, success) {
  const pop = document.createElement("div");
  pop.textContent = symbol;
  pop.className = `absolute top-0 right-0 text-xl ${success ? "text-green-600" : "text-red-600"}`;
  itemEl.appendChild(pop);
  setTimeout(() => pop.remove(), 500);
}

document.addEventListener("DOMContentLoaded", () => {
  startRound();
});

localStorage.setItem("ecoRA_lastGameScore", score);
