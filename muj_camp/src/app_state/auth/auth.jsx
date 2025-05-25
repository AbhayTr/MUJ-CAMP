import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import AuthReducer from "./auth_reducer";

const persistConfig = {
    key: "appAuthState",
    storage
};

const AuthPersistedReducer = persistReducer(persistConfig, AuthReducer);

const AuthStore = configureStore({
    reducer: AuthPersistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});

const AuthPersistor = persistStore(AuthStore);

export { AuthStore, AuthPersistor };