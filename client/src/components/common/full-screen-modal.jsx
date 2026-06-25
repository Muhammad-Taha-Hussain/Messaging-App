import React from 'react';
import { IoClose } from 'react-icons/io5';

function FullScreenModal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={onClose}>
            <div className="relative p-2 rounded-lg">
                {children}
            </div>
        </div>
    );

}

export default FullScreenModal;