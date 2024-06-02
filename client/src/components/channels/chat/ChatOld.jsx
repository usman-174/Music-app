import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore, useSocketStore } from "../../../store/store";
import MessageBox from "./MessageBox";
import SendMessage from "./SendMessage";
import { toast } from "react-toastify";
import ChannelMembers from "../ChannelMembers";
import AudioPlayer from "../../music/AudioPlayer";
import LoadingSkeleton from "../../layout/LoadingSkeleton";

const Chat = () => {
  const { socket } = useSocketStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");
  const { user } = useAuthStore();
  const [joined, setJoined] = useState(null);
  const [onlineMembers, setOnlineMembers] = useState([]);

  const {
    data: chat,
    isLoading,
    error,
    isFetched,
  } = useQuery({
    queryKey: ["channelChat", channelId],
    enabled: !!channelId,
    retry: 1,
    queryFn: async () => {
      const { data } = await axios.get("/channels/messages/" + channelId);
      return data.messages;
    },
  });

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

    if (channelId && chat) {
      socket.emit("getWelcome", { user, channelId });
    }
    const handleWelcome = (data) => {
   
      if (data && channelId === data.channelId) {
        toast("Welcome " + data.username);
        setJoined(data);
      }
    };
    socket.on("welcome", handleWelcome);

    const handleOnlineUsers = (data) => {
      if (data.length) {
        setOnlineMembers(data);
      }
    };
    socket.on("onlineUsers", handleOnlineUsers);
 
    return () => {
      // Clean up socket event listeners when the component unmounts
      socket.off("receiveText", handleReceiveText);
      socket.off("welcome", handleWelcome);
      socket.off("onlineUsers", handleOnlineUsers);
    };
    // eslint-disable-next-line
  }, [channelId,chat]);


  useEffect(() => {
    if (error && !isLoading && !chat) {
      toast.error(error?.response?.data.error);
      searchParams.delete("channelId");
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line
  }, [error, isLoading]);

  if (isLoading)
    return <LoadingSkeleton passCount={3} className={"w-5/6 h-20 block"} />;

  // if (error) {
  //   return (
  //     <p className="text-red-600 text-xl w-1/3">
  //       {error?.response?.data.error || error.message}
  //     </p>
  //   );
  // }

  return (
    <div className="p-3 mx-auto w-full md:w-1/2">
      <hr />

      {chat && !isLoading && (
        <>
          <AudioPlayer chat={chat} joined={joined} />
          {chat.members && (
            <ChannelMembers
              members={chat.members}
              onlineMembers={onlineMembers}
            />
          )}

          <div>
            <div
              className="overflow-y-auto h-[55vh] p-2 shadow-md bg-slate-50"
              ref={messagesColumnRef}
            >
              {messages?.map((message, index) => (
                <MessageBox key={message.timestamp + index} message={message} />
              ))}
            </div>
            <SendMessage socket={socket} setMessages={setMessages} />
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
