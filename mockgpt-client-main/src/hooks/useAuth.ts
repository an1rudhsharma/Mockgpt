import UserAPI from "@/api/UserAPI";
import { useAuthContext } from "@/context/AuthContext";
import { AxiosError } from "axios";
import { useState } from "react";

const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserAPI.signin(email, password);
      if (data.status == 200) {
        login(data.data.user);
      }
      return data.status;
    } catch (err: unknown) {
      let error;
      if (err instanceof AxiosError) {
        error = err.response?.data?.message;
      } else {
        error = "Login failed";
      }
      // toast({
      //     description: error,
      //     variant: 'destructive',
      // })
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async ({
    name,
    email,
    password,
    mobile,
  }: {
    name: string;
    email: string;
    password: string;
    mobile: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserAPI.signup(name, email, password, mobile);
      // toast({
      //     description: 'Registration Successful',
      //     className: 'bg-green-500 text-white',
      // })
      return data.status;
    } catch (err: unknown) {
      let error;
      if (err instanceof AxiosError) {
        error = err.response?.data?.message;
      } else {
        error = "Registeration failed";
      }
      // toast({
      //     description: error,
      //     variant: 'destructive',
      // })
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, loading, error };
};

export default useAuth;
