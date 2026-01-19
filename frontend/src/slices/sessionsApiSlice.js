import { apiSlice } from "./apiSlice";

export const sessionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query({
      query: () => "/api/sessions",
      providesTags: ["Session"],
    }),
    createSession: builder.mutation({
      query: (data) => ({
        url: "/api/sessions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useGetSessionsQuery, useCreateSessionMutation } =
  sessionsApiSlice;
