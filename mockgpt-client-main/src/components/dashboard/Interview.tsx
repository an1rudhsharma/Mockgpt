import { Database, LayoutDashboard, LineChart, FileSpreadsheet, Pi, FileJson } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
const interviewCards = [
    { icon: <LayoutDashboard className="h-24 w-24" />, label: "Frontend", to: 'frontend-development-interview' },
    { icon: <FileJson className="h-24 w-24" />, label: "Backend", to: 'backend-development-interview' },
    { icon: <Pi className="h-24 w-24" />, label: "Product", to: 'product-interview' },
    { icon: <LineChart className="h-24 w-24" />, label: "Data Science", to: 'dataScience-interview' },
    { icon: <FileSpreadsheet className="h-24 w-24" />, label: "Analytics", to: 'analytics-interview' },
    { icon: <Database className="h-24 w-24" />, label: "System Design ", to: 'backend-development-interview' },
]

const DashboardInterview = () => {
    return (
        <div className='p-6'>
            <h1 className="text-3xl font-bold mb-2 text-center">1:1 interview with instant feedback using AI</h1>
            <p className="text-xl text-gray-400 mb-12 text-center">Choose your desired profile</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {interviewCards.map((item, index) => (
                    <Link key={index} to={`/interview/${item.to}`} >
                        <Card className="bg-[#2C2C2C] text-white border-0 p-6 flex flex-col items-center gap-4 hover:bg-[#3C3C3C] cursor-pointer transition-colors">
                            {item.icon}
                            <h2 className="font-semibold text-2xl text-center">{item.label}</h2>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default DashboardInterview
