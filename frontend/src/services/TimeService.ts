import { Event } from "../types/Events";

export class TimeService {
  // Check if picks are still open for an event
  static canSubmitPicks(event: Event): boolean {
    const now = new Date();
    const startTime = new Date(event.startTime);
    return now < startTime;
  }

  // Check if the event is over
  static isEventOver(event: Event): boolean {
    const now = new Date();
    const endTime = new Date(event.endTime);
    return now > endTime;
  }

  // Get time remaining until picks lock
  static getTimeUntilPicksLock(event: Event): string {
    const now = new Date();
    const startTime = new Date(event.startTime);

    if (now >= startTime) return "Picks Locked";

    const diff = startTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
