import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square as SquareType, Move, Color, PieceSymbol } from 'chess.js';
import { Sidebar } from './components/Controls/Sidebar';
import { EditorPanel } from './components/Controls/EditorPanel';
import { Board } from './components/Board/Board';
import { PromotionModal } from './components/Modals/PromotionModal';
import { EngineService } from './services/engineService';
import { determineStrategy, getBookMove } from './services/strategyService';
import { GameState, StrategyType, PlayerColor, EditorState } from './types';
import { INITIAL_FEN } from './constants';

const App: React.FC = () => {
  // --- Game State ---
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(INITIAL_FEN); // Used to trigger renders
  const [viewColor, setViewColor] = useState<PlayerColor>('white');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  
  // --- Selection & Moves ---
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [validCaptures, setValidCaptures] = useState<string[]>([]);
  const [pendingMove, setPendingMove] = useState<{from: string, to: string} | null>(null);
  const [showPromotion, setShowPromotion] = useState(false);

  // --- Engine & Strategy ---
  const [engine] = useState(() => new EngineService((line) => handleEngineMessage(line)));
  const [aiThinking, setAiThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState("Stockfish Idle");
  const [skillLevel, setSkillLevel] = useState(5);
  const [whiteStrategy, setWhiteStrategy] = useState<StrategyType>('auto');
  const [blackStrategy, setBlackStrategy] = useState<StrategyType>('auto');
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>('auto');
  const [strategyDisplay, setStrategyDisplay] = useState("Auto-Detecting...");

  // --- Editor State ---
  const [editorState, setEditorState] = useState<EditorState>({
    isActive: false,
    selectedTool: 'wP',
    turnToMove: 'w',
    tempBoardFen: ''
  });

  // --- Effect: Engine Thinking ---
  useEffect(() => {
    checkEngineTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, playerColor, aiThinking]); // Check turn whenever board state changes

  // --- Core Game Helpers ---
  const updateGameState = () => {
    setFen(game.fen());
    
    // Update Strategy Display
    const { strategy, display } = determineStrategy(
      playerColor, 
      whiteStrategy, 
      blackStrategy, 
      game.history(), 
      activeStrategy === 'auto' ? null : activeStrategy
    );
    
    if (activeStrategy !== strategy) setActiveStrategy(strategy);
    setStrategyDisplay(display);
  };

  const checkEngineTurn = () => {
    if (game.isGameOver() || aiThinking || editorState.isActive) return;

    const turnColor = game.turn() === 'w' ? 'white' : 'black';
    if (turnColor !== playerColor) {
        triggerAiMove();
    } else {
        setAiStatus("Stockfish Idle");
    }
  };

  const triggerAiMove = () => {
    setAiThinking(true);
    
    // Check Book Move First
    const strat = determineStrategy(playerColor, whiteStrategy, blackStrategy, game.history(), activeStrategy).strategy;
    // Pass the full game object for advanced generic fallback logic (captures, occupancy checks)
    const bookMove = getBookMove(game, strat, playerColor);

    if (bookMove) {
        // Validate book move legality just in case (though getBookMove handles most)
        const moves = game.moves();
        if (moves.includes(bookMove.san)) {
            setAiStatus(`Book: ${bookMove.name}`);
            setTimeout(() => {
                try {
                  game.move(bookMove.san);
                  setAiThinking(false);
                  updateGameState();
                } catch (e) {
                   console.error("Book move failed", e);
                   // Fallback to engine if book move fails (rare sync issue)
                   engine.analyze(game.fen(), skillLevel);
                }
            }, 800 + Math.random() * 400);
            return;
        }
    }

    // Fallback to Stockfish
    setAiStatus(`Thinking (Level ${skillLevel})...`);
    engine.analyze(game.fen(), skillLevel);
  };

  const handleEngineMessage = (line: string) => {
      if (line.startsWith('bestmove')) {
          const match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
          if (match) {
              const move = { 
                  from: match[1], 
                  to: match[2], 
                  promotion: match[3] || 'q' 
              };
              
              setTimeout(() => {
                  try {
                    game.move(move);
                    setAiThinking(false);
                    updateGameState();
                  } catch(e) {
                      console.error("Engine illegal move", e);
                      setAiThinking(false);
                  }
              }, 250);
          }
      }
  };

  // --- Interaction Handlers ---

  const handleSquareClick = (sq: string) => {
      if (editorState.isActive) {
          handleEditorClick(sq);
          return;
      }

      if (game.isGameOver() || aiThinking) return;
      if (game.turn() !== (playerColor === 'white' ? 'w' : 'b')) return;

      // Select own piece
      const piece = game.get(sq as SquareType);
      const isOwnPiece = piece && piece.color === game.turn();

      if (isOwnPiece) {
          if (selectedSquare === sq) {
              // Deselect
              setSelectedSquare(null);
              setValidMoves([]);
              setValidCaptures([]);
          } else {
              // Select new
              setSelectedSquare(sq);
              const moves = game.moves({ square: sq as SquareType, verbose: true });
              setValidMoves(moves.map(m => m.to));
              setValidCaptures(moves.filter(m => m.captured).map(m => m.to));
          }
          return;
      }

      // If square is empty or enemy, and we have a selection, try move
      if (selectedSquare) {
          if (validMoves.includes(sq)) {
              // Check promotion
              const sourcePiece = game.get(selectedSquare as SquareType);
              const isPawn = sourcePiece && sourcePiece.type === 'p';
              const isPromoRank = (sourcePiece.color === 'w' && sq[1] === '8') || (sourcePiece.color === 'b' && sq[1] === '1');

              if (isPawn && isPromoRank) {
                  setPendingMove({ from: selectedSquare, to: sq });
                  setShowPromotion(true);
              } else {
                  game.move({ from: selectedSquare, to: sq });
                  setSelectedSquare(null);
                  setValidMoves([]);
                  setValidCaptures([]);
                  updateGameState();
              }
          } else {
              // Invalid click clears selection
              setSelectedSquare(null);
              setValidMoves([]);
              setValidCaptures([]);
          }
      }
  };

  const handlePromotionSelect = (promoPiece: string) => {
      if (pendingMove) {
          game.move({ from: pendingMove.from, to: pendingMove.to, promotion: promoPiece });
          setShowPromotion(false);
          setPendingMove(null);
          setSelectedSquare(null);
          setValidMoves([]);
          setValidCaptures([]);
          updateGameState();
      }
  };

  // --- Editor Logic ---
  
  const toggleEditor = () => {
      if (editorState.isActive) return; // Should not happen via button
      engine.stop();
      setAiThinking(false);
      setAiStatus("Editor Mode");
      setEditorState({
          isActive: true,
          selectedTool: 'wP',
          turnToMove: game.turn(),
          tempBoardFen: game.fen()
      });
      setSelectedSquare(null);
      setValidMoves([]);
  };

  const cancelEditor = () => {
      game.load(editorState.tempBoardFen);
      setEditorState(prev => ({ ...prev, isActive: false }));
      updateGameState();
      checkEngineTurn();
  };

  const saveEditor = () => {
      // Validation check
      const currentFen = game.fen();
      const tempGame = new Chess(currentFen);
      
      // Basic sanity check: kings exist
      let wk = false, bk = false;
      tempGame.board().forEach(r => r.forEach(p => {
          if (p?.type === 'k' && p.color === 'w') wk = true;
          if (p?.type === 'k' && p.color === 'b') bk = true;
      }));
      
      if (!wk || !bk) {
          alert("Invalid Position: Both Kings must be on the board.");
          return;
      }
      
      // Update turn
      const fenParts = currentFen.split(' ');
      fenParts[1] = editorState.turnToMove;
      fenParts[3] = '-'; // Reset castling availability on manual edits for safety
      const newFen = fenParts.join(' ');
      
      try {
        game.load(newFen);
      } catch (e) {
         alert("Invalid FEN generated. Check pawn positions (no 1st/8th rank).");
         return;
      }

      setEditorState(prev => ({ ...prev, isActive: false }));
      setActiveStrategy('none');
      setStrategyDisplay("Custom Position");
      updateGameState();
      // Important: if it's AI turn now, trigger it
      setTimeout(checkEngineTurn, 500);
  };

  const handleEditorClick = (sq: string) => {
      const tool = editorState.selectedTool;
      if (tool === 'trash') {
          game.remove(sq as SquareType);
      } else {
          const color = tool[0] as Color;
          const type = tool[1].toLowerCase() as PieceSymbol;
          // Clear square first to avoid errors
          game.remove(sq as SquareType); 
          game.put({ type, color }, sq as SquareType);
      }
      setFen(game.fen()); // Force render
  };

  // --- Sidebar Actions ---

  const handleReset = () => {
      game.reset();
      setPlayerColor('white');
      setViewColor('white');
      setAiThinking(false);
      engine.stop();
      setActiveStrategy('auto');
      updateGameState();
  };

  const handleUndo = () => {
      if (aiThinking || editorState.isActive) return;
      game.undo();
      // If playing against AI, undo their move too to get back to user turn
      if (playerColor !== 'white' && playerColor !== 'black') { 
          // Mode where AI plays itself? Not implemented.
      } else {
           // Standard 1P vs CPU
           if (game.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
               game.undo();
           }
      }
      setActiveStrategy('auto'); // Reset strategy detection
      updateGameState();
  };

  const handleSwapSides = () => {
      const newColor = playerColor === 'white' ? 'black' : 'white';
      setPlayerColor(newColor);
      setViewColor(newColor);
      // If we swap while it's AI turn (which was user turn before swap), AI should move
      setTimeout(() => {
          checkEngineTurn();
      }, 500);
  };

  // --- Transform Game State for Board Component ---
  const boardState: GameState = {
      fen: fen,
      turn: game.turn(),
      inCheck: game.inCheck(),
      inCheckmate: game.isCheckmate(),
      inDraw: game.isDraw(),
      history: game.history(),
      lastMove: game.history({ verbose: true }).pop() || null,
      board: game.board()
  };

  let statusText = "";
  if (game.isCheckmate()) statusText = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
  else if (game.isDraw()) statusText = "Draw";
  else statusText = `${game.turn() === 'w' ? 'White' : 'Black'} to move ${game.inCheck() ? '(CHECK)' : ''}`;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-950 overflow-hidden">
        
        {/* Main Board Area */}
        <div className="flex-1 flex justify-center items-center p-2 lg:p-4 relative bg-slate-950">
            <div className="relative flex flex-col items-center">
                
                {/* AI Status Header */}
                <div className="w-full max-w-[600px] flex justify-between items-end mb-2 px-1">
                    <div className="flex items-center gap-3 bg-slate-800 py-1 px-3 rounded-full">
                        <div className={`w-3 h-3 rounded-full border border-gray-600 ${aiThinking ? 'bg-yellow-400 animate-pulse' : 'bg-black'}`}></div>
                        <span className={`text-xs font-mono ${aiThinking ? 'text-blue-400' : 'text-gray-300'}`}>
                            {aiStatus}
                        </span>
                        {aiThinking && <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full loader-spin"></div>}
                    </div>
                    <span className="text-xs text-gray-500 font-bold tracking-widest">OPPONENT</span>
                </div>

                <Board 
                    gameState={boardState}
                    viewColor={viewColor}
                    selectedSquare={selectedSquare}
                    validMoves={validMoves}
                    validCaptures={validCaptures}
                    onSquareClick={handleSquareClick}
                    isEditorActive={editorState.isActive}
                />

                {/* Player Header */}
                <div className="w-full max-w-[600px] flex justify-between items-start mt-2 px-1">
                    <span className="text-xs text-gray-500 font-bold tracking-widest">YOU</span>
                    <div className="flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-full">
                        <div className={`w-3 h-3 rounded-full ${playerColor === 'white' ? 'bg-white' : 'bg-black border border-gray-500'}`}></div>
                        <span className="text-xs font-bold text-gray-200">
                             Human ({playerColor === 'white' ? 'White' : 'Black'})
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="relative">
             {!editorState.isActive && (
                <Sidebar 
                    onReset={handleReset}
                    onUndo={handleUndo}
                    onToggleEditor={toggleEditor}
                    onToggleView={() => setViewColor(c => c === 'white' ? 'black' : 'white')}
                    onSwapSides={handleSwapSides}
                    whiteStrategy={whiteStrategy}
                    setWhiteStrategy={setWhiteStrategy}
                    blackStrategy={blackStrategy}
                    setBlackStrategy={setBlackStrategy}
                    currentStrategyName={strategyDisplay}
                    skillLevel={skillLevel}
                    setSkillLevel={setSkillLevel}
                    statusText={statusText}
                    pgn={game.pgn()}
                />
             )}
             
             {editorState.isActive && (
                 <EditorPanel 
                    onSave={saveEditor}
                    onCancel={cancelEditor}
                    turn={editorState.turnToMove}
                    setTurn={(c) => setEditorState(prev => ({...prev, turnToMove: c}))}
                    selectedTool={editorState.selectedTool}
                    setTool={(t) => setEditorState(prev => ({...prev, selectedTool: t}))}
                 />
             )}
        </div>

        <PromotionModal isOpen={showPromotion} onSelect={handlePromotionSelect} />
    </div>
  );
};

export default App;