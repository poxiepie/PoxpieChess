import React from 'react';

interface PromotionModalProps {
    isOpen: boolean;
    onSelect: (piece: string) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/80 z-50">
             <div className="bg-white p-6 rounded-xl flex gap-4 shadow-2xl transform scale-110 animate-in fade-in zoom-in duration-200">
                <button onClick={() => onSelect('q')} className="hover:bg-blue-100 p-3 rounded-lg text-5xl transition">♕</button>
                <button onClick={() => onSelect('r')} className="hover:bg-blue-100 p-3 rounded-lg text-5xl transition">♖</button>
                <button onClick={() => onSelect('b')} className="hover:bg-blue-100 p-3 rounded-lg text-5xl transition">♗</button>
                <button onClick={() => onSelect('n')} className="hover:bg-blue-100 p-3 rounded-lg text-5xl transition">♘</button>
            </div>
        </div>
    );
};
