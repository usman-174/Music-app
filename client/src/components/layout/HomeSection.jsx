import React from "react";
import { useSocketStore } from "../../store/store";
import Channels from "../channels/Channels";
import ChatContainer from "../channels/chat/ChatContainer";
import Peoples from "../people/Peoples";

const HomeSection = () => {
  const { socket } = useSocketStore();
  return (
    <div className="md:container md:mx-auto p-3">
      <section
        className="flex flex-col items-center justify-center
       md:justify-normal md:flex-row gap-5 md:gap-10 md:items-start "
      >
        <Peoples />

        {socket ? (
          <>
          
            <Channels />
            <ChatContainer />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default HomeSection;
