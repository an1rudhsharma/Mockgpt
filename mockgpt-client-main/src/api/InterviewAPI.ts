import api from './configs/axiosConfigs';

const InterviewAPI = {
    getReviewById: async (interviewId: string) => {
        const response = await api.request({
            url: `/interview-review/${interviewId}`,
            method: 'GET',
            withCredentials: true
        });
        return { data: response.data.data, status: response.status };
    },
    getReviewsByUserId: async (userId: string) => {
        const response = await api.request({
            url: `/user-interview-reviews/${userId}`,
            method: 'GET',
            withCredentials: true
        });
        return { data: response.data.data, status: response.status };
    },
}

export default InterviewAPI