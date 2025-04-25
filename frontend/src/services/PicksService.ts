import { UserEventPicks, Pick } from "../types/Picks";

export class PicksService {
  // Generate a unique key for storing picks
  private static getStorageKey(username: string, eventId: string): string {
    return `userPicks_${username}_${eventId}`;
  }

  // Save picks for a specific user and event
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

    // Save to localStorage
    localStorage.setItem(
      this.getStorageKey(username, eventId),
      JSON.stringify(pickData)
    );
  }

  // Retrieve picks for a specific user and event
  static getPicks(username: string, eventId: string): UserEventPicks | null {
    const key = this.getStorageKey(username, eventId);
    const picksJson = localStorage.getItem(key);

    return picksJson ? JSON.parse(picksJson) : null;
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
}
