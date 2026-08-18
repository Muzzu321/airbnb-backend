package com.muzammil.projects.airBnbApp.service;

import com.muzammil.projects.airBnbApp.entity.Booking;

public interface CheckoutService {

    String getCheckoutSession(Booking booking, String successUrl, String failureUrl);

}
