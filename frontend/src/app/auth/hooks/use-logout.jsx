import API_CONFIG from "@/config/api.config";
import { PATHS } from "@/config/path.config";
import useMutation from "@/lib/hooks/useMutation";
import { useAuthContext } from "@/lib/providers/auth-context-provider";
import { AUTH_TOKEN_KEY, removeStorageItem } from "@/lib/storage-manager";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function useLogoutHandler() {

  const navigate = useNavigate();
  const {setAuthenticatedUser} = useAuthContext();

  const {mutate, pending} = useMutation(API_CONFIG.AUTH.LOGOUT, 'POST');

  const clearLocalSession = () => {
    removeStorageItem(AUTH_TOKEN_KEY);
    setAuthenticatedUser({ isAuthenticated: false, user: null });
    navigate(PATHS.LANDING, {replace: true});
  };

  // The server call clears the HttpOnly refresh cookie (JS cannot). Tokens are stateless JWTs, so the local
  // session is ALWAYS cleared, even if the server cannot be reached.
  const logoutHandler = () => {
    mutate(null, {
      onSuccess: () => {
        clearLocalSession();
        toast("Logged out successfully", { type: 'success' });
      },
      onError: (error) => {
        clearLocalSession();
        toast('Logged out on this device', {
          type: 'warning',
          description: `The server could not be told to end the session: ${error.message}`
        });
      }
    })
  }

  return {logoutHandler, pending}

}
