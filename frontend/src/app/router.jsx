import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Home from './home';
import SearchPage from './search';
import HotelDetails from './hotel-details';
import { SignInPage, SignUpPage } from './auth';
import { PATHS } from '@/config/path.config';
import WithSearchLayout from '@/components/layouts/with-search-layout';
import CheckoutPage from './checkout';
import { WithAuthProvider } from '@/lib/providers/auth-context-provider';
import PaymentStatus from './payments';
import SettingsLayout from './settings/settings-layout';
import Profile from './settings/profile';
import BookingHistory from './settings/booking-history';
import TravelersManagement from './settings/travellers';
import RegularUserLayout from '@/components/layouts/regular-user.layout';
import { WithAdminProvider } from '@/lib/providers/admin-context-provider';
import Hotels from './admin/hotels';
import Admin from './admin';
import CreateHotel from './admin/create-hotels';
import AdminLayout from '@/components/layouts/admin.layout';
import Overview from './admin/overview';
import Bookings from './admin/bookings';
import Rooms from './admin/rooms';
import EditHotel from './admin/edit-hotel';
import CreateRoom from './admin/create-room';
import EditRoom from './admin/edit-room';
import Inventory from './admin/inventory';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RegularUserLayout />}>
          <Route index element={<Home />} />

          <Route element={<WithSearchLayout />}>
            <Route path={PATHS.SEARCH} element={<SearchPage />} />
            <Route path={PATHS.HOTEL} element={<HotelDetails />} />
          </Route>

          <Route path={PATHS.SIGN_IN} element={<SignInPage />} />
          <Route path={PATHS.SIGN_UP} element={<SignUpPage />} />

          <Route element={<WithAuthProvider />}>
            <Route path={PATHS.CHECKOUT} element={<CheckoutPage />} />
            <Route path={PATHS.PAYMENTS_STATUS} element={<PaymentStatus />} />

            <Route element={<SettingsLayout />}>
              <Route path={PATHS.SETTINGS.PROFILE} element={<Profile />} />
              <Route
                path={PATHS.SETTINGS.BOOKING_HISTORY}
                element={<BookingHistory />}
              />
              <Route
                path={PATHS.SETTINGS.TRAVELERS_MANAGEMENT}
                element={<TravelersManagement />}
              />
            </Route>
          </Route>
        </Route>
        <Route element={<WithAuthProvider />}>
          <Route element={<WithAdminProvider />}>
            <Route path={PATHS.ADMIN.LIST_HOTELS} element={<Admin />}>
              <Route index element={<Hotels />} />
              <Route
                path={PATHS.ADMIN.CREATE_HOTEL}
                element={<CreateHotel />}
              />
            </Route>
            <Route path={PATHS.ADMIN.DASHBOARD.ROOT} element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to={PATHS.ADMIN.DASHBOARD.OVERVIEW} />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.OVERVIEW}
                element={<Overview />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.BOOKINGS}
                element={<Bookings />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.ROOMS.ROOT}
                element={<Rooms />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.ROOMS.CREATE}
                element={<CreateRoom />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.ROOMS.EDIT_ROOM}
                element={<EditRoom />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.ROOMS.INVENTORY}
                element={<Inventory />}
              />
              <Route
                path={PATHS.ADMIN.DASHBOARD.EDIT_HOTEL}
                element={<EditHotel />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
