import axios, { AxiosRequestConfig } from "axios";
// import { store } from '../../redux/store'
// import { logout } from "../../redux/reducers/authSlice";
import { toast } from "react-hot-toast";

interface Headers {
  [key: string]: string;
}

interface AuthState {
  accessToken: string | null;
  user: Record<string, unknown> | null;
  authenticated: boolean;
}

interface RootState {
  auth: AuthState;
}

const clearLocalStorage = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
}

const performLogout = () => {
    // store.dispatch(logout())
    clearLocalStorage()
}

const redirectToLogin = () => {
    performLogout()
    setTimeout(() => {
        window.location.href = '/';
    }, 3000);
}

const consoleErrorPerformRedirection = (error: Error & { response?: { data?: { message?: string }, status?: number } }, throwError = false, errorToast = true) => {
    console.error("Error:", error?.response?.data?.message)
    if (errorToast) {
        toast.error(error?.response?.data?.message || error.message);
    }
    if (error?.response?.status === 401 || error?.response?.status === 403) {
        redirectToLogin();
    }
    if (throwError) {
        throw error;
    }
}

//Get Method
const getMethod = async (endpoint: string, authentication = true, throwError = false, errorToast = true) => {
    const params: AxiosRequestConfig = {};
    let bearer_token: string | null;
    if (authentication) {
        // const state = store.getState() as unknown as RootState;
        bearer_token = localStorage.getItem('accessToken');

        params.headers = {
            "Authorization": `Bearer ${bearer_token}`
        }
    }
    return await axios.get(endpoint, params)
        .then((res) => {
            return res
        })
        .catch((error) => {
            consoleErrorPerformRedirection(error, throwError, errorToast)
        })
}

// Post Method
const postMethod = async (endpoint: string, authentication = true, data: Record<string, unknown> | null = null, throwError = false, errorToast = true, multipart = false) => {
    const headers: Headers = {};

    if (authentication) {
        // const state = store.getState() as unknown as RootState;
        const bearer_token = localStorage.getItem('accessToken');
        headers["Authorization"] = `Bearer ${bearer_token}`
    }
    if (multipart) {
        headers['content-type'] = 'multipart/form-data'
    }
    return await axios.post(endpoint, data, { headers })
        .then((res) => {
            return res
        })
        .catch((error) => {
            consoleErrorPerformRedirection(error, throwError, errorToast)
        })
}

// Delete Method
const deleteMethod = async (endpoint: string, authentication = true, data: Record<string, unknown> | null = null) => {
    const headers: Headers = {};
    if (authentication) {
        // const state = store.getState() as unknown as RootState;
        const bearer_token = localStorage.getItem('accessToken');
        headers["Authorization"] = `Bearer ${bearer_token}`;
    }

    return await axios.delete(endpoint, {
        headers,
        data
    })
        .then((res) => {
            return res;
        })
        .catch((error) => {
            consoleErrorPerformRedirection(error);
        });
};

//Patch Method
const patchMethod = async (endpoint: string, authentication = true, data: Record<string, unknown> | null = null, multipart = false) => {
    const headers: Headers = {};

    if (authentication) {
        // const state = store.getState() as unknown as RootState;
        const bearer_token = localStorage.getItem('accessToken');
        headers["Authorization"] = `Bearer ${bearer_token}`
    }
    if (multipart) {
        headers['content-type'] = 'multipart/form-data'
    }
    return await axios.patch(endpoint, data, { headers })
        .then((res) => {
            return res
        })
        .catch((error) => {
            consoleErrorPerformRedirection(error)
        })
}

//Put Method
const putMethod = async (endpoint: string, authentication = true, data: Record<string, unknown> | null = null, throwError = false, errorToast = true, multipart = false) => {
    const headers: Headers = {};

    if (authentication) {
        // const state = store.getState() as unknown as RootState;
        const bearer_token = localStorage.getItem('accessToken');
        headers["Authorization"] = `Bearer ${bearer_token}`
    }
    if (multipart) {
        headers['content-type'] = 'multipart/form-data'
    }
    return await axios.put(endpoint, data, { headers })
        .then((res) => {
            return res
        })
        .catch((error) => {
            consoleErrorPerformRedirection(error, throwError, errorToast)
        })
}

export default {
    getMethod,
    postMethod,
    deleteMethod,
    patchMethod,
    putMethod
};