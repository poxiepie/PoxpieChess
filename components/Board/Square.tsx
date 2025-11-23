import React from 'react';
import { PIECE_IMAGES } from '../../constants';

interface SquareProps {
  id: string;
  isLight: boolean;
  piece: { type: string; color: string } | null;
  isSelected: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  isHint: boolean;
  isCaptureHint: boolean;
  onClick: () => void;
  // Editor props
  isEditorActive: boolean;
  editorTool?: string;
}

export const Square: React.FC<SquareProps> = ({
  id,
  isLight,
  piece,
  isSelected,
  isLastMove,
  isInCheck,
  isHint,
  isCaptureHint,
  onClick,
  isEditorActive,
}) => {
  
  const baseClass = `relative flex justify-center items-center w-full h-full transition-colors duration-100 ${
    isLight ? 'board-light' : 'board-dark'
  }`;

  // Priority of background colors: Selected > Check > LastMove > Base
  // Note: We use inline styles or specific utility overrides for these to ensure specificity
  let backgroundClass = baseClass;
  if (isSelected) backgroundClass += ' !bg-[rgba(100,255,0,0.6)]';
  else if (isInCheck) backgroundClass += ' !bg-red-500/80'; // Radial handled via CSS better, but this works for Tailwind
  else if (isLastMove) backgroundClass += ' !bg-[rgba(155,199,0,0.41)]';

  // Handling radial gradient for check specifically if we want match exact style
  const style = isInCheck ? { background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 70%)' } : {};

  const cursorClass = isEditorActive ? 'cursor-crosshair' : 'cursor-pointer';

  return (
    <div 
      data-square={id}
      className={`${backgroundClass} ${cursorClass}`}
      style={style}
      onClick={onClick}
    >
        {/* Rank/File Labels (Optional refinement: only show on edges) */}
        {/* We skip labels for cleaner look like original, or add them later */}

        {/* Piece */}
        {piece && (
            <div 
                className="piece w-full h-full bg-no-repeat bg-center bg-[length:85%] z-10 pointer-events-none"
                style={{ backgroundImage: `url('${PIECE_IMAGES[piece.color + piece.type.toUpperCase()]}')` }}
            />
        )}

        {/* Hints */}
        {!piece && isHint && (
            <div className="absolute w-[30%] h-[30%] bg-black/20 rounded-full pointer-events-none z-20" />
        )}
        {piece && isCaptureHint && (
             <div className="absolute w-[85%] h-[85%] border-4 border-black/20 rounded-full pointer-events-none z-20" />
        )}
    </div>
  );
};
