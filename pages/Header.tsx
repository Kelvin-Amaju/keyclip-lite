import React, { useState } from "react";

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className='w-full p-4 shadow-sm mb-5 flex justify-between items-center'>
            <h1 className='title-text text-left text-2xl text-gray-800 mx-10'>
                AI <span className="text-indigo-600">Summary</span> Lite
            </h1>
            <button
                className='bg-indigo-600 text-white px-4 py-2 font-bold rounded-md summary hover:bg-indigo-700 transition mr-10'
                onClick={() => setIsModalOpen(true)}
            >
                Go Pro
            </button>

            {isModalOpen && (
                <div className='fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg max-w-md w-full textarea'>
                        <h2 className='text-xl font-bold text-gray-950 mb-4'>Coming Soon!</h2>
                        <p className='text-gray-900 mb-6 title-paragraph text-2xl'>
                            We're working on exciting new Pro features. Stay tuned for updates!
                        </p>
                        <button
                            className='summary cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition w-full'
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}