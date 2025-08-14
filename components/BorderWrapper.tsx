import React from "react";

const BorderWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`w-full p-4 flex item-center border-2 border-gray-200 
        justify-center shadow rounded ${className}`}
    >
      {children}
    </div>
  );
};

export default BorderWrapper;
