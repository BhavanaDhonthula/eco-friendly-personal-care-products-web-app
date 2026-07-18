import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../userRoutes/Header";
import Footer from "../components/footer";
import { listenForForegroundMessages } from "../firebaseConfig";

const UserLayout = () => {
  // FCM only auto-shows a system notification via the service worker when
  // the tab is backgrounded/closed. When the tab is open and focused,
  // Firebase routes the message through onMessage instead - without this,
  // that message arrived silently and nothing was ever shown to the user.
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
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default UserLayout;
