import { useState } from 'react'

const useVideoScreen = () => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  return { isCameraOn, setIsCameraOn, cameraLoading, setCameraLoading }

}

export default useVideoScreen
