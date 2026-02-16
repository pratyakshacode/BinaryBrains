/**
 * Contains the custom hook to send the various requests to the server like get, post, put and delete
 */

import axios from 'axios';

// backend url to request the data
const REQUEST_URL =
    import.meta.env.VITE_REQUEST_URL ?? 'http://localhost:3000/api/';

// Create a pre-configured axios instance
const axiosClient = axios.create({
    baseURL: REQUEST_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const useRequest = () => {
    return {
        get: async (url: string) => {
            return (await axiosClient.get(url)).data;
        },

        post: async (url: string, data: unknown) => {
            return (await axiosClient.post(url, data)).data;
        },

        put: async (url: string, data: unknown) => {
            return (await axiosClient.put(url, data)).data;
        },

        delete: async (url: string) => {
            return (await axiosClient.delete(url)).data;
        },

        patch: async (url: string, data: unknown) => {
            return (await axiosClient.patch(url, data)).data;
        },
    };
};
