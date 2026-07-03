"use client";

import { supabaseClient } from "@/libs/supabaseClient";

const PAGE_SIZE = 20; // songs per page

export async function getRandomSongs(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabaseClient
    .from("songs")
    .select("*, artists(*)")
    .order("created_at", { ascending: false }) // or "id"
    .range(from, to);

  if (error) {
    console.error("Error loading random songs", error);
    return [];
  }

  return data ?? [];
}
