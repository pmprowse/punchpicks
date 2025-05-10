import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import {
  LeaderboardService,
  LeaderboardEntry,
} from "../services/LeaderboardService";

const LeaderboardPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!eventId) {
        setError("No event selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await LeaderboardService.getEventLeaderboard(eventId);
        setLeaderboard(data.leaderboard);
        setError(null);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          to="/events"
          className="inline-block mb-6 text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Events
        </Link>

        <Leaderboard eventId={eventId!} leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
