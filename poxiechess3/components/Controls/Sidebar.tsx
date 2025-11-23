import React from 'react';
import { StrategyType } from '../../types';

interface SidebarProps {
    onReset: () => void;
    onUndo: () => void;
    onToggleEditor: () => void;
    onToggleView: () => void;
    onSwapSides: () => void;
    whiteStrategy: StrategyType;
    setWhiteStrategy: (s: StrategyType) => void;
    blackStrategy: StrategyType;
    setBlackStrategy: (s: StrategyType) => void;
    currentStrategyName: string;
    skillLevel: number;
    setSkillLevel: (n: number) => void;
    statusText: string;
    pgn: string;
    // New props for book toggle
    isBookDisabled: boolean;
    onToggleBook: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    onReset, onUndo, onToggleEditor, onToggleView, onSwapSides,
    whiteStrategy, setWhiteStrategy,
    blackStrategy, setBlackStrategy,
    currentStrategyName,
    skillLevel, setSkillLevel,
    statusText, pgn,
    isBookDisabled, onToggleBook
}) => {
    
    const getHumanityLabel = (val: number) => {
        const labels = ["Total Novice", "Beginner", "Casual", "Intermediate", "Advanced", "Expert", "Master", "Grandmaster", "Engine"];
        const idx = Math.floor((val / 20) * (labels.length - 1));
        return labels[idx] || "Custom";
    };

    return (
        <div className="w-full lg:w-96 bg-slate-800 border-l border-slate-700 flex flex-col shadow-xl z-20 h-[40vh] lg:h-full transition-all duration-300">
             <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>Supervisor Chess</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Stockfish 11 • Adaptive</p>
                </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-5">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onReset} className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium text-sm transition shadow-lg">New Game</button>
                    <button onClick={onUndo} className="bg-orange-600 hover:bg-orange-500 text-white py-2 rounded font-medium text-sm transition shadow-lg">Undo</button>
                    <button onClick={onToggleEditor} className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium text-sm transition shadow-lg flex items-center justify-center gap-2">
                        Edit Board
                    </button>
                    <button onClick={onToggleView} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium text-sm transition shadow-lg border border-slate-600">
                        Flip View
                    </button>
                    <button onClick={onSwapSides} className="col-span-2 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded font-medium text-xs transition border border-slate-500">
                        Swap Sides (Switch Color)
                    </button>
                </div>

                <div className="space-y-3 bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy</h3>
                        <span className="text-[10px] text-blue-400 font-mono">{currentStrategyName}</span>
                    </div>

                    <button 
                        onClick={onToggleBook} 
                        className={`w-full mb-3 py-1.5 text-[10px] font-bold uppercase rounded border transition-colors flex items-center justify-center gap-2
                            ${isBookDisabled 
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                            }`}
                    >
                        {isBookDisabled ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                Book Disabled (Engine Only)
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                Opening Book Active
                            </>
                        )}
                    </button>

                    <div>
                        <label className="text-[10px] text-slate-400 block mb-1">WHITE STYLE</label>
                        <select 
                            value={whiteStrategy}
                            onChange={(e) => setWhiteStrategy(e.target.value as StrategyType)}
                            className="w-full bg-slate-800 border border-slate-600 text-xs text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="auto">⚡ Auto (Default London)</option>
                            <option value="london">London System</option>
                            <option value="torre">Torre Attack</option>
                            <option value="colle">Colle-Zukertort</option>
                            <option value="bird">Bird's Opening (f4)</option>
                            <option value="sokolsky">Sokolsky / Orangutan (b4)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 block mb-1">BLACK STYLE</label>
                        <select 
                            value={blackStrategy}
                            onChange={(e) => setBlackStrategy(e.target.value as StrategyType)}
                            className="w-full bg-slate-800 border border-slate-600 text-xs text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="auto">⚡ Auto (Default King's Indian)</option>
                            <option value="kings_indian">King's Indian Setup / Pirc</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between text-xs mb-2 uppercase tracking-wider font-bold text-slate-400">
                        <span>Engine Skill</span>
                        <span className="text-green-400">{getHumanityLabel(skillLevel)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="20" 
                        value={skillLevel} 
                        onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-[100px]">
                    <div className="text-xs font-bold text-blue-400 mb-2 font-mono">{statusText}</div>
                    <div className="w-full flex-1 bg-slate-900 p-2 rounded text-[10px] text-slate-400 font-mono overflow-y-auto border border-slate-700 h-24 whitespace-pre-wrap">
                        {pgn || "Game Log..."}
                    </div>
                </div>
            </div>
        </div>
    );
};