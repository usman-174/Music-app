import React from "react";
import { useAuthStore } from "../../store/store";
import { FaCircle, FaCircleNotch } from "react-icons/fa"; // Import icons from react-icons

const ChannelMembers = ({ members, onlineMembers }) => {
  const { user } = useAuthStore();
  return (
    <div className="w-full border-t py-3 my-2 mx-auto shadow-md flex flex-wrap md:flex-nowrap justify-around items-center overflow-x-auto">
      {members
        .filter((z) => z.id !== user.id)
        .map((member, index) => {
          const isOnline = onlineMembers.find((x) => member.id === x.id);
          return (
            <div
              key={member.id}
              className={`${
                index === 0 ? "md:ml-4" : ""
              } flex items-center text-sm rounded-full border px-2 py-1 `}
            >
              {isOnline ? (
                <FaCircle color="green" size={14} className="mr-1" />
              ) : (
                <FaCircleNotch color="gray" size={14} className="mr-1"/>
              )}
              {member.username}
            </div>
          );
        })}
    </div>
  );
};

export default ChannelMembers;
