import API_CONFIG from '@/config/api.config';
import { PATHS } from '@/config/path.config';
import { getEncodedRedirectUrl } from '@/lib/utils';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import axiosInstance, { onAuthFailure } from '../axios-instance';
import { AUTH_TOKEN_KEY, getStorageItem } from '../storage-manager';
import { AppLoader } from '@/components/ui/loader';

const AuthContext = React.createContext(null);

const ANONYMOUS = { isAuthenticated: false, user: null };

const WithAuthProvider = () => {
  const location = useLocation();
  const { authenticatedUser, authChecked } = useAuthContext();

  if (!authChecked) {
    return <AppLoader />;
  }

  if (!authenticatedUser.isAuthenticated) {
    const redirectUrl = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`${PATHS.SIGN_IN}?${getEncodedRedirectUrl(redirectUrl)}`}
        replace
      />
    );
  }

  if (!authenticatedUser.user) {
    return <AppLoader />;
  }

  return <Outlet />;
};

const AuthContextProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = React.useState(ANONYMOUS);
  const [authChecked, setAuthChecked] = React.useState(false);

  // Loads the profile with the stored access token (the axios client transparently refreshes it
  // through the HttpOnly cookie when it has expired). Resolves with the user or null.
  const refetchCurrentUser = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_CONFIG.USER.PROFILE);
      setAuthenticatedUser({ isAuthenticated: true, user: response.data });
      return response.data;
    } catch {
      setAuthenticatedUser(ANONYMOUS);
      return null;
    } finally {
      setAuthChecked(true);
    }
  }, []);

  React.useEffect(() => {
    if (getStorageItem(AUTH_TOKEN_KEY)) {
      refetchCurrentUser();
    } else {
      setAuthChecked(true); // nothing stored -> anonymous, no request needed
    }
  }, [refetchCurrentUser]);

  // The axios client reports an unrecoverable 401 (refresh failed) -> drop the session in the UI.
  React.useEffect(
    () => onAuthFailure(() => setAuthenticatedUser(ANONYMOUS)),
    []
  );

  const contextValue = {
    authenticatedUser,
    setAuthenticatedUser,
    refetchCurrentUser,
    authChecked,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthContextProvider'
    );
  }
  return context;
}

export { useAuthContext, WithAuthProvider };
export default AuthContextProvider;
