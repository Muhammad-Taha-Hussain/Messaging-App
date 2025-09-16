import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);

        console.log("ok hello", users, onlineUsers);

        dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
        dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
      } catch (error) {
        console.log(error);
      }
    };

    if (userInfo?.id) {
      getContacts();
    }
  }, [userInfo]);

  console.log("userContacts", userContacts);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full cursor-pointer custom-scrollbar">
      {
        filteredContacts && filteredContacts.length > 0 ? 
          filteredContacts.map((contact) => (
          <ChatLIstItem data={contact} key={contact.id} />
           )) :  userContacts.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
             ))
      }
      
    </div>
  );
}

export default List;
