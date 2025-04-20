import React from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types/Events";

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleMakePredictions = () => {
    // Navigate to fight card page, potentially passing event ID
    navigate("/fights", { state: { eventId: event.id } });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold">UFC {event.number}</h2>
        <span className="text-sm">{event.date}</span>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-2">{event.location}</p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Main Event</h3>
          <p className="text-gray-800">
            {event.mainEvent.fighter1} vs {event.mainEvent.fighter2}
          </p>
        </div>
        <button
          onClick={handleMakePredictions}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Make Predictions
        </button>
      </div>
    </div>
  );
};

export default EventCard;
