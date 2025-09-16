import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsFilter } from "react-icons/bs";

function SearchBar() {

  const [{contactsSearch}, dispatch] = useStateProvider();
  return (
    <div className="bg-search-input-container-background flex py-3 px-5 items-center gap-3 h-14">
      <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
        <div>
          <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
        </div>
        <div>
          <input
            input
            type="text"
            value={contactsSearch}
            onChange={(e) => dispatch({ type: reducerCases.SET_CONTACTS_SEARCH, contactSearch: e.target.value })}
            placeholder="Search or start new chat"
            className="bg-transparent text-white text-sm focus:outline-none placeholder:text-search-input-placeholder-text w-full"
          />
        </div>
      </div>
      <div className="pr-5 pl-3">
        <BsFilter title="New Group" className="text-panel-header-icon cursor-pointer text-xl" />

      </div>
    </div>
  );
}

export default SearchBar;
