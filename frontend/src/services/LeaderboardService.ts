const API_URL = "http://localhost:8000/api";

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_picks: number;
  correct_picks: number;
  accuracy_percentage: number;
}

export interface LeaderboardResponse {
  event_id: number;
  leaderboard: LeaderboardEntry[];
}

export class LeaderboardService {
  static async getEventLeaderboard(
    eventId: string
  ): Promise<LeaderboardResponse> {
    try {
      const response = await fetch(
        `${API_URL}/results/leaderboard/${eventId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard for event ${eventId}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  }
}
