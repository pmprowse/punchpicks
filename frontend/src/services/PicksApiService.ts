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
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If no picks found, return null
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch picks for event ${eventId}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Transform backend data structure to match our frontend types
      const picksObj: Record<string, Pick> = {};

      // Handle different response formats
      if (Array.isArray(data.picks)) {
        // If picks is an array of pick objects
        data.picks.forEach((pick: any) => {
          picksObj[pick.fight_id] = {
            fighterId: pick.fighter_id,
            method: pick.method,
          };
        });
      } else if (typeof data.picks === "object") {
        // If picks is already an object
        for (const fightId in data.picks) {
          const pick = data.picks[fightId];
          picksObj[fightId] = {
            fighterId: pick.fighter_id,
            method: pick.method,
          };
        }
      }

      return {
        eventId: data.event_id.toString(),
        timestamp: data.submitted_at,
        picks: picksObj,
        isSubmitted: true,
      };
    } catch (error) {
      console.error("Error fetching user picks:", error);
      // Fall back to local storage if API fails
      if (localStorage) {
        const username = "current_user"; // Use a generic key or get from auth context
        return this.getPicks(username, eventId);
      }
      return null;
    }
  }

  // Submit user's picks for an event
  static async submitPicks(
    eventId: string,
    picks: Record<string, Pick>
  ): Promise<UserEventPicks> {
    try {
      // Convert picks object to array format expected by backend
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
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Failed to submit picks: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Also save to local storage as backup
      const username = "current_user"; // Use a generic key or get from auth context
      this.savePicks(username, eventId, picks);

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

  // Get picks from local storage
  static getPicks(username: string, eventId: string): UserEventPicks | null {
    const key = this.getStorageKey(username, eventId);
    const picksJson = localStorage.getItem(key);
    return picksJson ? JSON.parse(picksJson) : null;
  }

  // Save picks to local storage as backup
  static savePicks(
    username: string,
    eventId: string,
    picks: Record<string, Pick>
  ): void {
    const pickData: UserEventPicks = {
      eventId,
      timestamp: new Date().toISOString(),
      picks,
      isSubmitted: true,
    };

    localStorage.setItem(
      this.getStorageKey(username, eventId),
      JSON.stringify(pickData)
    );
  }

  // Check if user has submitted picks for an event
  static hasSubmittedPicks(username: string, eventId: string): boolean {
    return this.getPicks(username, eventId) !== null;
  }

  // Remove picks for a specific user and event
  static removePicks(username: string, eventId: string): void {
    const key = this.getStorageKey(username, eventId);
    localStorage.removeItem(key);
  }

  // Generate a unique key for storing picks
  private static getStorageKey(username: string, eventId: string): string {
    return `userPicks_${username}_${eventId}`;
  }
}
