import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
// import { socket } from "../../../sockets/socket";
import { useAuthStore, useSocketStore } from "../../../store/store";
import { v4 as uuidv4 } from "uuid";
const SendMessage = ({ setMessages }) => {
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");
  const mutation = useMutation({
    mutationFn: (msg) => {
      return axios.post("/channels/messages/" + channelId, msg);
    },
    // onSuccess: (data) => {
    //   const text = data.data.message;
    //   const res = { ...text, channelId };

    //   console.log("Setted Messages");
    // },
  });
  const handleSendMessage = async () => {
    if (channelId && message.length) {
      const res = {
        text: message,
        id: uuidv4(),
        by: user.id,
        sender: user,
        channelId,
        timestamp: new Date(Date.now()),
      };
      socket.emit("sendText", res);
      setMessages((e) => {
        return [...e, res];
      });
      mutation.mutate(res);
    }
    setMessage("");
  };

  return (
    <div className="bg-white mt-4 ">
      <div className="flex items-center">
        <textarea
          className="w-full p-2 rounded-lg border border-gray-300 
          focus:ring focus:ring-blue-500 focus:ring-opacity-50
           focus:border-blue-500 focus:outline-none"
          placeholder="Type your message..."
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button
          onClick={handleSendMessage}
          disabled={!message.length || mutation.isPending}
          className="ml-2 px-4 py-2 disabled:bg-blue-300 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          {mutation.isPending ? "sending" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default SendMessage;
