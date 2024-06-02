import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useSearchParams } from "react-router-dom";
import LoadingSkeleton from "../layout/LoadingSkeleton";

const Peoples = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const { data } = await axios.get("/auth/people");
      if (!data.success) {
        throw Error("Failed to fetch people");
      }
      return data.people;
    },
  });

  const handleUserClick = (id) => {
    searchParams.set("adminId", id);
    searchParams.delete("channelId");
    setSearchParams(searchParams);
  };
  
  return (
    <div className="p-3 w-full md:w-auto md:border-r md:border-gray-300">
      <h3 className="p-2 font-lg font-bold">People</h3>

      {isLoading ? (
        <LoadingSkeleton passCount={2} className={"w-5/6 h-10"} />
      ) : (
       data.length ?  <ul className="rounded-md shadow-sm p-5 md:p-1 overflow-x-auto flex flex-row gap-5 md:block">
          {data.map((ppl) => (
            <li
              key={ppl.id}
              className={`p-2 cursor-pointer shadow-sm flex items-center gap-1 rounded-sm my-0 md:my-1 hover:bg-gray-200 ${
                searchParams.get("adminId") === ppl.id ? "bg-blue-200" : null
              }`}
              onClick={() => handleUserClick(ppl.id)}
            >
              <div className="w-8 h-8 rounded-[50%] bg-slate-600 pt-1 text-blue-500 text-center">
                {ppl.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-md">{ppl.username}</div>
            </li>
          ))}
        </ul>: <p> No People Exist</p>
      ) }
    </div>
  );
};

export default Peoples;
