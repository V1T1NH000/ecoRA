// js/user.js
const KEY_USER = "ecoRA_username";
const KEY_SCORE = "ecoRA_total_score";

export const user = {
  getName() {
    return localStorage.getItem(KEY_USER) || null;
  },
  setName(name) {
    localStorage.setItem(KEY_USER, name.trim());
  },
  clearName() {
    localStorage.removeItem(KEY_USER);
  },
  getScore() {
    const v = localStorage.getItem(KEY_SCORE);
    return v ? parseInt(v, 10) : 0;
  },
  addScore(points) {
    const current = user.getScore();
    localStorage.setItem(KEY_SCORE, current + points);
  },
  resetScore() {
    localStorage.setItem(KEY_SCORE, 0);
  }
};
