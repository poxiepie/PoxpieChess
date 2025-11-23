import { Square, PieceSymbol, Color, Move } from 'chess.js';

export type PlayerColor = 'white' | 'black';

export interface GameState {
  fen: string;
  turn: Color;
  inCheck: boolean;
  inCheckmate: boolean;
  inDraw: boolean;
  history: string[];
  lastMove: Move | null;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
}

export interface EngineMessage {
  from: string;
  to: string;
  promotion?: string;
}

export interface BookMove {
  san: string;
  name: string;
}

export interface PieceData {
  type: PieceSymbol;
  color: Color;
}

export type StrategyType = 'auto' | 'london' | 'torre' | 'colle' | 'bird' | 'sokolsky' | 'kings_indian' | 'none';

export interface EditorState {
  isActive: boolean;
  selectedTool: string; // e.g., 'wP', 'bR', 'trash'
  turnToMove: Color;
  tempBoardFen: string;
}
