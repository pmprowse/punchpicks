// src/pages/FightCardPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FightCard, Fight } from "../types/Fight";
import { Pick } from "../types/Picks";
import { PicksApiService } from "../services/PicksApiService";
import { FightsApiService } from "../services/FightsApiService";
import { TimeService } from "../services/TimeService";
import { useAuth } from "../context/AuthContext";
import { EventsApiService } from "../services/EventsApiService";
import { Event } from "../types/Events";

const FightCardPage: React.FC = () => {
  // State to track user's picks
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [mainCard, setMainCard] = useState<FightCard | null>(null);
  const [prelimCard, setPrelimCard] = useState<FightCard | null>(null);
  const [hasExistingPicks, setHasExistingPicks] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  // Time-related states
  const [canSubmitPicks, setCanSubmitPicks] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the event ID from location state
  const location = useLocation();
  const navigate = useNavigate();
  const eventId = location.state?.eventId;

  // Get current user from auth context
  const { user, isAuthenticated } = useAuth();

  // Load event, fight cards, and user picks
  useEffect(() => {
    if (!eventId) {
      setError("No event selected");
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError("Please log in to view this page");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch event details
        const eventData = await EventsApiService.getEvent(eventId);
        if (!isMounted) return;
        setEvent(eventData);

        // Check event time and set pick submission status
        const canSubmit = TimeService.canSubmitPicks(eventData);
        setCanSubmitPicks(canSubmit);

        // Update time remaining
        const remaining = TimeService.getTimeUntilPicksLock(eventData);
        setTimeRemaining(remaining);

        // Fetch fights for this event
        const mainCardData = await FightsApiService.getEventFights(eventId);
        if (!isMounted) return;
        setMainCard(mainCardData);

        // Fetch prelim fights if available
        try {
          const prelimCardData = await FightsApiService.getEventPrelimFights(
            eventId
          );
          if (prelimCardData && isMounted) {
            setPrelimCard(prelimCardData);
          }
        } catch (err) {
          console.log("No prelim card available");
        }

        // Fetch user's picks if any
        const userPicks = await PicksApiService.getUserPicks(eventId);
        if (userPicks && isMounted) {
          setPicks(userPicks.picks);
          setHasExistingPicks(true);
        }

        if (isMounted) {
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching fight card data:", err);
        if (isMounted) {
          setError("Failed to load fight card. Please try again later.");
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Set up interval to update time remaining
    const timerId = setInterval(() => {
      if (event && isMounted) {
        const remaining = TimeService.getTimeUntilPicksLock(event);
        setTimeRemaining(remaining);

        // Stop interval if picks are locked
        if (remaining === "Picks Locked") {
          setCanSubmitPicks(false);
        }
      }
    }, 60000); // Update every minute

    // Clean up interval and set isMounted to false
    return () => {
      clearInterval(timerId);
      isMounted = false;
    };
  }, [eventId, isAuthenticated]);

  // Handle fighter selection
  const handleFighterSelect = (fightId: string, fighterId: string) => {
    if (!canSubmitPicks) return;

    setPicks({
      ...picks,
      [fightId]: {
        fighterId,
        method: picks[fightId]?.method || "",
      },
    });
  };

  // Handle method selection
  const handleMethodSelect = (fightId: string, method: string) => {
    if (!canSubmitPicks || !picks[fightId]?.fighterId) return;

    setPicks({
      ...picks,
      [fightId]: {
        ...picks[fightId],
        method,
      },
    });
  };

  // Check if fighter is selected
  const isFighterSelected = (fightId: string, fighterId: string) => {
    return picks[fightId]?.fighterId === fighterId;
  };

  // Check if method is selected
  const isMethodSelected = (fightId: string, method: string) => {
    return picks[fightId]?.method === method;
  };

  // Calculate completion status
  const calculateCompletionStatus = () => {
    if (!mainCard) return { completedPicks: 0, totalFights: 0 };

    const mainCardFights = mainCard.fights.length;
    const prelimFights = prelimCard ? prelimCard.fights.length : 0;
    const totalFights = mainCardFights + prelimFights;

    const completedPicks = Object.values(picks).filter(
      (pick) => pick.fighterId && pick.method
    ).length;

    return { completedPicks, totalFights };
  };

  // Handle submission of picks
  const handleSubmitPicks = async () => {
    if (!canSubmitPicks || !eventId) return;

    try {
      setIsLoading(true);
      await PicksApiService.submitPicks(eventId, picks);
      setHasExistingPicks(true);
      setError(null);
    } catch (err) {
      console.error("Error submitting picks:", err);
      setError("Failed to submit picks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { completedPicks, totalFights } = calculateCompletionStatus();

  // If still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading fight card...
          </h1>
        </div>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{error}</h1>
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  // If no event or user is selected, show a message
  if (!mainCard || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {!mainCard
              ? "No fights found for this event"
              : "Please log in to make predictions"}
          </h1>
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  // Render fight card section
  const renderFightCard = (card: FightCard) => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-2">
          {card.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {card.fights.map((fight) => (
          <div
            key={fight.id}
            className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${
              !canSubmitPicks ? "opacity-75" : ""
            }`}
          >
            <div className="text-lg font-medium text-gray-600 mb-4">
              {fight.weightClass}
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                className={`text-xl font-bold text-center w-2/5 py-2 px-4 rounded transition duration-200 ${
                  isFighterSelected(fight.id, fight.fighter1.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } ${!canSubmitPicks ? "cursor-not-allowed" : ""}`}
                onClick={() => handleFighterSelect(fight.id, fight.fighter1.id)}
                disabled={!canSubmitPicks}
              >
                {fight.fighter1.name}
              </button>
              <div className="text-gray-400 font-bold">VS</div>
              <button
                className={`text-xl font-bold text-center w-2/5 py-2 px-4 rounded transition duration-200 ${
                  isFighterSelected(fight.id, fight.fighter2.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } ${!canSubmitPicks ? "cursor-not-allowed" : ""}`}
                onClick={() => handleFighterSelect(fight.id, fight.fighter2.id)}
                disabled={!canSubmitPicks}
              >
                {fight.fighter2.name}
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2 text-center">
                {!canSubmitPicks
                  ? "Picks Locked"
                  : picks[fight.id]?.fighterId
                  ? "How will they win?"
                  : "Select a fighter first"}
              </p>

              <div className="flex justify-center space-x-4 mt-2">
                <button
                  className={`rounded-full border border-gray-300 px-4 py-2 text-sm font-medium ${
                    isMethodSelected(fight.id, "KO")
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${
                    !picks[fight.id]?.fighterId || !canSubmitPicks
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handleMethodSelect(fight.id, "KO")}
                  disabled={!picks[fight.id]?.fighterId || !canSubmitPicks}
                >
                  KO
                </button>

                <button
                  className={`rounded-full border border-gray-300 px-4 py-2 text-sm font-medium ${
                    isMethodSelected(fight.id, "SUB")
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${
                    !picks[fight.id]?.fighterId || !canSubmitPicks
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handleMethodSelect(fight.id, "SUB")}
                  disabled={!picks[fight.id]?.fighterId || !canSubmitPicks}
                >
                  SUB
                </button>

                <button
                  className={`rounded-full border border-gray-300 px-4 py-2 text-sm font-medium ${
                    isMethodSelected(fight.id, "PTS")
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${
                    !picks[fight.id]?.fighterId || !canSubmitPicks
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handleMethodSelect(fight.id, "PTS")}
                  disabled={!picks[fight.id]?.fighterId || !canSubmitPicks}
                >
                  PTS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-800 font-bold text-xl"
          >
            ← Back to Events
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900">Punch Picks</h1>
        </div>

        {/* Event Title */}
        <h2 className="text-3xl font-bold text-center mb-4">
          {event?.title || "Fight Card"}
        </h2>

        {/* Time Remaining Display */}
        {canSubmitPicks && (
          <div className="text-center mb-4 text-gray-600">
            Time until picks lock: {timeRemaining}
          </div>
        )}

        <div className="mb-6 text-gray-600 text-center">
          {completedPicks}/{totalFights} picks completed
        </div>

        {/* Main Card */}
        {renderFightCard(mainCard)}

        {/* Divider */}
        {prelimCard && (
          <div className="my-8 border-t border-gray-300 w-full"></div>
        )}

        {/* Preliminary Card */}
        {prelimCard && renderFightCard(prelimCard)}

        <div className="mt-8 flex justify-center">
          <button
            className={`${
              completedPicks === totalFights && canSubmitPicks
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition duration-300`}
            disabled={completedPicks !== totalFights || !canSubmitPicks}
            onClick={handleSubmitPicks}
          >
            {canSubmitPicks
              ? hasExistingPicks
                ? "Update Picks"
                : "Submit Picks"
              : "Picks Locked"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FightCardPage;
