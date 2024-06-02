import moment from "moment"; // Import Moment.js
import React, { useState } from "react";
import { useAuthStore } from "../../../store/store";
const MessageBox = ({ message }) => {
  const [showFullText, setShowFullText] = useState(false);
  const { user } = useAuthStore();

 
  const words = message.text.split(" ");
  const showReadMore = words.length > 30;

  const isCurrentUserMessage = user.id === (message.by || message.sender.id); // Check if the message is from the current user
  const fullTimestamp = moment(message.timestamp).format(
    "MMMM Do YYYY, h:mm:ss a"
  ); // Full timestamp for tooltip

  const handleReadMore = () => {
    setShowFullText(true);
  };
  return (
    <div
      key={JSON.stringify(message)}
      className={`mb-2 ${
        isCurrentUserMessage ? "ml-auto text-right" : " text-left mr-auto" // Move the message to the right if sent by the current user
      }`}
    >
      <div className={`text-gray-500 text-sm my-2 mx-1`}>
        {message?.sender.username}{" "}
        <small className="text-xs">
          <span title={fullTimestamp} className="timestamp-hover">
            ,{moment(message.timestamp).fromNow()} {/* Display the time ago */}
          </span>
        </small>{" "}
      </div>
      <span
        className={`py-2 px-2 rounded-lg ${
          isCurrentUserMessage ? "bg-yellow-100" : "bg-gray-200"
        }`}
      >
        {showFullText ? (
          message.text
        ) : (
          <>
            {message.text.split(" ").slice(0, 35).join(" ")}{" "}
            {showReadMore && (
              <span
                className="text-blue-500 cursor-pointer"
                onClick={handleReadMore}
              >
                Read More
              </span>
            )}
          </>
        )}
      </span>
    </div>
  );
};

export default MessageBox;
