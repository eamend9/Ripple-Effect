// DOM Elements
const pointsDisplay = document.getElementById('pointsDisplay');
const generateChallengeBtn = document.getElementById('generateChallengeBtn');
const completeChallengeBtn = document.getElementById('completeChallengeBtn');
const userPointsDisplay = document.getElementById('userPoints');
const leaderboardList = document.getElementById('leaderboardList');
const challengesCompletedEl = document.getElementById('challengesCompleted');
const currentStreakEl = document.getElementById('currentStreak');
const badgesUnlockedEl = document.getElementById('badgesUnlocked');

// Initialize points and stats from localStorage or set to 0
let ripplePoints = 0;
let challengesCompleted = 0;
let currentStreak = 0;
let lastPoints = 0;

// Reset all data in localStorage
localStorage.setItem('ripplePoints', '0');
localStorage.setItem('challengesCompleted', '0');
localStorage.setItem('currentStreak', '0');
localStorage.removeItem('dailyChallenge');

// Update all point displays
function updatePointsDisplay() {
    pointsDisplay.textContent = `${ripplePoints} Ripple Points`;
    userPointsDisplay.textContent = `${ripplePoints} points`;
    localStorage.setItem('ripplePoints', ripplePoints.toString());
    
    // Update stats display
    updateStatsDisplay();
    
    // Animate leaderboard points
    animateLeaderboardPoints();
    
    lastPoints = ripplePoints;
}

// Update stats display
function updateStatsDisplay() {
    challengesCompletedEl.textContent = challengesCompleted;
    currentStreakEl.textContent = currentStreak;
    
    // Calculate badges unlocked
    const badges = document.querySelectorAll('.badge-card');
    let unlockedCount = 0;
    badges.forEach(badge => {
        if (!badge.classList.contains('locked')) {
            unlockedCount++;
        }
    });
    badgesUnlockedEl.textContent = unlockedCount;
    
    // Save to localStorage
    localStorage.setItem('challengesCompleted', challengesCompleted.toString());
    localStorage.setItem('currentStreak', currentStreak.toString());
}

// Create ripple effect on button click
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Animate leaderboard points
function animateLeaderboardPoints() {
    const pointsElement = userPointsDisplay;
    pointsElement.style.transform = 'scale(1.2)';
    pointsElement.style.transition = 'transform 0.3s ease-in-out';
    
    setTimeout(() => {
        pointsElement.style.transform = 'scale(1)';
    }, 300);
}

// Add points when challenge is completed
function addRipplePoints(event) {
    createRipple(event);
    ripplePoints += 10;
    challengesCompleted++;
    currentStreak++;
    
    updatePointsDisplay();
    updateBadges();
}

// Kindness challenges
const kindnessActs = [
    "Compliment 3 strangers today",
    "Donate clothes you haven't worn in 6 months",
    "Volunteer at a local shelter for 1 hour",
    "Pay for someone's coffee or meal",
    "Write a thank-you note to a community worker",
    "Plant a tree or care for public greenery",
    "Help a neighbor with groceries or chores",
    "Mentor someone for 30 minutes",
    "Collect and recycle 10 pieces of litter",
    "Donate blood or register as an organ donor"
];

// Challenge duration (24 hours)
const challengeDuration = 24 * 60 * 60 * 1000;

// Get stored challenge from localStorage
function getStoredChallenge() {
    const challenge = localStorage.getItem('dailyChallenge');
    return challenge ? JSON.parse(challenge) : null;
}

// Store new challenge in localStorage
function storeNewChallenge(act) {
    const challenge = {
        act: act,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('dailyChallenge', JSON.stringify(challenge));
}

// Update challenge display
function updateChallengeDisplay() {
    const storedChallenge = getStoredChallenge();
    const challengeElement = document.getElementById('currentChallenge');
    const timerElement = document.getElementById('timer');

    if (storedChallenge && (Date.now() - storedChallenge.timestamp) < challengeDuration) {
        const timeLeft = challengeDuration - (Date.now() - storedChallenge.timestamp);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        challengeElement.textContent = storedChallenge.act;
        timerElement.textContent = `⏳ ${hoursLeft}h ${minutesLeft}m remaining`;
    } else {
        challengeElement.textContent = "Ready for your daily kindness mission?";
        timerElement.textContent = "";
        
        // Reset streak if challenge expired
        if (storedChallenge) {
            currentStreak = 0;
            updateStatsDisplay();
        }
    }
}

// Generate new challenge
function generateNewChallenge(event) {
    createRipple(event);
    const randomIndex = Math.floor(Math.random() * kindnessActs.length);
    const newAct = kindnessActs[randomIndex];
    storeNewChallenge(newAct);
    updateChallengeDisplay();
}

// Update badges based on points
function updateBadges() {
    const badges = document.querySelectorAll('.badge-card');
    let hasNewUnlock = false;
    let lastUnlockedBadge = null;

    badges.forEach(badge => {
        const required = parseInt(badge.dataset.required);
        const progressFill = badge.querySelector('.badge-progress-fill');
        const currentPoints = parseInt(ripplePoints);
        const wasLocked = badge.classList.contains('locked');
        
        const progress = Math.min((currentPoints / required) * 100, 100);
        progressFill.style.width = `${progress}%`;

        if (currentPoints >= required) {
            if(wasLocked) {
                hasNewUnlock = true;
                lastUnlockedBadge = badge;
            }
            
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
            badge.querySelector('.locked-badge').innerHTML = '<i class="fas fa-unlock"></i>';
        }
    });

    // Update stats display to reflect new badges
    updateStatsDisplay();

    // Scroll to newly unlocked badge
    if (hasNewUnlock && lastUnlockedBadge) {
        setTimeout(() => {
            const row = lastUnlockedBadge.closest('.badge-row');
            if (row) {
                const nav = document.querySelector('.nav');
                const navHeight = nav.offsetHeight;
                const rowTop = row.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: rowTop,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const nav = document.querySelector('.nav');
            const navHeight = nav.offsetHeight;
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    updatePointsDisplay();
    updateChallengeDisplay();
    updateBadges();
    
    // Event listeners
    generateChallengeBtn.addEventListener('click', generateNewChallenge);
    completeChallengeBtn.addEventListener('click', addRipplePoints);
    
    // Update challenge timer every minute
    setInterval(updateChallengeDisplay, 60000);
});
