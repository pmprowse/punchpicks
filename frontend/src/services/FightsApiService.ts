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
      const mainCardFights: Fight[] = [];
      const prelimFights: Fight[] = [];

      // Process all fights
      fights.forEach((fight: any) => {
        const mappedFight: Fight = {
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
        };

        // Add to appropriate card based on if it's a main event or order
        if (fight.is_main_event || fight.order <= 5) {
          mainCardFights.push(mappedFight);
        } else {
          prelimFights.push(mappedFight);
        }
      });

      // Sort fights by order
      mainCardFights.sort((a: Fight, b: Fight) => {
        const orderA =
          fights.find((f: any) => f.fight_id === a.id)?.order || 999;
        const orderB =
          fights.find((f: any) => f.fight_id === b.id)?.order || 999;
        return orderA - orderB;
      });

      // Create and return the main card
      return {
        title: "Main Card",
        fights:
          mainCardFights.length > 0
            ? mainCardFights
            : fights.map((fight: any) => ({
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
              })),
      };
    } catch (error) {
      console.error("Error fetching fights:", error);
      throw error;
    }
  }

  // Get preliminary fights for an event
  static async getEventPrelimFights(
    eventId: string
  ): Promise<FightCard | null> {
    try {
      const response = await fetch(`${API_URL}/fights/event/${eventId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fights for event ${eventId}`);
      }

      const fights = await response.json();

      // Filter for prelim fights (usually fights with higher order numbers)
      const prelimFights = fights
        .filter((fight: any) => !fight.is_main_event && fight.order > 5)
        .map((fight: any) => ({
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

      // Sort fights by order
      prelimFights.sort((a: Fight, b: Fight) => {
        const orderA =
          fights.find((f: any) => f.fight_id === a.id)?.order || 999;
        const orderB =
          fights.find((f: any) => f.fight_id === b.id)?.order || 999;
        return orderA - orderB;
      });

      // Only return a prelim card if there are actually prelim fights
      if (prelimFights.length > 0) {
        return {
          title: "Preliminary Card",
          fights: prelimFights,
        };
      }

      // If no prelim fights, return null
      return null;
    } catch (error) {
      console.error("Error fetching prelim fights:", error);
      return null;
    }
  }

  // Get a specific fight by ID
  static async getFight(fightId: string): Promise<Fight | null> {
    try {
      const response = await fetch(`${API_URL}/fights/${fightId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fight ${fightId}`);
      }

      const fight = await response.json();

      return {
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
      };
    } catch (error) {
      console.error("Error fetching fight:", error);
      return null;
    }
  }
}
