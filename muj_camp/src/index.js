import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "./tools/init";
import { Home as RootHome } from "./pages/home/Home";
import { Home as AppHome } from "./pages/app/Home";
import { AuthStore, AuthPersistor } from "./app_state/auth/auth";
import NavigateStore from "./app_state/admin/navigate/navigate";
import AdminLayout from "./custom_components/Admin";
import Error404 from "./custom_components/404";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Provider store={AuthStore}>
        <PersistGate loading={null} persistor={AuthPersistor}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path={`${process.env.REACT_APP_PATH_ROOT}/`}
                        element={<RootHome/>}
                    />
                    <Route
                        path={`${process.env.REACT_APP_PATH_ROOT}/home`}
                        element={<AppHome/>}
                    />
                    <Route
                        path={`${process.env.REACT_APP_PATH_ROOT}/admin/*`}
                        element={
                            <Provider store={NavigateStore}>
                                <AdminLayout />
                            </Provider>
                        }
                    />
                    <Route
                        path={`${process.env.REACT_APP_PATH_ROOT}/down`}
                        element={
                            <>Down!</>
                        }
                    />
                    <Route
                        path={`${process.env.REACT_APP_PATH_ROOT}/*`}
                        element={<Error404 />}
                    />
                </Routes>
            </BrowserRouter>
            <ToastContainer
                position="top-right"
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
            />
        </PersistGate>
    </Provider>
);