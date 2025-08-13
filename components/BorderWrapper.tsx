import React from "react";

const BorderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full p-4 flex item-center border-2 border-gray-200 justify-center shadow rounded">
      {children}
    </div>
  );
};

export default BorderWrapper;
