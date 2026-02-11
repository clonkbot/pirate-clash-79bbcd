import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Player profiles with stats
  players: defineTable({
    userId: v.id("users"),
    username: v.string(),
    totalWins: v.number(),
    totalLosses: v.number(),
    currentStreak: v.number(),
    bestStreak: v.number(),
    favoriteCharacter: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_best_streak", ["bestStreak"]),

  // Match history
  matches: defineTable({
    playerId: v.id("players"),
    playerCharacter: v.string(),
    opponentCharacter: v.string(),
    playerWon: v.boolean(),
    roundsWon: v.number(),
    roundsLost: v.number(),
    perfectRounds: v.number(),
    playedAt: v.number(),
  }).index("by_player", ["playerId"])
    .index("by_played_at", ["playedAt"]),

  // Leaderboard snapshots
  leaderboard: defineTable({
    playerId: v.id("players"),
    username: v.string(),
    bestStreak: v.number(),
    totalWins: v.number(),
    updatedAt: v.number(),
  }).index("by_streak", ["bestStreak"]),
});
