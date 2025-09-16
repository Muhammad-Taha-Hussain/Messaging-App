import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useStateProvider } from "@/context/StateContext";
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";

function onboarding() {
  const router = useRouter();
  const [{userInfo, newUser}, dispatch] = useStateProvider();
  console.log(userInfo, newUser);
  

  const [name, setName] = useState(userInfo?.name || "");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState(userInfo?.profileImage || "/default_avatar.png");


  useEffect(() => {
    if(!newUser && !userInfo?.email) {
      router.push("/login");
    } else if(!newUser && userInfo?.email) {
      console.log(newUser, userInfo);
      
      router.push("/");
    }
  }, [newUser, userInfo, router]);

  const onBoardUserHandler = async () => {
    if(validateDetails()) {
      try {
        const email = userInfo?.email;
        console.log(email, name, about, image);
        

        const {data} = await axios.post(ONBOARD_USER_ROUTE, { name, about, email, image });
        console.log(data);
        
        if(data.status) {
          const {id} = data.user;

          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false })
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id, name, email, profileImage: image, status: about
            }
          })
          router.push("/");
        }
      } catch (error) {
        console.log(error);
        
      }
      
    }
  }
  const validateDetails = () => {
    if(!name || name.length < 3) {
      alert("Name is required and should be more than 3 characters");
      return false;
    } else if(!about) {
      alert("About is required");
      return false;
    }
    return true;
  }
  return (
    <div className="flex justify-center items-center text-white font-bold bg-panel-header-background h-screen w-screen flex-col">
      <div className="flex items-center justify-center gap-2">
        <Image src={"/whatsapp.gif"} width={250} height={250} alt="whatsapp" />
        <span className="text-7xl">WhatsApp</span>
      </div>
      <h2 className="text-2xl">Create your profile</h2>

      <div className="flex gap-6 mt-2">
        <div className="flex flex-col items-center justify-center gap-6">
          <Input name={"Display Name"} state={name} setState={setName} label />
          <Input name={"About"} state={about} setState={setAbout} label />
          <div className="flex justify-center items-center">
            <button className="flex items-center justify-center gap-4 bg-search-input-container-background p-5 rounded-lg" onClick={onBoardUserHandler}>Create Profile</button>
          </div>
        </div>
        <div>
          <Avatar type={"xl"} image={image} setImage={setImage} />
        </div>
      </div>
    </div>
  );
}

export default onboarding;
