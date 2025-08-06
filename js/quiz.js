// js/quiz.js
import { storage } from "./storage.js";
import { playSound, flashElement } from "./feedback.js";
import { user } from "./user.js";

// Dados do quiz (expande conforme quiser)
const quizData = [
  {
    q: "Qual item vai na lixeira de plástico?",
    options: ["Garrafa de vidro", "Embalagem PET", "Casca de banana"],
    answer: 1
  },
  {
    q: "O papel pode ser reciclado se estiver sujo?",
    options: ["Sim", "Não"],
    answer: 1
  },
  // coloca mais perguntas...
];

// Estado local
let current = storage.get("ecoRA_quiz_current") || 0;
let quizScore = storage.get("ecoRA_quiz_score") || 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const barEl = document.getElementById("bar");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("next-btn"); // caso tenha

function updateProgressBar() {
  const percent = ((current) / quizData.length) * 100;
  if (barEl) barEl.style.width = percent + "%";
  if (progressEl) progressEl.textContent = `Pergunta ${Math.min(current + 1, quizData.length)} de ${quizData.length}`;
}

function renderQuestion() {
  if (current >= quizData.length) return finish();

  updateProgressBar();

  const { q, options, answer } = quizData[current];
  if (questionEl) questionEl.textContent = q;
  optionsEl.innerHTML = "";

  options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "w-full py-2 px-3 bg-white rounded shadow text-left border flex items-center gap-2";
    btn.textContent = text;
    btn.dataset.index = i;
    btn.disabled = false;

    btn.addEventListener("click", () => {
      const isCorrect = i === answer;

      // feedback visual
      if (isCorrect) {
        quizScore += 10;
        playSound("correct");
        flashElement(btn, true);
        btn.classList.add("ring-2", "ring-green-400");
      } else {
        playSound("wrong");
        flashElement(btn, false);
        btn.classList.add("ring-2", "ring-red-400");
        // destaca a correta
        const correctBtn = optionsEl.querySelector(`button[data-index="${answer}"]`);
        if (correctBtn) correctBtn.classList.add("bg-green-100", "ring-2", "ring-green-500");
      }

      // desativa todas
      optionsEl.querySelectorAll("button").forEach(b => (b.disabled = true));

      // salva temporário
      storage.set("ecoRA_quiz_score", quizScore);
      current++;
      storage.set("ecoRA_quiz_current", current);

      // mostra próximo depois de delay
      setTimeout(() => {
        if (current < quizData.length) {
          renderQuestion();
        } else {
          finish();
        }
      }, 600);
    });

    optionsEl.appendChild(btn);
  });

  if (scoreEl) scoreEl.textContent = `Pontos: ${quizScore}`;
}

function finish() {
  // adiciona ao total do usuário (uma vez só)
  user.addScore(quizScore);
  // limpa o progresso do quiz pra poder refazer futuramente
  storage.remove("ecoRA_quiz_current");
  storage.remove("ecoRA_quiz_score");
  // salva o final se quiser (opcional)
  storage.set("ecoRA_final_score", quizScore);
  // redireciona
  window.location.href = "resultado.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestion();
});
