// src/services/PicksApiService.ts
import { UserEventPicks, Pick } from "../types/Picks";

const API_URL = "http://localhost:8000/api";

export class PicksApiService {
  // Get user picks for an event
  static async getUserPicks(eventId: string): Promise<UserEventPicks | null> {
    try {
      const response = await fetch(`${API_URL}/picks/event/${eventId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // If 404, user has no picks yet
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch user picks");
      }

      const data = await response.json();

      // Transform the data to match our UserEventPicks structure
      return {
        eventId: data.event_id.toString(),
        timestamp: data.submitted_at,
        picks: data.picks.reduce((acc: Record<string, Pick>, pick: any) => {
          acc[pick.fight_id] = {
            fighterId: pick.fighter_id,
            method: pick.method,
          };
          return acc;
        }, {}),
        isSubmitted: true,
      };
    } catch (error) {
      console.error("Error fetching user picks:", error);
      // Return null if there's an error, indicating no picks
      return null;
    }
  }

  // Submit user's picks for an event
  static async submitPicks(
    eventId: string,
    picks: Record<string, Pick>
  ): Promise<UserEventPicks> {
    try {
      // Convert our picks format to match backend expectations
      const picksData = Object.entries(picks).map(([fightId, pick]) => ({
        fight_id: fightId,
        fighter_id: pick.fighterId,
        method: pick.method,
      }));

      const response = await fetch(`${API_URL}/picks/event/${eventId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(picksData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit picks");
      }

      const data = await response.json();

      // Return the updated picks in our format
      return {
        eventId: data.event_id.toString(),
        timestamp: data.submitted_at,
        picks,
        isSubmitted: true,
      };
    } catch (error) {
      console.error("Error submitting picks:", error);
      throw error;
    }
  }
}
