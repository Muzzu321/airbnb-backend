package com.muzammil.projects.airBnbApp.strategy;

import com.muzammil.projects.airBnbApp.entity.Inventory;

import java.math.BigDecimal;
public interface PricingStrategy {

    BigDecimal calculatePrice(Inventory inventory);
}
