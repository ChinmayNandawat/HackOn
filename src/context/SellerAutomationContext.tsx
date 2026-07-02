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

  // Load from localStorage on mount, then sync with server
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
    }
    
    // Fetch fresh rules from server
    fetch("/api/seller-automation-rules")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setRules({
            enabled: data.enabled ?? defaultRules.enabled,
            maxItemValue: data.maxItemValue ?? defaultRules.maxItemValue,
            minTrustScore: data.minTrustScore ?? defaultRules.minTrustScore,
          });
          setIsLoaded(true);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  // Save to localStorage AND server when rules change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
      // Fire and forget save to server
      fetch("/api/seller-automation-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules)
      }).catch(console.error);
    } catch (err) {
      console.error("Failed to save seller automation rules:", err);
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
    if (!item) return false;
    
    // If the return is already processed, rely on the actual DB flag
    if (item.status && item.status !== "processing") {
      return item.flaws_json?.auto_approved === true;
    }

    if (!rules.enabled) return false;
    
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
