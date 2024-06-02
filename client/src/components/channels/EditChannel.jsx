import React, { useState } from "react";
import Modal from "../layout/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BsPencilSquare } from "react-icons/bs";
const EditChannel = ({ channel }) => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channelName, setChannelName] = useState(channel.name || "");
  const [selectedMembers, setSelectedMembers] = useState(channel.members);
  const [peopleList, setPeopleList] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleMember = (person) => {
    if (selectedMembers.find((x) => person.id === x.id)) {
      // Remove the person from the selected members list
      setSelectedMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== person.id)
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
    mutationFn: async (body) => {
      return axios.put("/channels/" + channel.id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
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
  // Set the peopleList state with the retrieved people
  useState(() => {
    if (people) {
      setPeopleList(people);
    }
  }, [people]);

  return (
    <>
      <small
        className="text-sm  text-gray-600 mt-1 px-1 cursor-pointer hover:text-blue-500"
        onClick={openModal}
      >
        <BsPencilSquare />
      </small>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        handleSubmit={handleSubmit}
        loading={mutation?.isPending}
      >
        <div>
          <h1 className="text-lg font-semibold mb-2">Update Channel</h1>
          {mutation.isError ? (
            <p className="text-red-600 text-xl">
              {mutation?.error?.response?.data?.error}
            </p>
          ) : null}
          <p>Enter Channel Name</p>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter channel name"
            className="w-full mt-2 p-2 rounded-lg border border-gray-300 
            focus:ring focus:ring-blue-500 focus:ring-opacity-50 
            focus:border-blue-500 focus:outline-none"
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
                peopleList?.map((person,index) => (
                  <div
                    key={person.id+ index+new Date()}
                    className={`cursor-pointer m-2 p-2 rounded-full border border-gray-400 hover:border-black ${
                      selectedMembers.find((x) => person.id === x.id)
                        ? "bg-blue-200"
                        : "bg-white"
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
        <p className="mt-2 px-2 text-gray-600 text-sm">
          {selectedMembers.length >= 6 ? "Maximum 6 members allowed." : ""}
        </p>
      </Modal>
    </>
  );
};

export default EditChannel;
