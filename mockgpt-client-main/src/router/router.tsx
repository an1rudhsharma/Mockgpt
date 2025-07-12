import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home';
import LoginPage from '@/pages/Login';
import SignUpPage from '@/pages/Signup';
import Notfound from '@/pages/Notfound';
import Public from './public';
import Protected from './protected';
import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loader';
import ComingSoonPage from '@/pages/ComingSoon';

const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const InterviewPage = React.lazy(() => import('@/pages/InterviewScreen'));

const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/'>
        <Route path='/' element={<Home />} />
        <Route element={<Public />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignUpPage />} />
        </Route>
        <Route element={<Protected />}>
            <Route path='dashboard/*' element={<Suspense fallback={<div className='h-screen flex justify-center items-center'><LoadingSpinner className='w-20 h-20' /></div>}><Dashboard /></Suspense>} />
            <Route path='/interview/:type' element={<Suspense fallback={<div className='h-screen flex justify-center items-center'><LoadingSpinner className='w-20 h-20' /></div>}><InterviewPage /></Suspense>} />
        </Route>
        <Route path='/book-a-demo' element={<ComingSoonPage/>}/>
        <Route path='/contact-us' element={<ComingSoonPage/>}/>
        <Route path='/about-us' element={<ComingSoonPage/>}/>
        <Route path='/privacy-policy' element={<ComingSoonPage/>}/>
        <Route path='/terms-and-conditions' element={<ComingSoonPage/>}/>
        <Route path='/*' element={<Notfound />} />
    </Route>
))


const Index = () => {
    return <RouterProvider router={router} />
}

export default Index
