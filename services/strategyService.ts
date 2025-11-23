import { StrategyType, BookMove, PlayerColor } from '../types';
import { Chess, Move, PieceSymbol, Square } from 'chess.js';

// --- DATA: BOOK LINES ---
interface BookLine {
    name: string;
    moves: string[];
}

interface GenericMove {
    to?: string;        // Target square (e.g. 'd4')
    piece?: string;     // Piece type symbol (e.g. 'p', 'n', 'b')
    san?: string;       // Specific SAN (e.g. 'O-O')
    checkOccupied?: boolean; // If true, check if target square has the piece
}

// --- LONDON SYSTEM BOOKS ---
const LONDON_BOOK: BookLine[] = [
    // ... (All existing lines preserved, re-declaring here for context)
    // 1. vs ...d5 (Classical)
    {
        name: 'London (Ext): vs Classical',
        moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'c5', 'c3', 'Nc6', 'Nbd2', 'b6', 'O-O', 'Bb7', 'Re1', 'Ne4', 'Bxe4', 'dxe4', 'Nxe4', 'Be7']
    },
    {
        name: 'London (Ext): vs Bf5',
        moves: ['d4', 'd5', 'Bf4', 'Bf5', 'e3', 'e6', 'Bd3', 'Bxd3', 'Qxd3', 'c5', 'c3', 'Nc6', 'Nf3', 'Nf6', 'Nbd2', 'Be7', 'O-O', 'O-O', 'h3']
    },
    {
        name: 'London (Ext): vs Slav',
        moves: ['d4', 'd5', 'Bf4', 'c6', 'e3', 'Nf6', 'Nf3', 'Bf5', 'Bd3', 'Bxd3', 'Qxd3', 'e6', 'Nbd2', 'Be7', 'O-O', 'O-O', 'e4', 'dxe4', 'Nxe4', 'Nxe4', 'Qxe4', 'Nd7']
    },
    {
        name: 'London (Ext): vs Early c5',
        moves: ['d4', 'c5', 'Bf4', 'cxd4', 'Qxd4', 'Nc6', 'Qd1', 'd5', 'e3', 'Nf6', 'Nf3', 'e6', 'c3', 'Bd6', 'Bxd6', 'Qxd6', 'Nbd2', 'O-O', 'Bd3']
    },
    {
        name: 'London (Ext): vs KID',
        moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'h3', 'O-O', 'Nf3', 'd6', 'Be2', 'Nbd7', 'O-O', 'Re8', 'c3', 'e5', 'dxe5', 'Nxe5', 'Nbd2']
    },
    {
        name: 'London (Ext): vs QID Style',
        moves: ['d4', 'Nf6', 'Bf4', 'e6', 'e3', 'b6', 'Bd3', 'Bb7', 'Nf3', 'd6', 'Nbd2', 'Be7', 'O-O', 'O-O', 'h3', 'Nbd7', 'Re1', 'Ne4', 'Nxe4', 'Bxe4']
    },
    {
        name: 'London (Ext): vs Dutch',
        moves: ['d4', 'f5', 'Bf4', 'Nf6', 'e3', 'g6', 'h3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd6', 'O-O', 'Nc6', 'c3', 'Qe8', 'Nbd2', 'e5', 'Bh2']
    },
    {
        name: 'London (Ext): vs Benoni',
        moves: ['d4', 'Nf6', 'Bf4', 'c5', 'e3', 'd6', 'Nf3', 'g6', 'c3', 'Bg7', 'Bd3', 'O-O', 'h3', 'b6', 'O-O', 'Ba6', 'Na3', 'Bxd3', 'Qxd3']
    },
    {
        name: 'London (Ext): vs Qb6',
        moves: ['d4', 'd5', 'Bf4', 'Qb6', 'Nc3', 'Qxb2', 'Bd2', 'Nf6', 'e4', 'dxe4', 'Nxe4', 'Nxe4', 'Rb1', 'Qa3', 'Bd3', 'Nf6', 'Nf3', 'e6', 'O-O']
    },
    {
        name: 'London (Ext): vs Bg4',
        moves: ['d4', 'd5', 'Bf4', 'Nc6', 'e3', 'Bg4', 'Be2', 'Bxe2', 'Qxe2', 'e6', 'Nf3', 'Bd6', 'Bg3', 'Nf6', 'Nbd2', 'O-O', 'O-O', 'Re8', 'e4']
    },
    {
        name: 'London (Ext): Symmetrical',
        moves: ['d4', 'd5', 'Bf4', 'Bf5', 'e3', 'e6', 'Nf3', 'Bd6', 'Bg3', 'Bxg3', 'hxg3', 'Nf6', 'Nbd2', 'O-O', 'Bd3', 'Bxd3', 'cxd3', 'c5', 'O-O', 'Nc6']
    },
    // Fallbacks
    { name: 'London vs d5 (Mainline)', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nd2', 'Bd6', 'Bg3', 'O-O', 'Ngf3', 'b6', 'Bd3', 'Bb7', 'Ne5', 'c5', 'c3', 'Nc6', 'f4', 'Ne7', 'Qf3', 'Nf5', 'Bf2', 'Ne4', 'O-O', 'f6', 'Ng4', 'Qe7'] },
    { name: 'London vs d5 & Bf5', moves: ['d4', 'd5', 'Bf4', 'Bf5', 'e3', 'e6', 'Nd2', 'Nd7', 'Ngf3', 'Ngf6', 'h3', 'h6', 'Bd3', 'Bd6', 'Bxf5', 'exf5', 'Qe2', 'O-O', 'Bxd6', 'cxd6', 'Qd3', 'g6', 'O-O-O', 'Ne4'] },
    { name: 'London vs Early c5', moves: ['d4', 'c5', 'Bf4', 'cxd4', 'Qxd4', 'Nc6', 'Qd1', 'd5', 'e3'] },
    { name: 'London vs Slav (c6/d5)', moves: ['d4', 'd5', 'Bf4', 'c6', 'e3', 'Bf5', 'Nd2', 'e6', 'Ngf3', 'Nf6', 'h3', 'Nbd7', 'Bd3', 'Bg6', 'Bxg6', 'hxg6', 'O-O', 'Nh5', 'Bh2', 'f5', 'Ne5', 'Nxe5', 'Bxe5', 'Bd6', 'f4', 'g5'] },
    { name: 'London vs KID Setup', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nd2', 'O-O', 'Ngf3', 'd6', 'Bd3', 'c5', 'c3', 'Qb6', 'Qb3', 'Qxb3', 'Nxb3', 'Nbd7', 'h3', 'b6', 'O-O', 'Bb7', 'Rfe1', 'Rfe8', 'e4', 'e5'] },
    { name: 'London vs QID Style (e6)', moves: ['d4', 'Nf6', 'Bf4', 'e6', 'e3', 'b6', 'Bd3', 'Bb7', 'Nd2', 'Be7', 'Ngf3', 'O-O', 'h3', 'c5', 'O-O', 'Nc6', 'c3', 'd6', 'e4', 'Re8', 'Re1', 'Bf8', 'Qe2', 'g6'] },
    { name: 'London vs Qb6 Pressure', moves: ['d4', 'd5', 'Bf4', 'Qb6', 'Nc3', 'Qxb2', 'Bd2', 'Qb6', 'e4', 'dxe4', 'Nxe4', 'Qxd4', 'Bd3', 'e5', 'Nf3', 'Qd5', 'O-O', 'f5', 'Nc3', 'Qd6'] },
    { name: 'London vs Dutch', moves: ['d4', 'f5', 'Bf4', 'Nf6', 'e3', 'g6', 'h3', 'Bg7', 'Nd2', 'O-O', 'Ngf3', 'd6', 'Bd3', 'c5', 'c3', 'Nc6', 'O-O', 'Qe8', 'Re1', 'e5', 'dxe5', 'dxe5', 'Bh2', 'e4'] },
    { name: 'London vs Benoni', moves: ['d4', 'Nf6', 'Bf4', 'c5', 'd5', 'd6', 'e3', 'g6', 'Nf3', 'Bg7', 'h3', 'O-O', 'Bd3', 'b5', 'a4', 'c4', 'Be2', 'b4', 'Nbd2', 'c3', 'bxc3', 'bxc3'] },
    { name: 'London vs Bg4 Pin', moves: ['d4', 'd5', 'Bf4', 'Nc6', 'e3', 'Bg4', 'Be2', 'Bxe2', 'Qxe2', 'e6', 'Nf3', 'Nf6', 'O-O', 'Nh5', 'Bg5', 'f6', 'Bh4', 'g5', 'Nxg5', 'Ng7'] },
    { name: 'London Symmetrical', moves: ['d4', 'd5', 'Bf4', 'Bf5', 'e3', 'e6', 'Bd3', 'Bd6', 'Bg3', 'Bxg3', 'hxg3', 'Nc6', 'Nf3', 'Nf6', 'c3', 'Qd6', 'Nbd2', 'O-O', 'Qc2', 'Bxd3', 'Qxd3', 'e5', 'dxe5', 'Nxe5'] },
    { name: 'London vs Chaos/Rare', moves: ['d4', 'Nf6', 'Bf4', 'd6', 'e3', 'g6', 'h3', 'Bg7', 'Nd2', 'O-O', 'Ngf3', 'Nbd7', 'Bd3', 'Re8', 'O-O', 'e5', 'Bh2', 'Qe7', 'c3', 'h6', 'Re1', 'b6', 'a4', 'Bb7'] }
];

// --- KID BOOKS ---
const KID_BOOK: BookLine[] = [
    { name: 'KID (Beg): vs Classical', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nbd7', 'Re1', 'Re8', 'Bf1', 'c6', 'd5', 'a5'] },
    { name: 'KID (Beg): vs London', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'h3', 'd6', 'Be2', 'Nbd7', 'O-O', 'Re8', 'c3', 'e5', 'Bh2', 'e4', 'Nfd2', 'h5'] },
    { name: 'KID (Beg): vs Fianchetto', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'O-O', 'Nf3', 'd6', 'O-O', 'Nbd7', 'Nc3', 'e5', 'e4', 'c6', 'Re1', 'Re8', 'h3', 'exd4', 'Nxd4', 'Nc5'] },
    { name: 'KID (Beg): vs Sämisch', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'Nbd7', 'Qd2', 'e5', 'd5', 'Nh5', 'Nge2', 'f5', 'exf5', 'gxf5'] },
    { name: 'KID (Beg): vs Four Pawns', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6', 'Be2', 'exd5', 'cxd5', 'Re8', 'e5', 'Nfd7'] },
    { name: 'KID (Beg): vs 3.Nf3', moves: ['d4', 'Nf6', 'Nf3', 'g6', 'c3', 'Bg7', 'Bf4', 'O-O', 'e3', 'd6', 'h3', 'Nbd7', 'Be2', 'Re8', 'O-O', 'e5'] },
    { name: 'KID (Beg): vs 2.c4 Slow', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'Nf3', 'O-O', 'e3', 'd6', 'Be2', 'Nbd7', 'O-O', 'e5', 'h3', 'Re8', 'dxe5', 'dxe5', 'b3', 'c6'] },
    { name: 'KID (Beg): vs Early d5', moves: ['d4', 'Nf6', 'c4', 'g6', 'd5', 'd6', 'Nc3', 'Bg7', 'e4', 'O-O', 'Nf3', 'c6', 'Be2', 'cxd5', 'cxd5', 'e6'] },
    { name: 'KID (Beg): vs Anti-KID', moves: ['d4', 'Nf6', 'Bg5', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd6', 'O-O', 'Nbd7', 'h3', 'e5'] },
    // Fallbacks
    { name: 'KID: Mar del Plata (9.Ne1)', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'f3', 'f5', 'Be3', 'f4', 'Bf2', 'g5', 'Nd3', 'Ng6', 'c5', 'Nf6', 'Rc1', 'Rf7', 'cxd6', 'cxd6'] },
    { name: 'KID: Bayonet Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'b4', 'a5', 'Ba3', 'axb4', 'Bxb4', 'b6', 'a4', 'Nh5', 'Re1', 'Nf4', 'a5', 'f5', 'Bf1', 'fxe4', 'Nxe4', 'bxa5', 'Bxa5', 'Bg4'] },
    { name: 'KID: Classical (9.Be3)', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Be3', 'Ng4', 'Bd2', 'f5', 'Ne1', 'Nf6', 'f3', 'f4', 'Nd3', 'g5', 'c5', 'Ng6', 'Rc1', 'Rf7'] },
    { name: 'KID: 7.d5 System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'd5', 'a5', 'Bg5', 'Na6', 'Nd2', 'Qe8', 'O-O', 'Nd7', 'b3', 'f5', 'a3', 'h6', 'Be3', 'Nf6'] },
    { name: 'KID: Exchange Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'dxe5', 'dxe5', 'Qxd8', 'Rxd8', 'Bg5', 'Re8', 'O-O', 'c6', 'Rfd1', 'Na6', 'Ne1', 'Nc5', 'f3', 'Ne6'] },
    { name: 'KID: Makogonov / h3 System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'h3', 'a5', 'Be3', 'b6', 'a3', 'Nd7', 'b4', 'f5', 'Ng5', 'Nf6', 'f3', 'f4'] },
    { name: 'KID: Averbakh System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Be2', 'O-O', 'Bg5', 'c5', 'd5', 'h6', 'Be3', 'e6', 'Qd2', 'exd5', 'cxd5', 'Re8', 'f3', 'h5', 'Bg5', 'a6', 'a4', 'Nbd7'] },
    { name: 'KID: Four Pawns Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6', 'Be2', 'exd5', 'cxd5', 'Bg4', 'O-O', 'Re8', 'e5', 'Nfd7', 'Ne4', 'dxe5', 'Nd6', 'e4'] },
    { name: 'KID: Sämisch Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'c5', 'Nge2', 'Nc6', 'Qd2', 'a6', 'd5', 'Ne5', 'Ng3', 'b5', 'cxb5', 'axb5', 'Bxb5', 'Ba6', 'Bxa6', 'Rxa6'] },
    { name: 'KID: Fianchetto Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'O-O', 'Nf3', 'd6', 'O-O', 'Nbd7', 'Nc3', 'e5', 'e4', 'c6', 'h3', 'Qb6', 'Re1', 'exd4', 'Nxd4', 'Re8', 'Re2', 'Nc5', 'Be3', 'Qb4'] },
    { name: 'KID: Fianchetto (Early d5)', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'O-O', 'Nc3', 'd6', 'Nf3', 'Nc6', 'd5', 'Na5', 'Nd2', 'c5', 'O-O', 'a6', 'Qc2', 'Rb8', 'b3', 'b5'] },
    { name: 'KID: 1.Nf3 Move Order', moves: ['Nf3', 'Nf6', 'c4', 'g6', 'd4', 'Bg7', 'Nc3', 'O-O', 'e4', 'd6', 'Be2', 'e5', 'O-O', 'Nc6'] },
    { name: 'KID: 1.c4 Move Order', moves: ['c4', 'Nf6', 'Nc3', 'g6', 'd4', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6'] },
    { name: 'KID: Early Nf3 vs KID', moves: ['d4', 'Nf6', 'Nf3', 'g6', 'c4', 'Bg7', 'Nc3', 'O-O', 'e4', 'd6', 'Be2', 'e5', 'O-O', 'Nc6'] },
    { name: 'Anti-KID: 2.Bg5', moves: ['d4', 'Nf6', 'Bg5', 'Ne4', 'Bf4', 'd5', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'Nxd2', 'Qxd2', 'e6', 'Nf3', 'Bd6', 'Bg3', 'O-O'] },
    { name: 'Anti-KID: London System', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'Nf3', 'Bg7', 'e3', 'O-O', 'Be2', 'd6', 'h3', 'Nbd7', 'O-O', 'Qe8', 'c4', 'e5', 'Bh2', 'Qe7', 'Nc3', 'c6'] },
    { name: 'KID: Early c4 (No Nf3)', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'Nbd7', 'Qd2', 'e5', 'd5', 'a5'] },
    { name: 'KID: Delayed g3', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'Nf3', 'O-O', 'g3', 'd6', 'Bg2', 'Nbd7', 'O-O', 'e5', 'e4', 'c6', 'h3', 'Re8', 'Re1', 'Qc7'] }
];

// --- GENERIC FALLBACK SYSTEMS ---

// The "Perfect" London Setup sequence
const LONDON_GENERIC: GenericMove[] = [
    { to: 'd4', piece: 'p', checkOccupied: true },
    { to: 'f4', piece: 'b', checkOccupied: true },
    { to: 'f3', piece: 'n', checkOccupied: true }, // Nf3
    { to: 'e3', piece: 'p', checkOccupied: true },
    { to: 'c3', piece: 'p', checkOccupied: true },
    { to: 'd3', piece: 'b', checkOccupied: true },
    { to: 'd2', piece: 'n', checkOccupied: true }, // Nbd2
    { san: 'O-O' },
    { to: 'h3', piece: 'p', checkOccupied: true }
];

// The "Perfect" KID Setup sequence
const KID_GENERIC: GenericMove[] = [
    { to: 'f6', piece: 'n', checkOccupied: true }, // Nf6
    { to: 'g6', piece: 'p', checkOccupied: true },
    { to: 'g7', piece: 'b', checkOccupied: true }, // Bg7
    { to: 'd6', piece: 'p', checkOccupied: true },
    { san: 'O-O' },
    { to: 'd7', piece: 'n', checkOccupied: true }, // Nbd7
    { to: 'e5', piece: 'p', checkOccupied: true }, // e5 (aggressive but key)
    { to: 'e8', piece: 'r', checkOccupied: true }, // Re8
    { to: 'c6', piece: 'p', checkOccupied: true },
    { to: 'a5', piece: 'p', checkOccupied: true }
];


// --- LOGIC ---

export const determineStrategy = (
    playerColor: PlayerColor,
    whiteStrat: StrategyType,
    blackStrat: StrategyType,
    history: string[],
    currentActiveStrategy: StrategyType | null
): { strategy: StrategyType, display: string } => {
    
    // AI playing as White (Human is Black)
    if (playerColor === 'black') {
        if (whiteStrat !== 'auto') return { strategy: whiteStrat, display: `Manual: ${formatStrategyName(whiteStrat)}` };
        if (currentActiveStrategy && currentActiveStrategy !== 'auto' && currentActiveStrategy !== 'none') {
            return { strategy: currentActiveStrategy, display: formatStrategyName(currentActiveStrategy) };
        }
        return { strategy: 'london', display: 'London System' };
    }

    // AI playing as Black (Human is White)
    if (playerColor === 'white') {
        if (blackStrat !== 'auto') return { strategy: blackStrat, display: `Manual: ${formatStrategyName(blackStrat)}` };
        
        if (history.length === 0) return { strategy: 'none', display: 'Engine Default' };
        if (currentActiveStrategy && currentActiveStrategy !== 'auto' && currentActiveStrategy !== 'none') {
            return { strategy: currentActiveStrategy, display: formatStrategyName(currentActiveStrategy) };
        }

        const firstMove = history[0];
        if (firstMove === 'e4' || firstMove === 'd4' || firstMove === 'c4' || firstMove === 'Nf3') {
            return { strategy: 'kings_indian', display: "Adapting: King's Indian Setup" };
        }
        
        return { strategy: 'none', display: 'Engine Default' };
    }

    return { strategy: 'none', display: 'None' };
};

// Returns a BookMove if available, OR a Generic System Move if appropriate
export const getBookMove = (
    game: Chess, 
    strategy: StrategyType, 
    playerColor: PlayerColor
): BookMove | null => {
    const history = game.history();
    const moveCount = history.length;
    
    // 1. Try Specific Book Lines
    if (playerColor === 'black' && strategy === 'london') {
         for (const line of LONDON_BOOK) {
            if (line.moves.length <= moveCount) continue;
            let match = true;
            for (let i = 0; i < moveCount; i++) {
                if (history[i] !== line.moves[i]) { match = false; break; }
            }
            if (match) return { san: line.moves[moveCount], name: line.name };
        }
        
        // Simple manual fallbacks
        if (moveCount === 0) return { san: 'd4', name: 'London System' };
        if (moveCount === 2 && history[0] === 'd4' && history[1] !== 'd5' && history[1] !== 'Nf6') return { san: 'Bf4', name: 'London System (Setup)' };
    }
    else if (playerColor === 'white' && strategy === 'kings_indian') {
        for (const line of KID_BOOK) {
            if (line.moves.length <= moveCount) continue;
            let match = true;
            for (let i = 0; i < moveCount; i++) {
                if (history[i] !== line.moves[i]) { match = false; break; }
            }
            if (match) return { san: line.moves[moveCount], name: line.name };
        }
    }
    // (Other specific strategies: torre, colle, etc. omitted for brevity as they weren't requested for generic fallback)


    // 2. Generic Fallback Logic (if no specific book line matched)
    // We only fallback if the opponent hasn't created a chaotic tactical situation.
    // Heuristic: If last move was a capture or check, let Stockfish handle it.
    
    const verboseHistory = game.history({ verbose: true });
    if (verboseHistory.length > 0) {
        const lastMove = verboseHistory[verboseHistory.length - 1];
        if (lastMove.flags.includes('c') || lastMove.san.includes('+')) {
            return null; // Tactics/Capture -> Engine
        }
    }

    // Attempt to find a Generic System Move
    let genericSequence: GenericMove[] = [];
    let systemName = "";

    if (playerColor === 'black' && strategy === 'london') {
        genericSequence = LONDON_GENERIC;
        systemName = "London System (Generic)";
    } else if (playerColor === 'white' && strategy === 'kings_indian') {
        genericSequence = KID_GENERIC;
        systemName = "KID (Generic)";
    }

    if (genericSequence.length > 0) {
        const legalMoves = game.moves({ verbose: true });
        const legalSanMoves = game.moves();
        const turn = game.turn();

        for (const target of genericSequence) {
            // A: Check if this step is already "Done"
            if (target.san === 'O-O') {
                // Check if castled? Not easily available in chess.js public API directly without inspecting history or flags
                // But if we can play O-O, we haven't castled. If we can't, maybe we did or can't.
                // Simple check: If O-O is legal, we play it. If not, maybe we did it.
                // We'll skip the "Done" check for O-O and rely on legality.
            } else if (target.checkOccupied && target.to && target.piece) {
                const pieceAtTarget = game.get(target.to as Square);
                if (pieceAtTarget && pieceAtTarget.color === turn && pieceAtTarget.type === target.piece) {
                    continue; // Step already complete
                }
            }

            // B: Check if we can do this step now (Is it a legal move?)
            if (target.san) {
                if (legalSanMoves.includes(target.san)) {
                    return { san: target.san, name: systemName };
                }
            } else if (target.to && target.piece) {
                // Find a legal move that moves 'piece' to 'target.to'
                const move = legalMoves.find(m => m.to === target.to && m.piece === target.piece);
                if (move) {
                    return { san: move.san, name: systemName };
                }
            }
        }
    }

    // Default Fallbacks for very early game if generic fails (e.g. blocked)
    if (playerColor === 'white' && strategy === 'kings_indian') {
        const hist = game.history();
        if (hist.length === 1 && (hist[0] === 'e4' || hist[0] === 'd4')) return { san: 'd6', name: 'Pirc Defense' };
    }

    return null;
};

const formatStrategyName = (key: string): string => {
    const names: Record<string, string> = {
        london: "London System",
        torre: "Torre Attack",
        colle: "Colle-Zukertort",
        bird: "Bird's Opening",
        sokolsky: "Sokolsky / Orangutan",
        kings_indian: "King's Indian / Pirc",
        auto: "Auto",
        none: "Engine Default"
    };
    return names[key] || key;
};