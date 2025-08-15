import { createSlice } from "@reduxjs/toolkit";

export const themeslice = createSlice({
    name: "themeslice",
    initialState: { value: true }, // Use an object to allow Immer to handle updates
    reducers: {
        toggletheme: (state) => {
            state.value = !state.value; // Update the state using Immer's mutation handling
        },
    },
});

// Export the action and reducer
export const { toggletheme } = themeslice.actions;
export default themeslice.reducer;
