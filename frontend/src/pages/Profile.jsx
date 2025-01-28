import React, { useState } from "react";

function Profile() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOwner] = useState(true); // Typically from auth context

  const user = {
    name: "John Doe",
    handle: "@johndoe",
    email: "johndoe@example.com",
    coverImage: "https://source.unsplash.com/random/1200x300",
    avatar: "https://source.unsplash.com/random/150x150",
    subscribers: "1.2K",
    subscribedChannels: 45,
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Cover Image Section */}
      <div className="relative h-60 bg-gray-100">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40" />

        {/* Avatar */}
        <div className="absolute -bottom-16 left-8">
          <img
            src={user.avatar}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-white shadow-xl"
          />
        </div>
      </div>

      {/* Profile Content */}
      <div className="pt-24 px-8 pb-8">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mt-1">{user.handle}</p>
          </div>

          <button
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
              isSubscribed
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isSubscribed ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Subscribed
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Subscribe
              </>
            )}
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex gap-8 py-6 my-6 border-y border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.subscribers}
            </div>
            <div className="text-gray-500 text-sm">Subscribers</div>
          </div>
          <div className="h-12 w-px bg-gray-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.subscribedChannels}
            </div>
            <div className="text-gray-500 text-sm">Subscribed Channels</div>
          </div>
        </div>

        {/* Email Section */}
        {isOwner && (
          <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <div className="text-xs font-medium text-gray-500">
                PRIVATE EMAIL
              </div>
              <div className="text-gray-900 font-medium">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
