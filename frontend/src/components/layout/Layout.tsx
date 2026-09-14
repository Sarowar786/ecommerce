"use client";

import { persistor, store } from "@/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthSync from "@/components/common/AuthSync";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthSync />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default Layout;
