import { Card } from "./models/Card.js";
import { getRandomCard } from "./api.js";
import { showToast, hidePersistentToast, showPersistentToast } from "./utils.js";

const deckSelect = document.getElementById('combatDeckSelect');
const startBtn = document.getElementById('startCombat');
const playerCardsContainer = document.getElementById('playerCards');
const botCardsContainer = document.getElementById('botCards');
const playerCardDiv = document.getElementById('playerCard');
const botCardDiv = document.getElementById('botCard');
const playerHPBar = document.getElementById('playerHPBar');
const botHPBar = document.getElementById('botHPBar');
const resultDisplay = document.getElementById('combatResult');
const combatHistory = document.getElementById('combatHistory');

let playerDeck = [], botDeck = [];
let playerIndex = 0, botIndex = 0;
let playerCard = null, botCard = null;
let playerHP = 100, botHP = 100;
let playerMaxHP = 100, botMaxHP = 100;
let waitingForPlayerChoice = true;
let lastDie = "player";

document.addEventListener('DOMContentLoaded', () => {
    const decks = JSON.parse(localStorage.getItem('decks')) || [];
    decks.forEach((deck, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = deck.name;
        deckSelect.appendChild(opt);
    });

    playerCardDiv.addEventListener('dragover', (e) => e.preventDefault());

    playerCardDiv.addEventListener('dragenter', () => {
        playerCardDiv.classList.add('dragover');
    });

    playerCardDiv.addEventListener('dragleave', () => {
        playerCardDiv.classList.remove('dragover');
    });

    playerCardDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        playerCardDiv.classList.remove('dragover');
        const index = parseInt(e.dataTransfer.getData('text/plain'));
        const card = playerDeck[index];
        if (card._isKO) {
            showToast("Cette carte est KO !");
            return;
        }

        playerIndex = index;
        playerCard = card;
        playerMaxHP = getCardHP(playerCard);
        playerHP = playerMaxHP;

        setCombatCard(playerCardDiv, playerCard);
        updateHPBars();
        waitingForPlayerChoice = false;
        hidePersistentToast();
        startAutoBattle();
    });
});

startBtn.addEventListener('click', async () => {
    const selectedIndex = deckSelect.value;
    const decks = JSON.parse(localStorage.getItem('decks')) || [];
    if (!decks[selectedIndex]) return alert("Deck invalide.");

    const playerIds = decks[selectedIndex].cards;
    playerDeck = await Promise.all(playerIds.map(id => Card.load(id)));
    botDeck = await getRandomBotDeck(5);

    playerIndex = 0;
    botIndex = 0;
    botCard = botDeck[botIndex];
    botMaxHP = getCardHP(botCard);
    botHP = botMaxHP;

    displayDeck(playerDeck, playerCardsContainer, true);
    displayDeck(botDeck, botCardsContainer, false);

    setCombatCard(botCardDiv, botCard);
    updateHPBars();

    showPersistentToast("Glisse une carte sur le terrain pour commencer !");
});

function getCardHP(card) {
    return Math.min(parseInt(card.hp) || 50, 200);
}

async function getRandomBotDeck(count) {
    return await getRandomCard(count);
}

function displayDeck(cards, container, isPlayer = false) {
    container.innerHTML = '';
    cards.forEach((card, index) => {
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.name;
        img.className = "w-full max-w-[80px] aspect-[63/88] object-cover rounded transition-transform hover:scale-105";
        img.dataset.index = index;

        if (card._isKO) {
            img.classList.add("grayscale", "opacity-30");
        }

        if (isPlayer) {
            img.draggable = true;
            img.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
            });
        }

        container.appendChild(img);
    });
}

function setCombatCard(container, card) {
    container.innerHTML = `<img src="${card.image}" class="card-img F object-cover rounded shadow-lg transition duration-300">`;
}

function updateHPBars() {
    const playerPercentage = (playerHP / playerMaxHP) * 100;
    const botPercentage = (botHP / botMaxHP) * 100;

    playerHPBar.style.width = `${playerPercentage}%`;
    botHPBar.style.width = `${botPercentage}%`;
}

function showResult(msg) {
    resultDisplay.textContent = msg;
    playerIndex = 0;
    botIndex = 0;
    playerDeck.forEach(card => card._isKO = false);
    botDeck.forEach(card => card._isKO = false);
    playerCard = null;
    botCard = null;
    playerHP = 100;
    botHP = 100;
    playerCardsContainer.innerHTML = '';
    botCardsContainer.innerHTML = '';
    playerCardDiv.innerHTML = '';
    botCardDiv.innerHTML = '';
    playerHPBar.style.width = '100%';
    botHPBar.style.width = '100%';
    waitingForPlayerChoice = true;
    lastDie = "player";
    combatHistory.innerHTML = '';
    updateKOStyles();
    showEndModal();
}

function showEndModal() {
    const modal = document.getElementById('combatEndModal');
    const ratingStars = document.getElementById('combatEndRating');
    ratingStars.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'cursor-pointer text-yellow-500';
        star.innerHTML = '&#9733;';
        star.addEventListener('click', () => {
            ratingStars.querySelectorAll('span').forEach((s, idx) => {
                s.classList.toggle('text-yellow-500', idx < i);
                s.classList.toggle('text-gray-400', idx >= i);
            });
            showToast(`Tu as noté cet adversaire ${i} étoiles !`);
            hidePersistentToast();
        });
        ratingStars.appendChild(star);
    }
    modal.style.display = 'block';
    const closeBtn = document.getElementById('combatEndClose');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        hidePersistentToast();
    });
}

async function startAutoBattle() {
    if (waitingForPlayerChoice) return;

    await new Promise(r => setTimeout(r, 1500));

    if (lastDie === "player") {
        await playerAttack();
        if (handleKO()) return;
        await botAttack();
        if (handleKO()) return;
    } else if (lastDie === "bot") {
        await botAttack();
        if (handleKO()) return;
        await playerAttack();
        if (handleKO()) return;
    }

    if (!waitingForPlayerChoice) {
        await startAutoBattle();
    }
}

function handleKO() {
    if (playerHP <= 0) {
        playerDeck[playerIndex]._isKO = true;
        lastDie = "player";
        showToast(`${playerCard.name} est KO !`);
        updateKOStyles();
        if (playerDeck.every(c => c._isKO)) {
            showResult("💀 Tous tes Pokémon sont KO. Tu as perdu.");
            return true;
        }
        waitingForPlayerChoice = true;
        showPersistentToast("Choisis ton prochain Pokémon !");
        return true;
    }

    if (botHP <= 0) {
        botDeck[botIndex]._isKO = true;
        lastDie = "bot";
        showToast(`${botCard.name} est KO !`);
        updateKOStyles();
        botIndex++;
        if (botIndex >= botDeck.length) {
            showResult("🎉 Tu as gagné le combat !");
            return true;
        }
        botCard = botDeck[botIndex];
        botHP = getCardHP(botCard);
        setCombatCard(botCardDiv, botCard);
        updateHPBars();
    }

    return false;
}

function updateKOStyles() {
    playerCardsContainer.querySelectorAll('img').forEach((img, idx) => {
        if (playerDeck[idx]._isKO) {
            img.classList.add('grayscale', 'opacity-30');
        }
    });
    botCardsContainer.querySelectorAll('img').forEach((img, idx) => {
        if (botDeck[idx]._isKO) {
            img.classList.add('grayscale', 'opacity-30');
        }
    });
}

function chooseAttack(card) {
    const attacks = (card.attacks || []).filter(atk => /\d+/.test(atk.damage));
    return attacks.length ? attacks[Math.floor(Math.random() * attacks.length)] : null;
}

function animateDamage(img) {
    if (!img) return;
    img.classList.add('ring-4', 'ring-red-500');
    setTimeout(() => img.classList.remove('ring-4', 'ring-red-500'), 500);
}

function addOnHistory(type, msg) {
    const li = document.createElement('li');
    li.textContent = msg;
    let className = '';
    switch (type) {
        case 'action':
            className = 'text-gray-300';
            break;
        case 'playerDamage':
            className = 'text-green-500';
            break;
        case 'botDamage':
            className = 'text-red-500';
    }
    li.className = className;
    combatHistory.appendChild(li);
    combatHistory.scrollTop = combatHistory.scrollHeight;
}

async function playerAttack() {
    if (playerHP > 0 && botHP > 0) {
        const playerAtk = chooseAttack(playerCard);
        const botImg = botCardDiv.querySelector('img');

        if (playerAtk) {
            showToast(`${playerCard.name} utilise ${playerAtk.name} !`);
            addOnHistory("action", `${playerCard.name} utilise ${playerAtk.name} !`);
            botHP = Math.max(0, botHP - parseInt(playerAtk.damage));
            addOnHistory("playerDamage", `${botCard.name} perd ${parseInt(playerAtk.damage)} PV !`)
            animateDamage(botImg);
            updateHPBars();
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    if (botHP <= 0 || playerHP <= 0) return handleKO();
}

async function botAttack() {
    if (playerHP > 0 && botHP > 0) {
        const botAtk = chooseAttack(botCard);
        const playerImg = playerCardDiv.querySelector('img');

        if (botAtk) {
            showToast(`${botCard.name} utilise ${botAtk.name} !`);
            addOnHistory("action", `${botCard.name} utilise ${botAtk.name} !`);
            playerHP = Math.max(0, playerHP - parseInt(botAtk.damage));
            addOnHistory("botDamage", `${playerCard.name} perd ${parseInt(botAtk.damage)} PV !`)
            animateDamage(playerImg);
            updateHPBars();
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    if (botHP <= 0 || playerHP <= 0) return handleKO();
}
