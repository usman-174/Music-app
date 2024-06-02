import React from "react";

const Modal = ({ isOpen, onClose, handleSubmit, children, loading }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed top-0 left-0 flex items-center justify-center 
        w-full h-full bg-opacity-50 bg-gray-700">
          <div className="bg-white rounded-lg shadow-lg p-4  w-3/4 md:w-2/5">
            {children}


<hr />
            <center>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                {loading ? "Loading" : " Submit"}
              </button>
              <button
                className="mt-4 py-2 px-4 mx-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                onClick={onClose}
              >
                Cancel
              </button>
            </center>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
