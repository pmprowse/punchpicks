import React from "react";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_picks: number;
  correct_picks: number;
  accuracy_percentage: number;
}

interface LeaderboardProps {
  eventId: string;
  leaderboard: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ eventId, leaderboard }) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"; // Gold
      case 2:
        return "text-gray-400"; // Silver
      case 3:
        return "text-amber-700"; // Bronze
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Event Leaderboard</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-center">Total Picks</th>
              <th className="px-6 py-3 text-center">Correct Picks</th>
              <th className="px-6 py-3 text-center">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.user_id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-6 py-4">
                  <span className={`font-bold ${getRankColor(entry.rank)}`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{entry.username}</td>
                <td className="px-6 py-4 text-center">{entry.total_picks}</td>
                <td className="px-6 py-4 text-center">{entry.correct_picks}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-indigo-600">
                    {entry.accuracy_percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
