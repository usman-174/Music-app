import React, { useEffect, useState } from "react";
import Modal from "../layout/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../../store/store";
import { useSearchParams } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";

const CreateChannel = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const adminId = searchParams.get("adminId") || user.id || "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([user]);
  const [peopleList, setPeopleList] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleMember = (person) => {
    if (selectedMembers.includes(person)) {
      // Remove the person from the selected members list
      setSelectedMembers((prevMembers) =>
        prevMembers.filter((member) => member !== person)
      );
    } else if (selectedMembers.length < 6) {
      // Add the person to the selected members list if not already at max
      setSelectedMembers((prevMembers) => [...prevMembers, person]);
    }
  };

  const { data: people } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const { data } = await axios.get("/auth/people");
      if (!data.success) {
        throw Error("Failed to fetch people");
      }
      return data.people;
    },
  });

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post("/channels/", body);
    },
    onSuccess: () => {
      setSelectedMembers([user]);
      setChannelName("");
      queryClient.invalidateQueries({ queryKey: ["channels", adminId] });
      closeModal();
    },
  });

  const handleSubmit = async () => {
    const res = {
      name: channelName,
      members: selectedMembers.map((x) => ({ _id: x.id })),
    };
    mutation.mutate(res);
  };

  const handleSearchChange = (e) => {
    const searchText = e.target.value;
    const filteredPeople = people.filter(
      (person) =>
        person.username.includes(searchText) ||
        person.email.includes(searchText)
    );
    setPeopleList(filteredPeople);
  };

  // Use useEffect to update peopleList when people data is available
  useEffect(() => {
    if (people) {
      setPeopleList(people);
    }
  }, [people]);
  return (
    <div>
      <button
        className="flex items-center bg-blue-500 text-white px-2 py-1 text-md rounded-md hover:bg-blue-600"
        onClick={openModal}
      >
        <FaPlusCircle className="mr-1" /> Make Channel
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        handleSubmit={handleSubmit}
        loading={mutation?.isPending}
      >
        <div>
          <h1 className="text-lg font-semibold mb-2">Create Channel</h1>
          {mutation.isError ? (
            <p className="text-red-600 text-xl">
              {mutation?.error?.response.data.error}
            </p>
          ) : null}
          <p>Enter Channel Name</p>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter channel name"
            className="w-full mt-2 p-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <p>
            Select Members:
            <span className=" px-2 text-xs">{selectedMembers.length}/6</span>
          </p>

          <div>
            <input
              type="text"
              placeholder="Type User name..."
              className="p-1 rounded-md mx-1 my-2 border border-gray-300"
              onChange={handleSearchChange}
            />
            <div className="flex  items-center justify-around overflow-x-auto">
              {peopleList.length ? (
                peopleList?.map((person) => (
                  <div
                    key={person.id}
                    className={`cursor-pointer m-2 px-2  py-1 rounded-md border uppercase italic
                 border-gray-400 hover:border-black ${
                   selectedMembers.includes(person) ? "bg-blue-200" : "bg-white"
                 }`}
                    onClick={() => handleToggleMember(person)}
                  >
                    {person.username}
                  </div>
                ))
              ) : (
                <p>No user found</p>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-red-600">
          {selectedMembers.length >= 6 ? "Maximum 6 members allowed." : ""}
        </p>
      </Modal>
    </div>
  );
};

export default CreateChannel;
