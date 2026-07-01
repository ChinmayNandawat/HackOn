"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateBuyerTrustScore, BuyerTrustProfile } from "@/lib/trustScore";

export interface AutomationRules {
  enabled: boolean;
  maxItemValue: number; // in INR (e.g., 5000 INR ~= $60 USD)
  minTrustScore: number; // percentage (e.g., 80 for 80%)
}

interface SellerAutomationContextType {
  rules: AutomationRules;
  setEnabled: (enabled: boolean) => void;
  setMaxItemValue: (val: number) => void;
  setMinTrustScore: (val: number) => void;
  isReturnAutoApproved: (item: any) => boolean;
}

const STORAGE_KEY = "relife_seller_automation_rules";

const defaultRules: AutomationRules = {
  enabled: true,
  maxItemValue: 5000, // ₹5,000 (~$60 USD)
  minTrustScore: 80,  // 80% Trust Score
};

const SellerAutomationContext = createContext<SellerAutomationContextType | undefined>(undefined);

export function SellerAutomationProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<AutomationRules>(defaultRules);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules({
          enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : defaultRules.enabled,
          maxItemValue: typeof parsed.maxItemValue === "number" ? parsed.maxItemValue : defaultRules.maxItemValue,
          minTrustScore: typeof parsed.minTrustScore === "number" ? parsed.minTrustScore : defaultRules.minTrustScore,
        });
      }
    } catch (err) {
      console.error("Failed to load seller automation rules from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when rules change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch (err) {
      console.error("Failed to save seller automation rules to localStorage:", err);
    }
  }, [rules, isLoaded]);

  const setEnabled = (enabled: boolean) => {
    setRules((prev) => ({ ...prev, enabled }));
  };

  const setMaxItemValue = (val: number) => {
    setRules((prev) => ({ ...prev, maxItemValue: val }));
  };

  const setMinTrustScore = (val: number) => {
    setRules((prev) => ({ ...prev, minTrustScore: val }));
  };

  const isReturnAutoApproved = (item: any): boolean => {
    if (!rules.enabled || !item) return false;
    
    // Check item value
    const price = item.products?.original_price || 0;
    if (price > rules.maxItemValue) return false;

    // Check buyer trust score
    const profile: BuyerTrustProfile = calculateBuyerTrustScore(item);
    if (profile.score < rules.minTrustScore) return false;

    return true;
  };

  return (
    <SellerAutomationContext.Provider
      value={{
        rules,
        setEnabled,
        setMaxItemValue,
        setMinTrustScore,
        isReturnAutoApproved,
      }}
    >
      {children}
    </SellerAutomationContext.Provider>
  );
}

export function useSellerAutomation() {
  const context = useContext(SellerAutomationContext);
  if (!context) {
    throw new Error("useSellerAutomation must be used within a SellerAutomationProvider");
  }
  return context;
}
