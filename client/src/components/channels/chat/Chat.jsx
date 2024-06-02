import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
// import { toast } from "react-toastify";
import { useAuthStore, useSocketStore } from "../../../store/store";
import AudioPlayer from "../../music/AudioPlayer";
import ChannelMembers from "../ChannelMembers";
import MessageBox from "./MessageBox";
import SendMessage from "./SendMessage";

const Chat = ({ chat }) => {
  const { socket } = useSocketStore();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");
  const { user } = useAuthStore();

  const [joined, setJoined] = useState(null);
  const [onlineMembers, setOnlineMembers] = useState([]);

  const [messages, setMessages] = useState(chat?.messages || []);
  const messagesColumnRef = useRef(null);

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    }
    // eslint-disable-next-line
  }, [chat]);

  useEffect(() => {
    if (messages?.length && messagesColumnRef?.current) {
      messagesColumnRef.current.scrollTop =
        messagesColumnRef.current.scrollHeight;
    }
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    if (channelId && chat) {
      socket.emit("join", { user, channelId }, (data) => {
      
        setOnlineMembers(data);
      });
      setJoined(user);
    }
    // eslint-disable-next-line
  }, [channelId]);

  useEffect(() => {
    const handleReceiveText = (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.on("receiveText", handleReceiveText);

    const handleOnlineUsers = (data) => {
      if (data.length) {
        setOnlineMembers(data);
      }
    };
    socket.on("onlineUsers", handleOnlineUsers);
   
    return () => {
      // Clean up socket event listeners when the component unmounts
      socket.off("receiveText", handleReceiveText);
    
      socket.off("onlineUsers", handleOnlineUsers);
    };
    // eslint-disable-next-line
  }, [channelId]);

  return (
    <div className="p-3 mx-auto w-full md:w-1/2">
      <hr />

      <AudioPlayer chat={chat} joined={joined} />

      {chat.members && (
        <ChannelMembers members={chat.members} onlineMembers={onlineMembers} />
      )}

      <div>
        <div
          className="overflow-y-auto h-[55vh] p-2 shadow-md bg-slate-50"
          ref={messagesColumnRef}
        >
          {messages?.map((message, index) => (
            <MessageBox
              key={message.timestamp + index}
              setMessages={setMessages}
              message={message}
              // welcome={welcome}
            />
          ))}
          {/* {welcome ? (
            <p className="text-center mx-auto text-gray-600 text-xs  my-2 font-mono">
              {welcome}
            </p>
          ) : null} */}
        </div>
        <SendMessage socket={socket} setMessages={setMessages} />
      </div>
    </div>
  );
};

export default Chat;
