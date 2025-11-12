class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.initializeBoard();
        this.renderBoard();
        this.bindEvents();
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
                cell.className = 'cell';
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
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.board[row][col] !== null) return;
            
            this.board[row][col] = this.currentPlayer;
            this.renderBoard();
            
            if (this.checkWin(row, col)) {
                this.gameOver = true;
                document.getElementById('status').textContent = `游戏结束! ${this.currentPlayer === 'black' ? '黑子' : '白子'} 获胜!`;
                return;
            }
            
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            document.getElementById('status').textContent = `当前玩家: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
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

            // 正向计数
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

            // 反向计数
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

    resetGame() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.initializeBoard();
        this.renderBoard();
        document.getElementById('status').textContent = '当前玩家: 黑子';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});