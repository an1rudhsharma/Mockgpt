import api from "./configs/axiosConfigs";

const UserAPI = {
  signup: async (
    name: string,
    email: string,
    password: string,
    mobile: string
  ) => {
    const response = await api.request({
      url: "/signup",
      method: "POST",
      data: {
        name,
        email,
        password,
        mobile,
      },
    });
    return response;
  },
  signin: async (email: string, password: string) => {
    const response = await api.request({
      url: "/signin",
      method: "POST",
      data: {
        email,
        password,
      },
      withCredentials: true,
    });
    return response;
  },
  verifyMe: async () => {
    const response = await api.request({
      url: "/me",
      method: "GET",
      withCredentials: true,
    });
    return response;
  },
};

export default UserAPI;
