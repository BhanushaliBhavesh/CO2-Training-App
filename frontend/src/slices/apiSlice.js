import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // Use the Environment Variable if it exists (Production), otherwise use Localhost (Development)
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Session"], // Added 'Session' tag here just to be safe
  endpoints: (builder) => ({}),
});


