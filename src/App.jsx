import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "@/context/AuthProvider";
import CartProvider from "@/context/CartProvider";
import ScrollToTop from "@/components/common/ScrollToTop";
import HomePage from "@/HomePage";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Pedido from "./pages/Pedido";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddressFormPage from "./pages/AddressFormPage";
import UserAddressesPage from "./pages/UserAddressesPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Layout from "./components/layout/Layout";
import "./styles/notifications.css";
import "./styles/global.css";
import "./App.css";
import AppContent from "./AppContent";
import WhatsappFloatingButton from "./components/features/user/WhatsappFloatingButton";

// Helper functions for analytics
const searchEngines = [
  { name: "Google", domains: ["google."] },
  { name: "Bing", domains: ["bing.com"] },
  { name: "DuckDuckGo", domains: ["duckduckgo.com"] },
  { name: "Yahoo", domains: ["yahoo.com"] },
  { name: "Baidu", domains: ["baidu.com"] },
  { name: "Yandex", domains: ["yandex.com"] },
];

const getReferrerInfo = (referrerUrl) => {
  if (!referrerUrl)
    return {
      isSearchEngine: false,
      searchEngineName: null,
      referrerDomain: null,
    };

  try {
    const url = new URL(referrerUrl);
    const domain = url.hostname;

    for (const se of searchEngines) {
      if (se.domains.some((d) => domain.includes(d))) {
        return {
          isSearchEngine: true,
          searchEngineName: se.name,
          referrerDomain: domain,
        };
      }
    }
    return {
      isSearchEngine: false,
      searchEngineName: null,
      referrerDomain: domain,
    };
  } catch (e) {
    console.error("Error parsing referrer URL:", e);
    return {
      isSearchEngine: false,
      searchEngineName: null,
      referrerDomain: referrerUrl,
    };
  }
};

const getUtmParameters = (searchString) => {
  const params = new URLSearchParams(searchString);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
  };
};

function App() {
  useEffect(() => {
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    const referrerInfo = getReferrerInfo(referrer);
    const utmParams = getUtmParameters(window.location.search);

    const visitData = {
      referrerUrl: referrer || "direct",
      referrerDomain: referrerInfo.referrerDomain || "direct",
      isSearchEngine: referrerInfo.isSearchEngine,
      searchEngineName: referrerInfo.searchEngineName,
      currentUrl: currentUrl,
      ...utmParams,
      timestamp: new Date().toISOString(),
    };

    // Send data to your backend analytics endpoint
    const sendAnalyticsData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/analytics/visit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(visitData),
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to send analytics data:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error sending analytics data:", error);
      }
    };

    sendAnalyticsData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <WhatsappFloatingButton />
    </>
  );
}

export default App;
