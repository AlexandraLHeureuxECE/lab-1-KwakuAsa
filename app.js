/**
 * Tic-Tac-Toe (2 players, same device)
 * - Mouse: click a cell
 * - Keyboard: Arrow keys to move focus, Enter/Space to place
 * - Restart anytime without refresh
 */

(() => {
    const boardEl = document.getElementById("board");
    const statusTextEl = document.getElementById("statusText");
    const liveRegionEl = document.getElementById("liveRegion");
    const restartBtn = document.getElementById("restartBtn");

    // Game state
    let board = Array(9).fill(null); // "X" | "O" | null
    let currentPlayer = "X";
    let gameOver = false;

    // Keyboard focus state (0..8)
    let focusedIndex = 0;

    // Precomputed winning lines
    const WIN_LINES = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // Build UI (9 buttons)
    const cells = [];
    function createBoardUI() {
        boardEl.innerHTML = "";
        cells.length = 0;

        for (let i = 0; i < 9; i++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "cell";
            btn.dataset.index = String(i);

            const row = Math.floor(i / 3) + 1;
            const col = (i % 3) + 1;
            btn.setAttribute("aria-label", `Row ${row} Column ${col}`);
            btn.setAttribute("aria-pressed", "false");

            // Click support (optional but allowed; keyboard is required)
            btn.addEventListener("click", () => {
                if (gameOver) return;
                setFocus(i);
                attemptMove(i);
            });

            cells.push(btn);
            boardEl.appendChild(btn);
        }
    }

    function announce(message) {
        // Update aria-live region for screen readers
        liveRegionEl.textContent = message;
    }

    function setStatusText(text) {
        statusTextEl.textContent = text;
    }

    function setFocus(index) {
        focusedIndex = index;

        // Visual focus (outline)
        cells.forEach((c) => c.classList.remove("focused"));
        cells[focusedIndex].classList.add("focused");

        // Real focus for assistive tech and clarity
        cells[focusedIndex].focus({ preventScroll: true });
    }

    function clearWinStyles() {
        cells.forEach((c) => c.classList.remove("win"));
    }

    function getWinner() {
        for (const line of WIN_LINES) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { player: board[a], line };
            }
        }
        return null;
    }

    function isDraw() {
        return board.every((v) => v !== null) && !getWinner();
    }

    function render() {
        clearWinStyles();

        // Update cell labels & disabled state
        for (let i = 0; i < 9; i++) {
            const v = board[i];
            const cell = cells[i];

            cell.textContent = v ? v : "";
            cell.disabled = gameOver || v !== null; // block moves when over, or on filled cells
            cell.setAttribute("aria-pressed", v ? "true" : "false");
        }

        const winner = getWinner();
        if (winner) {
            for (const idx of winner.line) cells[idx].classList.add("win");
            setStatusText(`${winner.player} wins!`);
            announce(`${winner.player} wins!`);
            gameOver = true;

            // Keep focus visible on the last focused cell
            setFocus(focusedIndex);
            return;
        }

        if (isDraw()) {
            setStatusText("Draw!");
            announce("Draw!");
            gameOver = true;
            setFocus(focusedIndex);
            return;
        }

        // Still playing
        setStatusText(`Turn: ${currentPlayer}`);
    }

    function attemptMove(index) {
        if (gameOver) return;

        if (board[index] !== null) {
            // Not allowed: occupied cell
            announce("That cell is already taken.");
            return;
        }

        board[index] = currentPlayer;

        // Switch player
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        announce(`Move placed. Turn: ${currentPlayer}`);

        render();
    }

    function restartGame() {
        board = Array(9).fill(null);
        currentPlayer = "X";
        gameOver = false;

        // Reset focus to top-left as required
        focusedIndex = 0;

        setStatusText("Turn: X");
        announce("New game started. Turn: X");
        render();
        setFocus(0);
    }

    // Arrow-key-only navigation + Enter/Space to place
    function handleKeyDown(e) {
        const key = e.key;

        // Only handle keys we care about
        const isArrow =
            key === "ArrowUp" ||
            key === "ArrowDown" ||
            key === "ArrowLeft" ||
            key === "ArrowRight";

        const isPlace = key === "Enter" || key === " ";

        if (!isArrow && !isPlace) return;

        // Prevent page scroll on arrows/space
        e.preventDefault();

        if (isArrow) {
            const row = Math.floor(focusedIndex / 3);
            const col = focusedIndex % 3;

            let newRow = row;
            let newCol = col;

            if (key === "ArrowUp") newRow = Math.max(0, row - 1);
            if (key === "ArrowDown") newRow = Math.min(2, row + 1);
            if (key === "ArrowLeft") newCol = Math.max(0, col - 1);
            if (key === "ArrowRight") newCol = Math.min(2, col + 1);

            const newIndex = newRow * 3 + newCol;
            setFocus(newIndex);
            return;
        }

        // Place mark (Enter/Space)
        if (isPlace) {
            if (gameOver) {
                announce("Game over. Press Restart / New Game to play again.");
                return;
            }
            attemptMove(focusedIndex);
        }
    }

    // Init
    createBoardUI();

    // Important: do NOT rely on Tab for navigation
    // We'll handle keys at the document level so arrow keys work regardless of where focus is.
    document.addEventListener("keydown", handleKeyDown);

    restartBtn.addEventListener("click", restartGame);

    // Start game
    restartGame();
})();
