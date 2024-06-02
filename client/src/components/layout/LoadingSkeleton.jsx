import React from "react";

const LoadingSkeleton = ({ passCount, className}) => {
  const loadingSkeletons = Array(passCount).fill(null);

  return (
    <div className=" mx-auto text-center w-full">
      {loadingSkeletons.map((_, index) => (
        <div
          key={index}
          className={`bg-gray-300 animate-pulse mx-auto text-center  m-3 ${className}`}
          style={{
            
            borderRadius: "0.25rem",
            boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
          }}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
