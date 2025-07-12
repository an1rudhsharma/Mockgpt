import { History, Users, NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Route, Routes } from "react-router-dom";
// import DashboardHome from '@/components/dashboard/Home'
import DashboardInterview from "@/components/dashboard/Interview";
import DashboardHistory from "@/components/dashboard/History";
import ReviewPage from "@/components/dashboard/ReviewPage";
import Notfound from "./Notfound";

const sidebarButtons = [
  //     {
  //     id: 1,
  //     icon: <Home className="h-5 w-5 mr-3" />,
  //     title: "Home",
  //     to: '/dashboard'
  // },
  {
    id: 2,
    icon: <NotebookText className="h-5 w-5 mr-3" />,
    title: "Give Interview",
    to: "/dashboard",
  },
  {
    id: 3,
    icon: <History className="h-5 w-5 mr-3" />,
    title: "History",
    to: "/dashboard/history",
  },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#1C1C1C] text-white">
      <aside className="fixed w-64 h-screen bg-[#121212] p-4 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="bg-purple-600 p-1.5 rounded">
            <Users className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">MockGPT</span>
        </Link>
        <nav className="space-y-2">
          {sidebarButtons.map(({ id, icon, title, to }) => (
            <Button
              asChild
              key={id}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2C2C2C]"
            >
              <Link to={to}>
                {icon}
                {title}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 pl-72 overflow-scroll">
        <Routes>
          {/* <Route path='' element={<DashboardHome />} /> */}
          <Route path="" element={<DashboardInterview />} />
          <Route path="history" element={<DashboardHistory />} />
          <Route path="/review/:interviewId" element={<ReviewPage />} />
          <Route path="*" element={<Notfound dashboard={true} />} />
        </Routes>
      </main>
    </div>
  );
}
