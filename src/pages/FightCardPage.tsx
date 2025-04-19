// src/pages/FightCardPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Fighter {
  name: string;
  id: string;
}

interface Fight {
  id: string;
  weightClass: string;
  fighter1: Fighter;
  fighter2: Fighter;
}

interface FightCard {
  title: string;
  fights: Fight[];
}

interface Pick {
  fighterId: string;
  method: string | null;
}

const FightCardPage: React.FC = () => {
  // State to track user's picks
  const [picks, setPicks] = useState<Record<string, Pick>>({});

  // Sample data for the main card
  const mainCard: FightCard = {
    title: "Main Card",
    fights: [
      {
        id: "fight1",
        weightClass: "Featherweight",
        fighter1: { name: "Alexander Volkanovski", id: "volkanovski" },
        fighter2: { name: "Diego Lopes", id: "lopes" },
      },
      {
        id: "fight2",
        weightClass: "Lightweight",
        fighter1: { name: "Paddy Pimblett", id: "pimblett" },
        fighter2: { name: "Michael Chandler", id: "chandler" },
      },
      {
        id: "fight3",
        weightClass: "Featherweight",
        fighter1: { name: "Yair Rodriguez", id: "rodriguez" },
        fighter2: { name: "Patricio Pitbull", id: "pitbull" },
      },
      {
        id: "fight4",
        weightClass: "Featherweight",
        fighter1: { name: "Jean Silva", id: "silva" },
        fighter2: { name: "Bryce Mitchell", id: "mitchell" },
      },
      {
        id: "fight5",
        weightClass: "Light Heavyweight",
        fighter1: { name: "Dominick Reyes", id: "reyes" },
        fighter2: { name: "Nikita Krylov", id: "krylov" },
      },
    ],
  };

  // Handle fighter selection
  const handleFighterSelect = (fightId: string, fighterId: string) => {
    setPicks({
      ...picks,
      [fightId]: {
        fighterId,
        method: picks[fightId]?.method || null,
      },
    });
  };

  // Handle method selection
  const handleMethodSelect = (fightId: string, method: string) => {
    if (picks[fightId]?.fighterId) {
      setPicks({
        ...picks,
        [fightId]: {
          ...picks[fightId],
          method,
        },
      });
    }
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
    const totalFights = mainCard.fights.length;
    const completedPicks = Object.values(picks).filter(
      (pick) => pick.fighterId && pick.method
    ).length;
    return { completedPicks, totalFights };
  };

  const { completedPicks, totalFights } = calculateCompletionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-bold text-xl"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900">Punch Picks</h1>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold border-b border-gray-300 pb-2">
              {mainCard.title}
            </h2>
            <div className="text-gray-600">
              {completedPicks}/{totalFights} picks completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCard.fights.map((fight) => (
              <div
                key={fight.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
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
                    }`}
                    onClick={() =>
                      handleFighterSelect(fight.id, fight.fighter1.id)
                    }
                  >
                    {fight.fighter1.name}
                  </button>
                  <div className="text-gray-400 font-bold">VS</div>
                  <button
                    className={`text-xl font-bold text-center w-2/5 py-2 px-4 rounded transition duration-200 ${
                      isFighterSelected(fight.id, fight.fighter2.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      handleFighterSelect(fight.id, fight.fighter2.id)
                    }
                  >
                    {fight.fighter2.name}
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2 text-center">
                    {picks[fight.id]?.fighterId
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
                        !picks[fight.id]?.fighterId
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleMethodSelect(fight.id, "KO")}
                      disabled={!picks[fight.id]?.fighterId}
                    >
                      KO
                    </button>

                    <button
                      className={`rounded-full border border-gray-300 px-4 py-2 text-sm font-medium ${
                        isMethodSelected(fight.id, "SUB")
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } ${
                        !picks[fight.id]?.fighterId
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleMethodSelect(fight.id, "SUB")}
                      disabled={!picks[fight.id]?.fighterId}
                    >
                      SUB
                    </button>

                    <button
                      className={`rounded-full border border-gray-300 px-4 py-2 text-sm font-medium ${
                        isMethodSelected(fight.id, "PTS")
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } ${
                        !picks[fight.id]?.fighterId
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleMethodSelect(fight.id, "PTS")}
                      disabled={!picks[fight.id]?.fighterId}
                    >
                      PTS
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className={`${
                completedPicks === totalFights
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition duration-300`}
              disabled={completedPicks !== totalFights}
            >
              Submit Picks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FightCardPage;
