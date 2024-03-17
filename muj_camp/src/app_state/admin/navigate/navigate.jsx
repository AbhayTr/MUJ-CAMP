import { configureStore } from "@reduxjs/toolkit";

import NavigateReducer from "./navigate_reducer";

const NavigateStore = configureStore({
    reducer: NavigateReducer
});

export default NavigateStore;