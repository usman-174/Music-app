import React, {  useState } from "react";
import { useSearchParams } from "react-router-dom";
import EditChannel from "./EditChannel";
import { FaTrash } from "react-icons/fa"; // Import the delete icon from react-icons
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore, useSocketStore } from "../../store/store";

const ChannelBox = ({ channel, isUserAdmin }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { socket } = useSocketStore();
  const channelId = searchParams.get("channelId");
  const { data: chat } = useQuery({
    queryKey: ["channelChat", channelId],
    enabled: !!channelId,
    retry: 1,
    queryFn: async () => {
      const { data } = await axios.get("/channels/messages/" + channelId);
      return data.messages;
    },
  });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSelectChannel = () => {
    searchParams.set("channelId", channel.id);
    setSearchParams(searchParams);
    if (chat && chat.admin.id === user.id) {
      socket.emit("resetAudio", { channelId });
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return axios.delete("/channels/" + channel.id);
    },
    onSuccess: () => {
      setIsDeleteConfirmOpen(false);
      searchParams.delete("channelId");
      setSearchParams(searchParams);
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const handleDeleteChannel = () => {
    // Use a confirm dialog before deletion

    mutation.mutate();
  };
 
  return (
    <div
      onClick={handleSelectChannel}
      className={`text-gray-800 rounded-sm shadow-sm py-2 px-3 md:my-2 hover:bg-gray-200 
      cursor-pointer
       flex items-center  w-auto  ${
         searchParams.get("channelId") === channel.id ? "bg-blue-200" : null
       }`}
    >
      <b>#</b>
      {channel.name.replace(/ /g, "-")}
      {isUserAdmin ? (
        <>
          <EditChannel channel={channel} />{" "}
          <FaTrash
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="text-red-600 ml-2 cursor-pointer hover:text-red-400"
          />
        </>
      ) : null}
      {isDeleteConfirmOpen && (
        <div
          className="absolute top-0 left-0 w-full h-full
         bg-slate-200 bg-opacity-80 flex justify-center p-10 items-center z-10 rounded-md"
        >
          <div className="bg-white p-4 rounded-lg text-xl">
            <p>Are you sure you want to delete this channel?</p>
            <br />
            <button
              onClick={handleDeleteChannel}
              className="px-2 py-1 mx-2  text-white rounded-md bg-blue-500 hover:bg-blue-600"
            >
              {mutation.isPending ? "Deleting..." : "Delete"}
            </button>
            <button
              disabled={mutation.isPending}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-2 py-1 bg-gray-500 rounded-md text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelBox;
