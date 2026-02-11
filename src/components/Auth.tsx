import React, { useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";

export function Auth() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950 to-black">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30l-30 30h60zM30 30L0 0h60z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Floating emojis */}
        {['👒', '⚔️', '🔥', '⛈️', '💀', '🦵'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-4xl md:text-6xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #ef4444, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(251, 191, 36, 0.3)',
            }}
          >
            PIRATE CLASH
          </h1>
          <p className="text-white/60 text-sm md:text-base">One Piece Fighting Arena</p>
        </div>

        {/* Auth Card */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
            {flow === "signIn" ? "Welcome Back, Pirate!" : "Join the Crew!"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="pirate@grandline.com"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white
                  placeholder-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20
                  transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white
                  placeholder-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20
                  transition-all duration-300"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400
                hover:from-yellow-300 hover:via-orange-300 hover:to-red-300 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? '...' : flow === "signIn" ? "Set Sail!" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-yellow-400/70 hover:text-yellow-400 text-sm transition-colors"
            >
              {flow === "signIn" ? "New pirate? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-white/30 bg-black/60">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-bold text-white/70 border border-white/20
              hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏴‍☠️ Continue as Guest
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          Battle other pirates and climb the leaderboard!
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
