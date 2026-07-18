import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SellerHeader from "../sellerRoutes/SellerHeader";
import { listenForForegroundMessages } from "../firebaseConfig";

const SellerLayout = () => {
  // See UserLayout.js - foreground FCM messages don't auto-display, so we
  // have to show them ourselves via the Notification API.
  useEffect(() => {
    const unsubscribe = listenForForegroundMessages((payload) => {
      // Server sends data-only messages (see server/utils/pushNotification.js),
      // so title/body/icon live in payload.data, not payload.notification.
      const { title, body, icon } = payload.data || {};
      if (!title) return;

      if (Notification.permission === "granted") {
        new Notification(title, {
          body: body || "",
          icon: icon || "/logo192.png",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <SellerHeader />
      <Outlet />
    </>
  );
};

export default SellerLayout;
