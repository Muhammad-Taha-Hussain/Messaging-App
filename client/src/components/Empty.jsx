import Image from "next/image";
import React from "react";

function Empty() {
  return <div className="border-conversation-border border-l-2 w-full bg-panel-header-background flex flex-col items-center justify-center h-[100vh] border-b-2 border-b-icon-green">
    <Image src={"/whatsapp.gif"} alt="Whatsapp" height={300} width={300} />
  </div>;
}

export default Empty;
