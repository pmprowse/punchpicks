import React from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { upcomingEvents } from "../data/events";
import { useAuth } from "../context/AuthContext";

const EventsPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          {/* <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-bold text-xl"
          >
            ← Back to Home
          </Link> */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
