import { useMutation } from '@tanstack/react-query';
import { checkUser, onboardUser, editOnboardUser } from '@/api/auth.api';

export function useCheckUser() {
  return useMutation({
    mutationFn: checkUser,
  });
}

export function useOnboardUser() {
  return useMutation({
    mutationFn: onboardUser,
  });
}

export function useEditOnboardUser() {
  return useMutation({
    mutationFn: editOnboardUser,
  });
}
