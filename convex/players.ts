import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreatePlayer = mutation({
  args: { username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing;

    const id = await ctx.db.insert("players", {
      userId,
      username: args.username || `Pirate${Math.floor(Math.random() * 9999)}`,
      totalWins: 0,
      totalLosses: 0,
      currentStreak: 0,
      bestStreak: 0,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const getCurrentPlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    await ctx.db.patch(player._id, { username: args.username });

    // Update leaderboard entry if exists
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_streak")
      .filter((q) => q.eq(q.field("playerId"), player._id))
      .first();

    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, { username: args.username });
    }
  },
});

export const recordMatchResult = mutation({
  args: {
    playerCharacter: v.string(),
    opponentCharacter: v.string(),
    playerWon: v.boolean(),
    roundsWon: v.number(),
    roundsLost: v.number(),
    perfectRounds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    // Record the match
    await ctx.db.insert("matches", {
      playerId: player._id,
      playerCharacter: args.playerCharacter,
      opponentCharacter: args.opponentCharacter,
      playerWon: args.playerWon,
      roundsWon: args.roundsWon,
      roundsLost: args.roundsLost,
      perfectRounds: args.perfectRounds,
      playedAt: Date.now(),
    });

    // Update player stats
    const newStreak = args.playerWon ? player.currentStreak + 1 : 0;
    const newBestStreak = Math.max(player.bestStreak, newStreak);

    await ctx.db.patch(player._id, {
      totalWins: player.totalWins + (args.playerWon ? 1 : 0),
      totalLosses: player.totalLosses + (args.playerWon ? 0 : 1),
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      favoriteCharacter: args.playerCharacter,
    });

    // Update leaderboard
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_streak")
      .filter((q) => q.eq(q.field("playerId"), player._id))
      .first();

    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, {
        bestStreak: newBestStreak,
        totalWins: player.totalWins + (args.playerWon ? 1 : 0),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("leaderboard", {
        playerId: player._id,
        username: player.username,
        bestStreak: newBestStreak,
        totalWins: player.totalWins + (args.playerWon ? 1 : 0),
        updatedAt: Date.now(),
      });
    }

    return { newStreak, newBestStreak };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_streak")
      .order("desc")
      .take(10);

    return entries;
  },
});

export const getRecentMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) return [];

    return await ctx.db
      .query("matches")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .order("desc")
      .take(10);
  },
});
