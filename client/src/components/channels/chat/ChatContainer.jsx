import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingSkeleton from "../../layout/LoadingSkeleton";
import Chat from "./Chat";

const ChatContainer = () => {
 
  const [searchParams, setSearchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");

  const chatQueryKey = ["channelChat", channelId];

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    queryKey:chatQueryKey,
    enabled: !!channelId,
    retry: 1,
    queryFn: async () => {
      const { data } = await axios.get("/channels/messages/" + channelId);
      return data.messages;
    },
  });

  useEffect(() => {
    if (error && !isLoading && !chat) {
      toast.error(error?.response?.data.error);
      searchParams.delete("channelId");
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line
  }, [error, isLoading]);

  if (isLoading)
    return <LoadingSkeleton passCount={3} className={"w-5/6 md:w-auto h-20 block"}/>;

  if (chat) return <Chat chat={chat} />;
};

export default ChatContainer;
