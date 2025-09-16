import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import axios, { all } from "axios";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList() {
  const [{}, dispatch] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchContacts, setSearchContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);

  useEffect(() => {
    if (searchTerm.length) {
      console.log(searchTerm);

      const filteredData = {};
      Object.keys(allContacts).forEach((key) => {
        filteredData[key] = allContacts[key].filter((obj) =>
          obj.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setSearchContacts(filteredData);
    } else {
      setSearchContacts(allContacts);
    }
  }, [searchTerm]);
  useEffect(() => {
    const getContacts = async () => {
      try {
        // Fetch contacts from the server
        const {
          data: { users },
        } = await axios.get(GET_ALL_CONTACTS);
        console.log("Contacts data:", users);
        setAllContacts(users);
        setSearchContacts(users);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    getContacts();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white font-semibold text-lg">
          <BiArrowBack
            className="text-xl cursor-pointer"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })
            }
          />
          <span>New Chat</span>
        </div>
      </div>

      <div className="bg-search-input-container-background h-fulll flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background mx-4 flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
            </div>
            <div className="w-full">
              <input
                input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Contacts"
                className="bg-transparent text-white text-sm focus:outline-none placeholder:text-search-input-placeholder-text w-full"
              />
            </div>
          </div>
        </div>
        {Object.entries(searchContacts).map(([initialLetter, userList]) => {
          return (
            userList.length > 0 && (
              <div
                key={Date.now() + initialLetter}
                className="flex items-center gap-4 px-4 py-3 hover:bg-search-input-container-background cursor-pointer"
              >
                <div className="text-teal-light pl-10 py-5 h-10 w-10">
                  {initialLetter}
                </div>

                {userList.map((contact) => {
                  return (
                    <ChatLIstItem
                      key={contact.id}
                      data={contact}
                      isPageContact={true}
                    />
                  );
                })}
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}

export default ContactsList;
