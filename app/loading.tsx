import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* App Icon */}
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-6xl font-bold text-black">C</span>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 w-32 h-32 bg-white rounded-3xl animate-pulse opacity-30"></div>
      </div>
      
      {/* App Name */}
      <h1 className="text-4xl font-bold text-white mb-2">Coban</h1>
      <p className="text-gray-300 text-lg mb-12">Japanese Learning App</p>
      
      {/* Loading Animation */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-8 w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-[loading_2s_ease-in-out_infinite] rounded-full"></div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  )
}