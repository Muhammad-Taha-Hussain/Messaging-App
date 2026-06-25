import React from 'react';
import ChatHeader from './chat-header';
import ChatContainer from './chat-container';
import MessageBar from './message-bar';

function Chat() {
  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] z-10">
      <ChatHeader />
      <ChatContainer />
      <MessageBar />
    </div>
  );
}

export default Chat;
