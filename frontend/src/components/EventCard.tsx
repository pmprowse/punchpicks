import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types/Events";
import { FightsApiService } from "../services/FightsApiService";

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [mainEventFighters, setMainEventFighters] = useState<{
    fighter1: string;
    fighter2: string;
  }>({
    fighter1: event.mainEvent.fighter1 || "TBD",
    fighter2: event.mainEvent.fighter2 || "TBD",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only fetch main event fighters if they're not already provided
    if (
      event.mainEvent.fighter1 === "TBD" ||
      event.mainEvent.fighter2 === "TBD"
    ) {
      const fetchMainEventFighters = async () => {
        try {
          setIsLoading(true);
          // Fetch fights for this event to get main event
          const fightCard = await FightsApiService.getEventFights(event.id);
          // Find the main event (typically the first fight in a sorted card)
          const mainEventFight =
            fightCard.fights.find((fight) =>
              fight.weightClass.includes("Championship")
            ) || fightCard.fights[0];

          if (mainEventFight) {
            setMainEventFighters({
              fighter1: mainEventFight.fighter1.name,
              fighter2: mainEventFight.fighter2.name,
            });
          }
        } catch (error) {
          console.error("Error fetching main event:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMainEventFighters();
    }
  }, [event.id, event.mainEvent]);

  const handleMakePredictions = () => {
    navigate("/fights", { state: { eventId: event.id } });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold">{event.title}</h2>
        <span className="text-sm">{event.date}</span>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-2">{event.location}</p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Main Event</h3>
          {isLoading ? (
            <p className="text-gray-500">Loading main event...</p>
          ) : (
            <p className="text-gray-800">
              {mainEventFighters.fighter1} vs {mainEventFighters.fighter2}
            </p>
          )}
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
