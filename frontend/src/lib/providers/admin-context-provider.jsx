import React, { createContext } from 'react';
import { isAdmin } from '../utils';
import { useAuthContext } from './auth-context-provider';
import { Navigate, Outlet, useParams } from 'react-router';
import useQuery from '../hooks/useQuery';
import { AppLoader } from '@/components/ui/loader';
import ApiError from '@/components/api-error';
import API_CONFIG from '@/config/api.config';

const AdminContext = createContext();

// Frontend guard only: the backend independently enforces ROLE_HOTEL_MANAGER on /admin/**
// and hotel ownership on every hotel-specific route.
const WithAdminProvider = () => {
  const { authenticatedUser } = useAuthContext();

  if (!isAdmin(authenticatedUser.user)) return <Navigate to={'/'} />;

  return <Outlet />;
};

const AdminContextProvider = ({ children }) => {
  const { hotelId } = useParams();
  const { data, pending, error, errorInfo, refetchQuery } = useQuery({
    url: API_CONFIG.ADMIN.HOTEL(hotelId),
  });

  if (pending && !data) return <AppLoader />;

  if (error || !data) {
    const title =
      errorInfo?.status === 404
        ? 'Hotel not found'
        : errorInfo?.status === 403
          ? 'Not your hotel'
          : undefined;
    return <ApiError errorName={title} errorMessage={error} />;
  }

  const contextValue = {
    hotel: data,
    isLoading: false,
    error: null,
    refetchHotel: refetchQuery,
  };

  return <AdminContext value={contextValue}>{children}</AdminContext>;
};

function useAdminContext() {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error(
      'useAdminContext must be used within a AdminContextProvider'
    );
  }
  return context;
}

export { WithAdminProvider, AdminContextProvider, useAdminContext };
