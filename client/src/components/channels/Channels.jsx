

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/store";
import LoadingSkeleton from "../layout/LoadingSkeleton";
import ChannelBox from "./ChannelBox";
import CreateChannel from "./CreateChannel";

const Channels = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const adminId = searchParams.get("adminId") || user.id || "";

  const peopleQueryKey = ["people"];
  const channelsQueryKey = ["channels", adminId];

  const handleMyChannels = () => {
    searchParams.set("adminId", user.id);
    setSearchParams(searchParams);
  };

  const fetchChannels = async () => {
    const { data } = await axios.get("/channels/" + adminId);
    if (!data.success) {
      throw new Error("Failed to fetch Channels");
    }
    return data.channels;
  };

  const { data: people } = useQuery({queryKey:peopleQueryKey});
  
  const admin = adminId === user.id ? user : people?.find((x) => x.id === adminId) || {};
  const isUserAdmin = adminId === user.id;

  // const { data: channels, isLoading } = useQuery(channelsQueryKey, {

  const { data: channels, isLoading } = useQuery({
    queryKey: channelsQueryKey,
    enabled: !!adminId,
    queryFn: fetchChannels,
  });
  
  const renderChannelList = () => {
    if (isLoading) {
      return <LoadingSkeleton passCount={2} width="5/6" height="10" />;
    } else if (channels.length) {
      return channels.map((channel, i) => (
        <React.Fragment key={channel.id + i}>
          <ChannelBox channel={channel} isUserAdmin={isUserAdmin} />
        </React.Fragment>
      ));
    } else {
      return <p>{admin.username} has not created any channels yet</p>;
    }
  };

  return (
    <>
      <div className="p-3 w-full md:w-auto md:border-r md:border-gray-300">
        {isUserAdmin && <CreateChannel />}
        <small
          className="m-2 text-sm text-gray-400 cursor-pointer hover:text-black"
          onClick={handleMyChannels}
        >
          Show my channels
        </small>

        <div className="text-xl font-bold mb-3">
          Channels
          {admin && (
            <small className="p-2 font-normal text-sm">By {admin.username}</small>
          )}
        </div>

        <div className="overflow-x-auto p-5 md:p-1 flex flex-row items-center gap-5 md:block">
          {renderChannelList()}
        </div>
      </div>
    </>
  );
};

export default Channels;

