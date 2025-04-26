// src/services/FightsApiService.ts
import { FightCard, Fight, Fighter } from "../types/Fight";

const API_URL = "http://localhost:8000/api";

export class FightsApiService {
  // Get all fights for an event
  static async getEventFights(eventId: string): Promise<FightCard> {
    try {
      const response = await fetch(`${API_URL}/fights/event/${eventId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fights for event ${eventId}`);
      }

      const fights = await response.json();

      // Transform the data to match our FightCard structure
      const mappedFights: Fight[] = fights.map((fight: any) => ({
        id: fight.fight_id,
        weightClass: fight.weight_class,
        fighter1: {
          id: fight.fighter1.fighter_id,
          name: fight.fighter1.name,
        },
        fighter2: {
          id: fight.fighter2.fighter_id,
          name: fight.fighter2.name,
        },
      }));

      // We'll separate main card and prelims based on the 'is_main_event' flag
      // For now, we'll put all fights in the main card
      return {
        title: "Main Card",
        fights: mappedFights,
      };
    } catch (error) {
      console.error("Error fetching fights:", error);
      throw error;
    }
  }

  // This function could later be updated to get prelim fights separately
  static async getEventPrelimFights(
    eventId: string
  ): Promise<FightCard | null> {
    // For now, we'll return null or implement later when the backend supports it
    return null;
  }
}
