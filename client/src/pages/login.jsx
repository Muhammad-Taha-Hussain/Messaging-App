import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

function login() {
  const router = useRouter();

  const [{ newUser, userInfo }, dispatch] = useStateProvider();
  // const storedUser = typeof window !== "undefined" ? localStorage.getItem("userInfo") : null;
  // const userData = storedUser ? JSON.parse(storedUser) : null;

  // console.log("userData from localStorage", userData?.id);

  useEffect(() => {
    console.log("login log", newUser, userInfo);
    
    if (!newUser && userInfo?.id) {
      router.push("/");
    }
  }, [newUser, userInfo, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName: name, email, photoURL: profileImage },
    } = await signInWithPopup(firebaseAuth, provider);

    try {
      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, { email });
        console.log(data);
        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profileImage,
              status: "",
            },
          });
          router.push("/onboarding");
        } else {
          const {id, name, email, profilePicture: profileImage, status} = data.data;
          console.log("values before dispatch", { id, name, email, profileImage, status });

          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id,
              name,
              email,
              profileImage,
              status
            },
          });
          router.push("/");
        }
      }
    } catch (error) {
      console.log(error);
    }
    // console.log({user});
  };
  return (
    <div className="flex justify-center items-center text-white font-bold bg-panel-header-background h-screen w-screen flex-col">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image src={"/whatsapp.gif"} alt="whatsapp" width={300} height={300} />
        <span className="text-7xl">WhatsApp</span>
      </div>
      <button
        className="flex items-center justify-center gap-4 bg-search-input-container-background p-5 rounded-lg"
        onClick={handleLogin}
      >
        <FcGoogle className={"text-4xl"} />
        <span className="text-white text-2xl">Login with Google</span>
      </button>
    </div>
  );
}

export default login;
