import React from "react";

const PhoneFrame = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white h-[850px] rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-gray-900 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;
