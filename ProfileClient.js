// app/profile/ProfileClient.js
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { updateProfile, updatePassword, logout } from "./action";

const RoutingMap = dynamic(() => import("./RoutingMap"), { ssr: false });

export default function ProfileClient({ user, profile, searchParams }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [coords, setCoords] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("profile");
  const [searchHistory, setSearchHistory] = useState([]);

  const [distance, setDistance] = useState(null);

  function handleDistanceUpdate(newDistance) {
    setDistance(newDistance);
  }

  async function geocodePlace(place) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        place
      )}`
    );
    const data = await res.json();
    if (data.length > 0)
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  }

  async function handleSearch() {
    const fromCoords = await geocodePlace(from);
    const toCoords = await geocodePlace(to);
    if (fromCoords && toCoords) {
      setCoords({ from: fromCoords, to: toCoords });

      // Add to search history (avoid duplicates)
      const newSearch = { from, to, timestamp: new Date().toLocaleString() };
      setSearchHistory((prev) => {
        // Check if this search already exists
        const exists = prev.some(
          (search) => search.from === from && search.to === to
        );
        if (!exists) {
          // Keep only last 10 searches
          return [newSearch, ...prev.slice(0, 9)];
        }
        return prev;
      });
    } else {
      alert("One of the locations could not be found.");
    }
  }

  function handleHistoryClick(historyItem) {
    setFrom(historyItem.from);
    setTo(historyItem.to);
    // Clear current coordinates first, then set new ones
    setCoords({ from: null, to: null });

    setTimeout(async () => {
      const fromCoords = await geocodePlace(historyItem.from);
      const toCoords = await geocodePlace(historyItem.to);
      if (fromCoords && toCoords) {
        setTimeout(() => {
          setCoords({ from: fromCoords, to: toCoords });
        }, 100);
      }
    }, 100);
  }

  const error = searchParams?.error;
  const message = searchParams?.message;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === "profile"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("trip")}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === "trip"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Find a trip
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "profile" && (
            <div className="p-6 space-y-6">
              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {/* Profile Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Username
                  </p>
                  <p className="text-lg text-gray-900">
                    {profile?.username || "Not set"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Phone
                  </p>
                  <p className="text-lg text-gray-900">
                    {profile?.phone || "Not set"}
                  </p>
                </div>

                {/* <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    User ID
                  </p>
                  <p className="text-sm text-gray-600 font-mono">{user.id}</p>
                </div> */}
              </div>

              {/* Update Profile Form */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Profile
                </h2>
                <form action={updateProfile} className="space-y-4">
                  <input
                    name="username"
                    placeholder={`Current: ${profile?.username || "Not set"}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                  <input
                    name="phone"
                    placeholder={`Current: ${profile?.phone || "Not set"}`}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition duration-200"
                  >
                    Update Profile
                  </button>
                </form>
              </div>

              {/* Update Password Form */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h2>
                <form action={updatePassword} className="space-y-4">
                  <input
                    name="password"
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition duration-200"
                  >
                    Change Password
                  </button>
                </form>
              </div>

              {/* Logout Button */}
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-medium py-3 rounded-lg hover:bg-red-500 transition duration-200"
                >
                  Logout
                </button>
              </form>
            </div>
          )}

          {activeTab === "trip" && (
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Find a trip
              </h2>

              <div className="space-y-4">
                {/* Pick-up location */}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Pick-up location"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Drop-off location */}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-black rounded-sm"></div>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Drop-off location"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>

                {/* Time selector */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3"></div>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Pick up now</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* For me selector */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3"></div>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>For me</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-gray-200 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-300 transition duration-200 mt-6"
              >
                Search
              </button>

            
              <div className="text-black font-medium bg-white px-6 py-3">
                Distance: {distance} km
              </div>
              <div className="text-black font-medium bg-white px-6 py-3">
                Price: ₹ {(distance * 10).toFixed(2)} (₹10 per km)
              </div>
                {/* Activity Button */}
              <div className="p-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-black">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="font-medium">Activity</span>
                </button>
              </div>
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mt-6 mx-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Recent searches
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchHistory.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleHistoryClick(search)}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-700 flex-1">
                            {search.from}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm mt-1">
                          <div className="w-2 h-2 bg-black rounded-sm"></div>
                          <span className="text-gray-700 flex-1">
                            {search.to}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {search.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clear history button */}
                  <button
                    onClick={() => setSearchHistory([])}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <RoutingMap
          from={coords.from}
          to={coords.to}
          fromname={from}
          toname={to}
          handleDistanceUpdate={handleDistanceUpdate}
        />
      </div>
    </div>
  );
}
