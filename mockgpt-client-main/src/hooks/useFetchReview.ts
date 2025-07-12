import InterviewAPI from "@/api/InterviewAPI";
import { AxiosError } from "axios";
import { useState } from "react"

const useFetchReview = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getReview = async (interviewId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await InterviewAPI.getReviewById(interviewId)
            if (response.status == 200) {
                return response.data
            } else {
                throw new Error('Something went wrong')
            }
        } catch (err: unknown) {
            let error;
            if (err instanceof AxiosError) {
                error = err.response?.data?.message
            } else {
                error = "Failed to get Review";
            }
            // toast({
            //     description: error,
            //     variant: 'destructive',
            // })
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const getAllReviews = async (userId:string)=>{
        setLoading(true);
        setError(null);
        try {
            const response = await InterviewAPI.getReviewsByUserId(userId)
            if (response.status == 200) {
                return response.data
            } else {
                throw new Error('Something went wrong')
            }
        } catch (err: unknown) {
            let error;
            if (err instanceof AxiosError) {
                error = err.response?.data?.message
            } else {
                error = "Failed to get Reviews";
            }  // toast({
                //     description: error,
                //     variant: 'destructive',
                // })
                setError(error);
            } finally {
                setLoading(false);
            }
    }

    return { getReview,getAllReviews, loading, error }
}

export default useFetchReview