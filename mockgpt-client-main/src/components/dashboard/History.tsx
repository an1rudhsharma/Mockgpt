import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import useFetchReview from "@/hooks/useFetchReview";
import { useAuthContext } from "@/context/AuthContext";
import { Interview } from "@/interfaces/types";

const DashboardHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[] | []>([]);
  const { user } = useAuthContext();
  const { getAllReviews, loading } = useFetchReview();

  useEffect(() => {
    if (user) {
      getAllReviews(user.userId).then((data) => {
        setInterviews(data);
      });
    }
  }, [user]);

  if (loading) {
    return <div>Loading....</div>;
  }
  return (
    <div className="text-white">
      <div className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Recent Interviews</h2>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.interviewId}
              className="flex items-center justify-between p-4  rounded-lg shadow hover:bg-neutral-900 transition cursor-pointer bg-[#2C2C2C] border-[#3D3D3D] text-white"
              onClick={() =>
                navigate(`/dashboard/review/${interview.interviewId}`)
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#3D3D3D] border-[#3D3D3D] text-white rounded-full flex items-center justify-center">
                  {interview.interviewType.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    {interview.interviewType} Interview
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-sm text-gray-500">
                  {Boolean(interview.duration.hours) &&
                    `${interview.duration.hours} hrs `}
                  {Boolean(interview.duration.minutes) &&
                    `${interview.duration.minutes} mins `}
                  {Boolean(interview.duration.seconds) &&
                    `${interview.duration.seconds} secs`}
                </div>
                <div className="text-sm text-gray-500">{interview.date}</div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHistory;
