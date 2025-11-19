class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.score = { black: 0, white: 0 };
        this.aiMode = false;
        this.isAiThinking = false;
        this.initializeBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateScoreDisplay();
    }

    initializeBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = `cell ${this.currentPlayer}-turn`;
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[i][j]}`;
                    cell.appendChild(piece);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }

    bindEvents() {
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.gameOver || this.isAiThinking) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.board[row][col] !== null) return;
            
            this.makeMove(row, col);
            
            if (!this.gameOver && this.aiMode && this.currentPlayer === 'white') {
                setTimeout(() => this.makeAiMove(), 500);
            }
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        document.getElementById('ai-btn').addEventListener('click', () => {
            this.toggleAiMode();
        });
    }

    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        this.renderBoard();
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.score[this.currentPlayer]++;
            this.updateScoreDisplay();
            this.showMessage(`游戏结束! ${this.currentPlayer === 'black' ? '黑子' : '白子'} 获胜!`, 'winner-message');
            return;
        }
        
        if (this.checkDraw()) {
            this.gameOver = true;
            this.showMessage('游戏结束! 平局!', 'draw-message');
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateStatus();
    }

    makeAiMove() {
        if (this.gameOver || this.isAiThinking) return;
        
        this.isAiThinking = true;
        this.updateStatus('AI思考中...');
        
        setTimeout(() => {
            const move = this.getBestMove();
            if (move) {
                this.makeMove(move.row, move.col);
            }
            this.isAiThinking = false;
        }, 1000);
    }

    getBestMove() {
        const availableMoves = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    const score = this.evaluatePosition(i, j);
                    availableMoves.push({ row: i, col: j, score });
                }
            }
        }
        
        if (availableMoves.length === 0) return null;
        
        availableMoves.sort((a, b) => b.score - a.score);
        
        const topMoves = availableMoves.slice(0, Math.min(5, availableMoves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    evaluatePosition(row, col) {
        let score = 0;
        
        score += this.evaluateDirection(row, col, 0, 1);
        score += this.evaluateDirection(row, col, 1, 0);
        score += this.evaluateDirection(row, col, 1, 1);
        score += this.evaluateDirection(row, col, 1, -1);
        
        const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
        score += (14 - centerDistance) * 10;
        
        return score;
    }

    evaluateDirection(row, col, dx, dy) {
        let score = 0;
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        
        for (let i = -4; i <= 0; i++) {
            let count = 0;
            let opponentCount = 0;
            let emptyCount = 0;
            
            for (let j = 0; j < 5; j++) {
                const newRow = row + dx * (i + j);
                const newCol = col + dy * (i + j);
                
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) {
                    break;
                }
                
                if (this.board[newRow][newCol] === this.currentPlayer) {
                    count++;
                } else if (this.board[newRow][newCol] === opponent) {
                    opponentCount++;
                } else {
                    emptyCount++;
                }
            }
            
            if (opponentCount === 0) {
                score += Math.pow(10, count);
            }
            
            if (count === 0 && opponentCount > 0) {
                score += Math.pow(8, opponentCount);
            }
        }
        
        return score;
    }

    checkWin(row, col) {
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === this.currentPlayer) {
                    count++;
                } else {
                    break;
                }
            }

            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === this.currentPlayer) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    checkDraw() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = null;
        
        if (this.aiMode && this.moveHistory.length > 0) {
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.row][aiMove.col] = null;
        }
        
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.renderBoard();
        this.updateStatus();
        this.hideMessage();
    }

    toggleAiMode() {
        this.aiMode = !this.aiMode;
        const aiBtn = document.getElementById('ai-btn');
        aiBtn.textContent = this.aiMode ? '人机对战' : 'AI对战';
        aiBtn.style.background = this.aiMode ? 
            'linear-gradient(45deg, #e91e63, #c2185b)' : 
            'linear-gradient(45deg, #9c27b0, #7b1fa2)';
        this.resetGame();
    }

    resetGame() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.isAiThinking = false;
        this.initializeBoard();
        this.renderBoard();
        this.updateStatus();
        this.hideMessage();
    }

    updateStatus(message = null) {
        const status = document.getElementById('status');
        if (message) {
            status.textContent = message;
        } else if (this.gameOver) {
            status.textContent = '游戏结束';
        } else {
            status.textContent = `当前玩家: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
        }
    }

    updateScoreDisplay() {
        document.getElementById('black-score').textContent = this.score.black;
        document.getElementById('white-score').textContent = this.score.white;
    }

    showMessage(message, className = '') {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = message;
        messageEl.className = `game-message ${className}`;
        messageEl.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideMessage();
        }, 3000);
    }

    hideMessage() {
        const messageEl = document.getElementById('game-message');
        messageEl.classList.add('hidden');
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});