import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// localStorage keys
const KEY_USER  = "ecoRA_username";
const KEY_TOTAL = "ecoRA_total_score";
const KEY_LAST  = "ecoRA_lastGameScore";

async function ensureRow(username) {
  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (!data) {
    await supabase.from("users").insert([{ username, score: 0 }]);
  }
}

export const user = {
  // ----- identidade -----
  getName() {
    return localStorage.getItem(KEY_USER) || null;
  },

  async setName(name) {
    const n = (name || "").trim();
    if (!n) return;
    localStorage.setItem(KEY_USER, n);
    await ensureRow(n);
  },

  clearName() {
    localStorage.removeItem(KEY_USER);
  },

  // ----- cache local -----
  getScoreLocal() {
    return parseInt(localStorage.getItem(KEY_TOTAL) || "0", 10) || 0;
  },

  setScoreLocal(v) {
    localStorage.setItem(KEY_TOTAL, String(v));
  },

  setLastGameScore(points) {
    localStorage.setItem(KEY_LAST, String(points || 0));
  },

  getLastGameScore() {
    return parseInt(localStorage.getItem(KEY_LAST) || "0", 10) || 0;
  },

  // ----- Supabase -----
  async fetchTotalScore() {
    const name = this.getName();
    if (!name) return 0;

    const { data, error } = await supabase
      .from("users")
      .select("score")
      .eq("username", name)
      .maybeSingle();

    if (error) {
      console.warn("fetchTotalScore:", error);
      return this.getScoreLocal();
    }

    const score = data?.score ?? 0;
    this.setScoreLocal(score);
    return score;
  },

  async addScore(points) {
    const name = this.getName();
    if (!name) {
      const newLocal = this.getScoreLocal() + points;
      this.setScoreLocal(newLocal);
      return newLocal;
    }

    const { data } = await supabase
      .from("users")
      .select("score")
      .eq("username", name)
      .maybeSingle();

    const currentDb = data?.score ?? 0;
    const newDb = currentDb + points;

    await supabase
      .from("users")
      .upsert({ username: name, score: newDb }, { onConflict: "username" });

    this.setScoreLocal(newDb);
    return newDb;
  }
};
