import React from "react";
import { useStateProvider } from "@/context/StateContext";
import Main from "@/components/Main";
function index() {
    const [{ newUser, userInfo }, dispatch] = useStateProvider();
  
    console.log("index log", newUser, userInfo);
    
  return <Main />;
}

export default index;
