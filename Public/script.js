// Test comment to verify GitHub Actions fix
document.addEventListener("DOMContentLoaded", () => {
    // --- Select Elements (No change here) ---
    const menuContainer = document.getElementById("menuContainer");
    const startBtn = document.getElementById("startBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const exitBtn = document.getElementById("exitBtn");
    const gameContainer = document.getElementById("gameContainer");
    const gridContainer = document.getElementById("gridContainer");
    const message = document.getElementById("message");
    const restartBtn = document.getElementById("restartBtn");
    const playerNameInput = document.getElementById("playerName");
    const displayPlayerName = document.getElementById("displayPlayerName");
    const diamondCountEl = document.getElementById("diamondCount");
    const historyList = document.getElementById("historyList");

    // --- Game Variables ---
    // =======================================================================
    // MODIFICATION: Removed the old API_URL variable. We don't need it.
    // const API_URL = "/api/players"; 
    // =======================================================================
    let gridSize = 9;
    let playerPosition = 0;
    let npcPosition = 0;
    let diamondsCollected = 0;
    let npcInterval;
    let npcSpeed = 400; 
    let playerName = "";
    let playerHistory = [];
    let playerTrail = [];
    let gameActive = true; 
    
    const EXIT_POS = gridSize * gridSize - 1;


    // --- Helper Function: Get Random Starting Position for Diamond (No change) ---
    function getStartingNpcPosition() {
        const playerRow = 0;
        const playerCol = 0;
        
        const nearbyPositions = [];
        for (let r = playerRow; r <= playerRow + 1; r++) {
            for (let c = playerCol; c <= playerCol + 1; c++) {
                const pos = r * gridSize + c;
                if (pos < gridSize * gridSize && pos !== playerPosition && pos !== EXIT_POS) {
                    nearbyPositions.push(pos);
                }
            }
        }
        
        if (nearbyPositions.length === 0) {
            return 1; 
        }

        const randomIndex = Math.floor(Math.random() * nearbyPositions.length);
        return nearbyPositions[randomIndex];
    }


    // --- Utility Function: Clear NPC Interval (No change) ---
    function stopNPC() {
        if (npcInterval) {
            clearInterval(npcInterval);
        }
    }

    // --- Create Grid (No change) ---
    function createGrid() {
        gridContainer.innerHTML = "";
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
        gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;
        
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            gridContainer.appendChild(cell);
        }
        
        const cells = document.querySelectorAll(".cell");
        if (cells.length > 0) {
            cells[EXIT_POS].textContent = "🚪";
        }
        updateGrid();
    }

    // --- Update Player/NPC on Grid (No change) ---
    function updateGrid() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell, index) => {
            if (index !== EXIT_POS) {
                cell.textContent = "";
            } else {
                cell.textContent = "🚪";
            }
            
            cell.classList.remove("trail", "blast-effect", "escape-effect", "player-win", "npc-win");
        });

        playerTrail.forEach(pos => {
            if (pos !== playerPosition) {
                 cells[pos].classList.add("trail");
            }
        });

        if (playerPosition >= 0 && playerPosition < cells.length) {
            cells[playerPosition].textContent = "🧍";
        }

        if (npcPosition >= 0 && npcPosition < cells.length && playerPosition !== npcPosition && npcPosition !== EXIT_POS) {
            cells[npcPosition].textContent = "💎";
        }
        
        if (npcPosition === EXIT_POS && playerPosition !== EXIT_POS) {
             cells[EXIT_POS].textContent = "🚪💎"; 
        }
    }

    // --- Player Movement (No change) ---
    function movePlayer(direction) {
        if (!gameActive) {
            return;
        }

        const row = Math.floor(playerPosition / gridSize);
        const col = playerPosition % gridSize;
        let newPosition = playerPosition;

        switch (direction) {
            case "ArrowUp":
                if (row > 0) newPosition -= gridSize;
                break;
            case "ArrowDown":
                if (row < gridSize - 1) newPosition += gridSize;
                break;
            case "ArrowLeft":
                if (col > 0) newPosition -= 1;
                break;
            case "ArrowRight":
                if (col < gridSize - 1) newPosition += 1;
                break;
        }
        
        if (newPosition !== playerPosition) {
            playerTrail.push(playerPosition);
            playerPosition = newPosition;
            checkCollision();
            updateGrid();
        }
    }

    // --- NPC/Diamond Movement (No change) ---
    function moveNPC() {
        if (!gameActive) return;

        const exitRow = Math.floor(EXIT_POS / gridSize);
        const exitCol = EXIT_POS % gridSize;

        let bestMove = npcPosition;
        let minDistanceToExit = Infinity;
        
        const possibleMoves = [-gridSize, gridSize, -1, 1]
            .map(d => npcPosition + d)
            .filter(pos => pos >= 0 && pos < gridSize * gridSize);

        for (const pos of possibleMoves) {
            const nextRow = Math.floor(pos / gridSize);
            const nextCol = pos % gridSize;
            
            const distance = Math.abs(exitRow - nextRow) + Math.abs(exitCol - nextCol);

            if (distance < minDistanceToExit) {
                minDistanceToExit = distance;
                bestMove = pos;
            }
        }

        if (bestMove !== npcPosition) {
            npcPosition = bestMove;
        }
        
        checkCollision();
        updateGrid();
    }

    // --- Collision Detection (No change) ---
    function checkCollision() {
        const cells = document.querySelectorAll(".cell");
        
        if (npcPosition === EXIT_POS) {
            message.textContent = "💨 You Lost! Diamond Escaped.";
            gameActive = false; 
            cells.forEach(cell => cell.textContent = "");
            cells[EXIT_POS].textContent = "💎"; 
            cells[EXIT_POS].classList.add("npc-win"); 
            endGame(false); 
            return;
        }
        
        if (playerPosition === npcPosition) {
            message.textContent = "🏆 Player Win! Diamond Captured!";
            gameActive = false;
            cells.forEach(cell => cell.textContent = "");
            cells[playerPosition].textContent = "🧍"; 
            cells[playerPosition].classList.add("player-win"); 
            diamondsCollected++;
            diamondCountEl.textContent = diamondsCollected;
            endGame(true); 
        }
    }

    // =======================================================================
    // MODIFICATION: Removed the old saveGameResult function.
    // async function saveGameResult(record) { ... }
    // =======================================================================


    // --- Game Flow Functions ---
    function startGame(isRestart = false) {
        if (!isRestart) {
            playerName = playerNameInput.value.trim();
            if (!playerName) {
                alert("Please enter your name first!");
                return;
            }
        }
        
        stopNPC(); 
        menuContainer.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        gameActive = true; 
        message.textContent = "";
        restartBtn.classList.add("hidden");
        playerPosition = 0;    
        npcPosition = getStartingNpcPosition(); 
        playerTrail = [];

        createGrid();
        displayPlayerName.textContent = `🧍 ${playerName}`;
        diamondCountEl.textContent = diamondsCollected;

        npcInterval = setInterval(moveNPC, npcSpeed);
    }

    // =======================================================================
    // MODIFICATION: The endGame function is updated to call Firebase.
    // =======================================================================
    function endGame(won) {
        stopNPC();
        restartBtn.classList.remove("hidden");

        // 1. Determine the result for Firebase ('win' or 'lose')
        const gameResultForFirebase = won ? "win" : "lose";

        // 2. Call the global Firebase function from firebase-init.js
        // We check if the function exists before calling it, which is good practice.
        if (window.recordGameResult) {
            window.recordGameResult(gameResultForFirebase, playerName);
        } else {
            console.error("Firebase function not found. Is firebase-init.js loaded correctly?");
        }

        // 3. This part for the local history display remains the same.
        const resultForDisplay = won ? "🏆 Win" : "💥 Lost";
        const record = { name: playerName, result: resultForDisplay, diamonds: diamondsCollected };
        playerHistory.push(record);
        updateHistory();

        setTimeout(() => {
            message.textContent = "Press Restart or Exit";
        }, 1500);
    }

    function restartGame() {
        startGame(true);
    }

    function exitGame() {
        stopNPC();
        playerName = "";
        diamondsCollected = 0;
        diamondCountEl.textContent = 0;
        playerNameInput.value = "";
        startBtn.disabled = true; 
        menuContainer.classList.remove("hidden");
        gameContainer.classList.add("hidden");
    }

    function openSettings() {
        alert("⚙️ Settings feature coming soon! You could adjust grid size or speed here.");
    }

    function updateHistory() {
        historyList.innerHTML = "";
        playerHistory.slice().reverse().forEach((entry) => {
            const li = document.createElement("li");
            if (entry.name === playerName) {
                li.classList.add("current-player");
            }
            li.innerHTML = `<span>${entry.name}</span> <span>${entry.result}</span>`;
            historyList.appendChild(li);
        });
    }

    // --- Event Listeners (Cleaned up duplicates) ---
    startBtn.addEventListener("click", () => startGame(false));
    restartBtn.addEventListener("click", restartGame);
    exitBtn.addEventListener("click", exitGame);
    settingsBtn.addEventListener("click", openSettings);

    playerNameInput.addEventListener("input", () => {
        startBtn.disabled = playerNameInput.value.trim() === "";
    });

    document.addEventListener("keydown", (e) => {
        if (gameActive) {
            // Define all valid movement keys, mapping WASD to their corresponding Arrow key actions
            let directionKey = null;

            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    directionKey = 'ArrowUp';
                    break;
                case 's':
                case 'arrowdown':
                    directionKey = 'ArrowDown';
                    break;
                case 'a':
                case 'arrowleft':
                    directionKey = 'ArrowLeft';
                    break;
                case 'd':
                case 'arrowright':
                    directionKey = 'ArrowRight';
                    break;
            }

            if (directionKey) {
                e.preventDefault(); // Prevent default browser scroll behavior
                movePlayer(directionKey);
            }
        }
    });
});