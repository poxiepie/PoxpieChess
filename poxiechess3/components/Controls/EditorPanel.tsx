import React from 'react';
import { Color } from 'chess.js';

interface EditorPanelProps {
    onSave: () => void;
    onCancel: () => void;
    turn: Color;
    setTurn: (c: Color) => void;
    selectedTool: string;
    setTool: (t: string) => void;
}

const TOOLS = [
    { id: 'wK', label: '♔' }, { id: 'wQ', label: '♕' }, { id: 'wR', label: '♖' },
    { id: 'wB', label: '♗' }, { id: 'wN', label: '♘' }, { id: 'wP', label: '♙' },
    { id: 'bK', label: '♚', dark: true }, { id: 'bQ', label: '♛', dark: true }, { id: 'bR', label: '♜', dark: true },
    { id: 'bB', label: '♝', dark: true }, { id: 'bN', label: '♞', dark: true }, { id: 'bP', label: '♟', dark: true }
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
    onSave, onCancel, turn, setTurn, selectedTool, setTool
}) => {
    return (
        <div className="p-4 flex flex-col h-full bg-slate-900 absolute top-0 left-0 w-full z-30 lg:w-96 border-l border-slate-700 shadow-xl">
             <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">Board Editor</span>
            </h2>

            <div className="space-y-4 flex-1">
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Side to Move</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTurn('w')} 
                            className={`flex-1 py-2 text-sm rounded font-bold transition ${turn === 'w' ? 'bg-gray-200 text-black ring-2 ring-blue-500' : 'bg-gray-200 text-black opacity-50'}`}
                        >White</button>
                        <button 
                            onClick={() => setTurn('b')}
                            className={`flex-1 py-2 text-sm rounded border border-slate-600 font-bold transition ${turn === 'b' ? 'bg-black text-white ring-2 ring-blue-500' : 'bg-slate-900 text-white opacity-50'}`}
                        >Black</button>
                    </div>
                </div>

                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Tools</label>
                    <div className="grid grid-cols-6 gap-2 mb-2">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setTool(tool.id)}
                                className={`w-8 h-8 rounded flex justify-center items-center text-xl transition
                                    ${tool.dark ? 'text-black' : 'text-white'}
                                    ${selectedTool === tool.id ? 'ring-2 ring-blue-400 bg-slate-500' : 'bg-slate-600 hover:bg-slate-500'}
                                `}
                            >
                                {tool.label}
                            </button>
                        ))}
                    </div>

                     <button
                        onClick={() => setTool('trash')}
                        className={`w-full py-2 border rounded font-medium flex justify-center items-center gap-2 transition
                            ${selectedTool === 'trash' ? 'bg-red-900 border-red-500 ring-2 ring-red-400 text-white' : 'bg-red-900/50 border-red-700 text-red-200 hover:bg-red-900'}
                        `}
                    >
                        🗑️ Trash / Clear
                    </button>

                    <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-[10px] text-yellow-200">
                        Warning: Book moves disabled in custom positions. Castling rights reset.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={onSave} className="bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold shadow-lg transition">Save & Play</button>
                <button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-medium border border-slate-600 transition">Cancel</button>
            </div>
        </div>
    );
};
