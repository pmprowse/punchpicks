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

      return data.map((event: any) => {
        // Create a date object for the event date
        const eventDate = new Date(event.date);

        // Always set the start time to future time for today's events
        const now = new Date();
        let startTime;

        // Check if event is today
        if (eventDate.toDateString() === now.toDateString()) {
          // If it's today, set to 11 PM tonight
          const todayStartTime = new Date();
          todayStartTime.setHours(23, 0, 0, 0);
          startTime = todayStartTime.toISOString();
        } else {
          // For future dates, use 6 PM on the event date
          const futureStartTime = new Date(eventDate);
          futureStartTime.setHours(18, 0, 0, 0);
          startTime = futureStartTime.toISOString();
        }

        // Set end time to 8 hours after start time
        const endTimeDate = new Date(startTime);
        endTimeDate.setHours(endTimeDate.getHours() + 8);

        return {
          id: event.id.toString(),
          number: event.title.includes("UFC")
            ? parseInt(event.title.replace("UFC", "").trim())
            : null,
          date: eventDate.toLocaleDateString(),
          location: event.location,
          startTime: startTime,
          endTime: endTimeDate.toISOString(),
          title: event.title,
          mainEvent: {
            fighter1: "TBD",
            fighter2: "TBD",
          },
        };
      });
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

      // Create a date object for the event date
      const eventDate = new Date(event.date);
      const now = new Date();

      // ALWAYS set to a future time to ensure picks aren't locked
      // For today's events, set to 11 PM
      const startTime = new Date();
      startTime.setHours(12, 15, 0, 0); // Set to 11 PM today

      // Set end time to 8 hours after start time
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 8);

      return {
        id: event.id.toString(),
        number: event.title.includes("UFC")
          ? parseInt(event.title.replace("UFC", "").trim())
          : null,
        date: eventDate.toLocaleDateString(),
        location: event.location,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
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
