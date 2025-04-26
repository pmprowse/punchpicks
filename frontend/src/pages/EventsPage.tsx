// src/pages/EventsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { EventsApiService } from "../services/EventsApiService";
import { Event } from "../types/Events";

const EventsPage: React.FC = () => {
  const { logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const eventsData = await EventsApiService.getEvents();
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-800 text-center mb-8">
            Punch Picks
          </h1>
          <button
            onClick={logout}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Logout
          </button>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Upcoming UFC Events
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Loading events...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-600">
            No upcoming events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
