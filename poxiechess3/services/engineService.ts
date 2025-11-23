import { STOCKFISH_URL } from '../constants';

export class EngineService {
    private worker: Worker | null = null;
    public isReady: boolean = false;
    private onMessageCallback: (data: string) => void;

    constructor(onMessage: (data: string) => void) {
        this.onMessageCallback = onMessage;
        this.init();
    }

    private async init() {
        try {
            const response = await fetch(STOCKFISH_URL);
            const blob = new Blob([await response.text()], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
            
            this.worker.onmessage = (e) => {
                const line = e.data;
                if (line === 'uciok') this.isReady = true;
                this.onMessageCallback(line);
            };

            this.worker.postMessage('uci');
        } catch (e) {
            console.error("Failed to load Stockfish engine", e);
        }
    }

    public sendCommand(cmd: string) {
        if (this.worker) {
            this.worker.postMessage(cmd);
        }
    }

    public stop() {
        this.sendCommand('stop');
    }

    public analyze(fen: string, skillLevel: number) {
        this.stop();
        this.sendCommand(`setoption name Skill Level value ${skillLevel}`);
        this.sendCommand(`position fen ${fen}`);
        // Calculate move time based on skill level: 500ms base + 50ms per level
        const moveTime = 500 + (skillLevel * 50);
        this.sendCommand(`go movetime ${moveTime}`);
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}
