import React from 'react';
import { Square } from './Square';
import { GameState } from '../../types';
import { Chess, Square as SquareType } from 'chess.js';

interface BoardProps {
    gameState: GameState;
    viewColor: 'white' | 'black';
    selectedSquare: string | null;
    validMoves: string[]; // List of square IDs like 'e4'
    validCaptures: string[];
    onSquareClick: (sq: string) => void;
    isEditorActive: boolean;
}

export const Board: React.FC<BoardProps> = ({
    gameState,
    viewColor,
    selectedSquare,
    validMoves,
    validCaptures,
    onSquareClick,
    isEditorActive
}) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // If view is black, we reverse rendering order
    const renderRanks = viewColor === 'white' ? ranks : [...ranks].reverse();
    const renderFiles = viewColor === 'white' ? files : [...files].reverse();

    // Helper to check for check highlighting
    const getKingSquare = (color: string) => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = gameState.board[r][c];
                if (p && p.type === 'k' && p.color === color) {
                    return p.square;
                }
            }
        }
        return null;
    };

    const kingInCheckSq = gameState.inCheck ? getKingSquare(gameState.turn) : null;

    return (
        <div className={`relative shadow-2xl transition-transform duration-500 ease-in-out ${isEditorActive ? 'shadow-[0_0_0_5px_#3b82f6]' : ''}`}>
             <div className="grid grid-cols-8 w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] border-[6px] border-slate-700 rounded-sm bg-slate-800 shadow-black/50 shadow-xl">
                {renderRanks.map((rank, rIdx) => (
                    renderFiles.map((file, fIdx) => {
                        const sqName = (file + rank) as SquareType;
                        
                        // We need to map visual rank/file to data rank/file
                        // Chess.js board is 8 arrays (ranks 8->1).
                        // If view is white: visual row 0 is rank 8 (data row 0).
                        // If view is black: visual row 0 is rank 1 (data row 7).
                        
                        // Let's just lookup the piece from the gameState.board using helper
                        // gameState.board is [rank8_array, rank7_array, ...]
                        // rank 8 is index 0.
                        const rankIndex = 8 - parseInt(rank); 
                        const fileIndex = file.charCodeAt(0) - 97; // 'a' is 97
                        
                        const piece = gameState.board[rankIndex][fileIndex];
                        const isLight = (rankIndex + fileIndex) % 2 === 0;

                        const isLastMove = gameState.lastMove 
                            ? (gameState.lastMove.from === sqName || gameState.lastMove.to === sqName) 
                            : false;
                        
                        return (
                            <Square
                                key={sqName}
                                id={sqName}
                                isLight={isLight}
                                piece={piece}
                                isSelected={selectedSquare === sqName}
                                isLastMove={!isEditorActive && isLastMove}
                                isInCheck={!isEditorActive && kingInCheckSq === sqName}
                                isHint={!isEditorActive && validMoves.includes(sqName)}
                                isCaptureHint={!isEditorActive && validCaptures.includes(sqName)}
                                onClick={() => onSquareClick(sqName)}
                                isEditorActive={isEditorActive}
                            />
                        );
                    })
                ))}
            </div>
        </div>
    );
};
