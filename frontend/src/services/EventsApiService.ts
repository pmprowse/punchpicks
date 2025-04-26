// src/services/EventsApiService.ts
import { Event } from "../types/Events";

const API_URL = "http://localhost:8000/api";

export class EventsApiService {
  // Get all upcoming events
  static async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      // Transform backend data to match frontend Event type
      return data.map((event: any) => ({
        id: event.id.toString(),
        number: event.title.includes("UFC")
          ? parseInt(event.title.replace("UFC", "").trim())
          : null,
        date: new Date(event.date).toLocaleDateString(),
        location: event.location,
        startTime: event.start_date || new Date(event.date).toISOString(),
        endTime: new Date(
          new Date(event.date).getTime() + 8 * 60 * 60 * 1000
        ).toISOString(),
        title: event.title, // Include the title from the database
        mainEvent: {
          fighter1: "TBD",
          fighter2: "TBD",
        },
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  // Get a specific event by ID
  static async getEvent(eventId: string): Promise<Event> {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      const event = await response.json();

      return {
        id: event.id.toString(),
        number: event.title.includes("UFC")
          ? parseInt(event.title.replace("UFC", "").trim())
          : null,
        date: new Date(event.date).toLocaleDateString(),
        location: event.location,
        startTime: event.start_date || new Date(event.date).toISOString(),
        endTime: new Date(
          new Date(event.date).getTime() + 8 * 60 * 60 * 1000
        ).toISOString(),
        title: event.title,
        mainEvent: {
          fighter1: "TBD",
          fighter2: "TBD",
        },
      };
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }
}
