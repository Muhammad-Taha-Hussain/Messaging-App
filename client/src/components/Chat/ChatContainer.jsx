import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });

function ChatContainer() {
  const [{ allMessages, currentChatUser, userInfo }, dispatch] =
    useStateProvider();
  const scrollRef = useRef(null);

  // console.log("all mess", allMessages, currentChatUser);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);

  return (
    <>
      {/* Background */}
      <div className="absolute bg-fixed inset-0 bg-chat-background opacity-5 z-0"></div>
      <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
        <div className="mx-10 my-6 relative bottom-0 z-100 left-0">
          {/* Messages container */}
          <div className="relative z-10 flex w-full">
            <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
              {allMessages.map((message) => (
                <div
                  key={message?.id}
                  className={`flex ${
                    message?.senderId === currentChatUser?.id &&
                    message?.senderId !== userInfo?.id
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {message?.type === "text" && (
                    <div
                      className={`px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                        message.senderId === currentChatUser.id &&
                        message?.senderId !== userInfo?.id
                          ? "bg-incoming-background text-white"
                          : "bg-outgoing-background text-white"
                      }`}
                    >
                      <span className="break-all">{message.message}</span>
                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                          {calculateTime(message.createdAt)}
                        </span>
                        <span>
                          {message.senderId === userInfo.id && (
                            <MessageStatus
                              MessageStatus={message.messageStatus}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {message?.type === "image" && (
                    <ImageMessage message={message} />
                  )}

                  {message?.type === "audio" && (
                    <VoiceMessage message={message} />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 👇 Dummy div for scroll */}
          <div ref={scrollRef}></div>
        </div>
      </div>
    </>
  );
}

export default ChatContainer;
