import Avatar from '@/components/common/Avatar';
import Input from '@/components/common/Input';
import { useStateProvider } from '@/context/state-context';
import { useOnboardUser, useEditOnboardUser } from '@/hooks/use-auth-api';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { reducerCases } from '@/context/constants';
import { setAuthSessionCookie } from '@/lib/auth-session';

function Onboarding() {
  const router = useRouter();
  const isEdit = router.query.mode === 'edit';
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const { mutateAsync: onboardUser } = useOnboardUser();
  const { mutateAsync: editOnboardUser } = useEditOnboardUser();

  const [name, setName] = useState(userInfo?.name || '');
  const [about, setAbout] = useState(userInfo?.status || '');
  const [image, setImage] = useState(userInfo?.profileImage || '/default_avatar.png');
  const [ready, setReady] = useState(Boolean(newUser && userInfo?.email));

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (isEdit) {
      setReady(true);
      return;
    }

    if (!newUser && !userInfo?.email) {
      router.replace('/login');
      return;
    }

    if (!newUser && userInfo?.id) {
      router.replace('/');
      return;
    }

    if (newUser && userInfo?.email) {
      setReady(true);
    }
  }, [router.isReady, isEdit, newUser, userInfo]);

  const onBoardUserHandler = async () => {
    if (validateDetails()) {
      try {
        const email = userInfo?.email;

        const data = await onboardUser({
          name,
          about,
          email,
          image,
        });
        if (data.status) {
          const { id } = data.user;

          const completedUser = {
            id,
            name,
            email,
            profileImage: image,
            status: about,
          };

          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: completedUser,
          });
          setAuthSessionCookie(completedUser);
          router.replace('/');
        }
      } catch (error) {
        console.error('Onboarding failed:', error);
      }
    }
  };

  const validateDetails = () => {
    if (!name || name.length < 3) {
      alert('Name is required and should be more than 3 characters');
      return false;
    } else if (!about) {
      alert('About is required');
      return false;
    }
    return true;
  };
  if (!ready) {
    return null;
  }

  const updateProfile = async () => {
    // if (!validateDetails()) return;
  console.log(userInfo)
    try {
      const data = await editOnboardUser({
        id: userInfo?.id,
        payload: {
          name,
          about,
          image,
        },
      });
  
      if (data.status) {
        const updatedUser = {
          ...userInfo,
          name,
          status: about,
          profileImage: image,
        };
  
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: updatedUser,
        });
  
        setAuthSessionCookie(updatedUser);
  
        router.push('/');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (isEdit) {
      await updateProfile();
    } else {
      await onBoardUserHandler();
    }
  };

  return (
    <div className="min-h-screen bg-panel-header-background text-white flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center pb-6-6">
        {isEdit && (
          <button
            onClick={() => router.back()}
            className="absolute left-8 text-lg hover:text-gray-300 transition-colors"
          >
            ← Back
          </button>
        )}

        <div className="flex items-center gap-3">
          <Image src="/whatsapp.gif" width={120} height={120} alt="whatsapp" />
          <span className="text-5xl font-bold">WhatsApp</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-search-input-container-background rounded-2xl p-10 shadow-lg w-full max-w-4xl">
          <h2 className="text-3xl text-center mb-10">
            {isEdit ? 'Profile Settings' : 'Create Profile'}
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar type="xl" image={image} setImage={setImage} />
              <p className="text-sm text-gray-400 mt-3">Click to change photo</p>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-6 w-full max-w-md">
              <Input name="Display Name" state={name} setState={setName} label />

              <Input name="About" state={about} setState={setAbout} label />

              <button
                className="
                w-full
                bg-green-600
                hover:bg-green-500
                transition-colors
                py-4
                rounded-lg
                font-semibold
              "
                onClick={handleSubmit}
              >
                {isEdit ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
