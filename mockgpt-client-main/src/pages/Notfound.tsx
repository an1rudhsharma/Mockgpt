import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Notfound = ({ dashboard = false }: { dashboard?: boolean }) => {
    const navigate = useNavigate()
    return (
        <div className={`min-h-screen ${!dashboard ? 'bg-[#0A0A0A]' : "bg-[#1C1C1C]"} text-white flex flex-col items-center justify-center relative`}>
            <div className="relative z-10 text-center space-y-6">
                <div className="flex items-center justify-center mb-8">
                </div>
                <h1 className="text-6xl font-bold">404</h1>
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>
                <Button className="mt-8" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Previous
                </Button>
            </div>
        </div>
    )
}

export default Notfound
