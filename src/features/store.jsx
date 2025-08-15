import { configureStore } from "@reduxjs/toolkit";
import themesliceReducer from "./themeslice"; // Import the reducer from the slice

export const store = configureStore({
    reducer: {
        themeKey: themesliceReducer, // Correctly reference the reducer
    },
});
