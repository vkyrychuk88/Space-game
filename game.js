document.addEventListener('DOMContentLoaded', () => {
    // References to important DOM elements
    const gameContainer = document.getElementById('game-container');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const startButton = document.getElementById('startButton');
    const continueButton = document.getElementById('continueButton');
    const restartButton = document.getElementById('restartButton');
    const pauseMenu = document.getElementById('pauseMenu');
    const howToPlayButton = document.getElementById('howToPlayButton');
    const aboutUsButton = document.getElementById('aboutUsButton');
    const howToPlaySection = document.getElementById('howToPlaySection');
    const aboutUsSection = document.getElementById('aboutUsSection');
    const crawlSound = document.getElementById('crawlSound'); // Ensure this ID matches your audio element

    // Display How to Play section
    //---------------------------------------------------
    howToPlayButton.addEventListener('click', () => {
        howToPlaySection.style.display = 'block';
        crawlSound.play(); // Start the crawl sound
    });

    // Display About Us section
    //---------------------------------------------------
    aboutUsButton.addEventListener('click', () => {
        aboutUsSection.style.display = 'block';
        crawlSound.play(); // Start the crawl sound
    });
    //------------------------------------------------------
    // Close section functionality
    document.querySelectorAll('.closeButton').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.crawlSection').style.display = 'none';
            // Optional: Stop and reset crawl sound if needed
            const crawlSound = document.getElementById('crawlSound');
            if (crawlSound) {
                crawlSound.pause();
                crawlSound.currentTime = 0;
            }
        });
    });
    
    

    // Toggle pause
    continueButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', restartGame);

    // Initial game state variables
    let spaceshipPosition = 275; // Initial position of the spaceship in the game container
    const moveSpeed = 15; // Speed at which the spaceship moves left or right
    let score = 0; // Player's score
    let lives = 3; // Player's lives
    let gameRunning = false; // Flag to control the game's state
    let shield = null; // Global variable to hold the shield element
    let shieldActive = false;// Flag to control the shield's state
    let gamePaused = false;// Flag to control the game's pause state
    let animationFrameId = null;// Variable to hold the current animation frame ID
    //------------------------------------------------------
    


    // Sound effects setup
    const soundPaths = {
        shoot: 'sounds/shoot.wav',
        explosion: 'sounds/explosion.wav',
        gameOver: 'sounds/game0ver.wav' // Ensure the filename is correct
    };


    // Function to play sound effects
    function playSound(name) {
        if (!gameRunning || gamePaused) return;
        const sound = new Audio(soundPaths[name]);
        sound.play();
    }


    // Function to update the position of the spaceship
    function updateSpaceshipPosition() {
        const spaceship = document.getElementById('spaceship'); // Ensure this element exists in your HTML
        spaceship.style.left = `${spaceshipPosition}px`;
    }

    function updateGameStats() {
        scoreDisplay.textContent = `Score: ${score}`;
        livesDisplay.textContent = `Lives: ${lives}`;
    }

    
    // Function to update the displayed score
    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
    }


    // Function to update the displayed lives
    function updateLives() {
        livesDisplay.textContent = `Lives: ${lives}`;
    }




        // Reset game state
        function restartGame() {
            // Hide the pause menu
            const pauseMenu = document.getElementById('pauseMenu');
            if (pauseMenu) {
                pauseMenu.style.display = 'none';
            }
        
            // Cancel any existing game loops to prevent multiple loops from running
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        
            // Reset game state
            score = 0;
            lives = 3;
            gameRunning = true;
            gamePaused = false;
        
            // Optionally, reset any additional game states or positions here
        
            // Update the game stats display
            updateGameStats();
        
            // Re-initialize the game to reset positions, enemies, etc.
            initGame();
        
            // Start the game loop again
            gameLoop();// Start the game loop again
        }
        
        
    // Function to create and shoot bullets
    //---------------------------------------------------
    function createBullet() {
        if (!gameRunning) return; // Prevent shooting if the game is not running
        const bullet = document.createElement('div');// Create a bullet element
        bullet.classList.add('bullet');// Add a CSS class to the bullet element
        bullet.style.left = `${spaceshipPosition + 22.5}px`; // Center the bullet on the spaceship
        bullet.style.bottom = `30px`; // Starting bottom position
        gameContainer.appendChild(bullet);// Add the bullet to the game container
        moveBullet(bullet);// Animate the bullet movement
        playSound('shoot');// Play the shooting sound
    }


    // Function to animate bullet movement
    function moveBullet(bullet) {
        let bulletInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(bulletInterval);
                bullet.remove();
                return;
            }
            let position = parseInt(bullet.style.bottom);
            if (position > 400) {
                clearInterval(bulletInterval);
                bullet.remove();
            } else {
                bullet.style.bottom = `${position + 10}px`;
            }
        }, 1000 / 60); // 60 FPS for smooth animation
    }

    
    // Function to create enemies
    function createEnemy() {
        if (!gameRunning || gamePaused) return; // Stop creating new enemies if the game is not running or is paused
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        const startPosition = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
        enemy.style.left = `${startPosition}px`;
        enemy.style.top = `0px`;
        // Randomly select an enemy ship image
        const enemyImages = ['enemyship1.png', 'enemyship2.png', 'enemyship3.png'];
        const randomImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
        enemy.style.backgroundImage = `url('images/${randomImage}')`;
        enemy.style.backgroundSize = 'cover';
        gameContainer.appendChild(enemy);
        moveEnemy(enemy);
    }


    // Function to animate enemy movement
    function moveEnemy(enemy) {
        let position = parseInt(enemy.style.top);
        const speed = 2; // Adjusted speed for enemy movement
        function move() {
            if (!gameRunning || gamePaused) {
                enemy.remove(); // Optionally, stop moving but don't remove
                return;
            }
            if (position < gameContainer.offsetHeight) {
                position += speed;
                enemy.style.top = `${position}px`;
                requestAnimationFrame(move);
            } else {
                enemy.remove(); // Remove the enemy when it reaches the bottom
            }
        }
        move();
    }


    // Collision detection between bullets and enemies
    function checkCollision() {
        const enemies = document.querySelectorAll('.enemy');
        const bullets = document.querySelectorAll('.bullet');
        bullets.forEach(bullet => {
            const bulletRect = bullet.getBoundingClientRect();
            enemies.forEach(enemy => {
                const enemyRect = enemy.getBoundingClientRect();
                if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left &&
                    bulletRect.top < enemyRect.bottom && bulletRect.bottom > enemyRect.top) {
                    enemy.remove(); // Remove the enemy
                    bullet.remove(); // Remove the bullet
                    score += 10; // Increase the score
                    updateScore(); // Update the displayed score
                    playSound('explosion'); // Play explosion sound
                }
            });
        });
    }


    // Collision detection between the spaceship and enemies
    function checkSpaceshipCollision() {
        if (shieldActive) {
            console.log("Shield is protecting the spaceship.");
            return; // Skip the collision check if the shield is active
        }
        const enemies = document.querySelectorAll('.enemy');
        const spaceship = document.getElementById('spaceship');
        const spaceshipRect = spaceship.getBoundingClientRect();
        enemies.forEach(enemy => {
            const enemyRect = enemy.getBoundingClientRect();
            if (enemyRect.left < spaceshipRect.right && enemyRect.right > spaceshipRect.left &&
                enemyRect.bottom > spaceshipRect.top && enemyRect.top < spaceshipRect.bottom) {
                enemy.remove(); // Remove the enemy
                lives -= 1; // Decrease lives
                updateLives(); // Update the displayed lives
                if (lives <= 0) {
                    gameOver(); // Handle game over
                }
            }
        });
    }


    // Function to generate stars in the background
    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = star.style.width; // Make it a square for simplicity
        star.style.left = `${Math.random() * gameContainer.offsetWidth}px`;
        star.style.top = `${-size}px`; // Start just above the game container
        gameContainer.appendChild(star);
        moveStar(star);
    }


    // Function to animate star movement
    function moveStar(star) {
        let position = parseFloat(star.style.top);
        const speed = Math.random() * 2 + 1;
    
        function move() {
            if (position < gameContainer.offsetHeight) {
                position += speed;
                star.style.top = `${position}px`;
                requestAnimationFrame(move);
            } else {
                star.remove(); // Remove star once it's out of bounds
                createStar(); // Optionally create a new star to maintain density
            }
        }
        move();
    }

    
    // Generate initial set of stars for background effect
    function generateStars() {
        for (let i = 0; i < 100; i++) { // Create 100 stars
            createStar();
        }
    }


// Creates a power-up and adds it to the game
function createPowerUp() {
    if (!gameRunning) return;
    const powerUp = document.createElement('div');
    powerUp.classList.add('powerUp');
    powerUp.style.left = `${Math.random() * (gameContainer.offsetWidth - 20)}px`;
    powerUp.style.top = `-30px`;
    gameContainer.appendChild(powerUp);
    movePowerUp(powerUp);
}


// Animates the power-up's downward movement
function movePowerUp(powerUp) {
    let position = parseInt(powerUp.style.top);
    const speed = 3;
    function move() {
        if (!gameRunning) {
            powerUp.remove();
            return;
        }
        if (position < gameContainer.offsetHeight) {
            position += speed;
            powerUp.style.top = `${position}px`;
            requestAnimationFrame(move);
        } else {
            powerUp.remove();
        }
    }
    move();
}
// Checks for collisions between the spaceship and power-ups
function checkPowerUpCollision() {
    const powerUps = document.querySelectorAll('.powerUp');
    const spaceshipRect = document.getElementById('spaceship').getBoundingClientRect();
    powerUps.forEach(powerUp => {
        const powerUpRect = powerUp.getBoundingClientRect();
        if (powerUpRect.left < spaceshipRect.right && powerUpRect.right > spaceshipRect.left &&
            powerUpRect.top < spaceshipRect.bottom && powerUpRect.bottom > spaceshipRect.top) {
            console.log('Power-Up Collected!'); // Debugging line
            powerUp.remove(); // Confirm this happens
            activatePowerUp(); // Check if this function is called
        }
    });
}


// Activates the shield power-up's effect
function activatePowerUp() {
    shieldActive = true;
    if (!shield) {
        shield = document.createElement('div');
        shield.id = 'shield';
        gameContainer.appendChild(shield);
    }
    shield.style.display = 'block';
    updateShieldPosition();
    // Optionally, set a different color for the last flashing phase
    setTimeout(() => {
        shield.style.setProperty('--shield-color', 'red'); // Change color for flashing effect
        shield.classList.add('flashing');
    }, 2000); // Adjust timing based on total duration

    // Hide the shield after a set amount of time
    setTimeout(() => {
        shieldActive = false;
        shield.style.display = 'none';
        shield.classList.remove('flashing');
        shield.style.removeProperty('--shield-color'); // Reset to default color
    }, 5000); // Total duration of the shield effect
}


// Updates the shield's position to match the spaceship's current location
function updateShieldPosition() {
    if (!shield || !gameRunning) return;
    const spaceship = document.getElementById('spaceship');
    const rect = spaceship.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();
    shield.style.left = `${rect.left - gameContainerRect.left + spaceship.offsetWidth / 2 - shield.offsetWidth / 2}px`;
    shield.style.top = `${rect.top - gameContainerRect.top + spaceship.offsetHeight / 2 - shield.offsetHeight / 2}px`;
}
    
// Example of integrating into the game loop
setInterval(createPowerUp, 15000); // Create a power-up every 15 seconds
// Modify your game loop to include power-up collision checks

function gameLoop() {
    if (!gameRunning || gamePaused) {
        cancelAnimationFrame(animationFrameId);
        return;
    }
    // Game logic...
    checkCollision();
    checkSpaceshipCollision();
    checkPowerUpCollision();
    // Continue the loop
    if (shieldActive) {
        updateShieldPosition();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}


// Call gameLoop() in a suitable place in your code, such as within requestAnimationFrame or setInterval
    // Handle game over logic
    function gameOver() {
        gameRunning = false; // Stop the game
        playSound('gameOver'); // Play the game over sound
        // Clear the game area
        document.querySelectorAll('.enemy, .bullet').forEach(element => element.remove());
        // Display the game over notice
        const gameOverNotice = document.createElement('div');
        gameOverNotice.id = 'gameOverNotice';
        gameOverNotice.innerHTML = `Game Over<br>Your score: ${score}`;
        
        const replayButton = document.createElement('button');
        replayButton.id = 'replayButton';
        replayButton.textContent = 'Replay';
        gameOverNotice.appendChild(replayButton);
        gameContainer.appendChild(gameOverNotice);
        // Replay button event listener
        replayButton.addEventListener('click', resetGame);
    }
    // Reset the game to its initial state
    function resetGame() {
        document.getElementById('gameOverNotice').remove();
        score = 0;
        lives = 3;
        updateScore();
        updateLives();
        gameRunning = true; // Allow the game to run again
        generateStars(); // Regenerate stars
        // Re-initialize other game elements as needed
    }


    // Event listeners for player input
// Event listeners for player input, updated to include pause functionality
window.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return; // Prevent further execution when pausing
    }

    if (!gameRunning || gamePaused) return; // Ignore input if the game is not running or is paused

    switch (e.key) {
        case 'ArrowLeft':
            spaceshipPosition = Math.max(0, spaceshipPosition - moveSpeed);
            break;
        case 'ArrowRight':
            spaceshipPosition = Math.min(gameContainer.offsetWidth - 50, spaceshipPosition + moveSpeed);
            break;
        case ' ':
            e.preventDefault();
            createBullet();
            break;
    }
    updateSpaceshipPosition();
    // Optionally, update the shield position if it's part of your game's functionality
});

// Toggle pause
// Toggle game pause state
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        // Show pause menu and stop actions
        pauseMenu.style.display = 'flex';
        // Optionally, clear intervals or timeouts here
    } else {
        // Hide pause menu and resume actions
        pauseMenu.style.display = 'none';
        // Reinitialize intervals or request animation frame here
        gameLoop();
    }
}

    
    // Initialize the game on "Start Game" button click
    // Start Game button event listener
    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none'; // Ensure this targets the start screen's container
        gameRunning = true;
        gameContainer.style.display = 'block'; // Make the game container visible
        initGame();
        gameLoop(); // Start the game loop
    });
    
    
    // Initialize the game entities and logic
    function initGame() {
        gameRunning = true;
        generateStars(); // Begin generating stars for the moving background effect
        // Adjust as needed for game difficulty
        setInterval(createEnemy, 2000);
        setInterval(() => {
            checkCollision();
            checkSpaceshipCollision();
        }, 100); // Frequent checks for collisions
    }
});


