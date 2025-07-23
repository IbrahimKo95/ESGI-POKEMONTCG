import {Card} from "./models/Card.js";
import { showToast} from "./utils.js";

const cardsContainer = document.getElementById('cardsContainer');
const selectedCardsContainer = document.getElementById('selectedCardsContainer');
let selectedCards = [];
let editingDeckIndex = null;

async function loadMyCards() {
    cardsContainer.innerHTML = '';
    const myCards = localStorage.getItem('cards');
    if (myCards) {
        const cards = JSON.parse(myCards);
        cards.map(async cardData => {
            const card = await Card.load(cardData.id);
            const cardDiv = document.createElement('div');
            cardDiv.className = "bg-[#1f1c4c] p-3 rounded-lg shadow-md text-center";
            cardDiv.addEventListener('click', () => addCardToDeck(card.id));
            cardDiv.innerHTML = `
                <img src="${card.image}" alt="Carte Pokémon"
                     class="mx-auto w-full max-w-[220px] aspect-[63/88] object-cover rounded mb-2 bg-gray-700"/>
                <p class="text-sm font-semibold">${card.name}</p>
                <span class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">${card.rarity}</span>
            `;
            cardsContainer.appendChild(cardDiv);
        })
    }
}

function loadMyDecks() {
    const decksContainer = document.getElementById('decksContainer');
    decksContainer.innerHTML = '';
    const decks = localStorage.getItem('decks');
    if (decks) {
        const decksData = JSON.parse(decks);
        decksData.forEach(deck => {
            const deckDiv = document.createElement('div');
            deckDiv.className = "bg-surface p-4 rounded-xl shadow-md";
            deckDiv.innerHTML = `
                <p class="text-xl font-semibold">${deck.name}</p>
                <p class="text-xs text-gray-400">${deck.cards.length} cartes</p>
                <button class="mt-2 text-sm underline text-yellow-400">Modifier</button></p>
            `;
            deckDiv.addEventListener('click', () => editDeck(decksData.indexOf(deck)));
            decksContainer.appendChild(deckDiv);
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadMyCards();
    loadMyDecks();
})

async function addCardToDeck(cardId) {
    if (selectedCards.length >= 5) {
        showToast("Vous ne pouvez pas sélectionner plus de 5 cartes.", "error");
        return;
    }

    if (selectedCards.includes(cardId)) {
        showToast("Cette carte est déjà sélectionnée.", "error")
        return;
    }

    selectedCards.push(cardId);
    const card = await Card.load(cardId);

    const imgElements = Array.from(selectedCardsContainer.querySelectorAll('img'));
    const indexWithoutSrc = imgElements.findIndex(img => !img.getAttribute('src'));

    if (indexWithoutSrc === -1) {
        console.warn("Pas d'emplacement libre pour ajouter une carte.");
        return;
    }

    const img = imgElements[indexWithoutSrc];

    const newImg = img.cloneNode(true);
    newImg.src = card.image;
    newImg.alt = cardId;

    newImg.addEventListener('click', () => removeCardFromDeck(cardId));

    img.replaceWith(newImg);

}

function removeCardFromDeck(cardId) {
    selectedCards = selectedCards.filter(id => id !== cardId);

    const imgElements = Array.from(selectedCardsContainer.querySelectorAll('img'));
    const cardIndex = imgElements.findIndex(img => img.alt === cardId);

    if (cardIndex === -1) {
        console.warn("Image introuvable pour la carte :", cardId);
        return;
    }

    const oldImg = imgElements[cardIndex];
    const emptyImg = oldImg.cloneNode(true);
    emptyImg.src = '';
    emptyImg.alt = '';
    oldImg.replaceWith(emptyImg);

}

function saveDeck() {
    if (selectedCards.length < 5) {
        showToast("Vous devez sélectionner au moins 5 cartes pour enregistrer un deck.", "error");
        return;
    }

    const deckName = document.getElementById('deckName').value;
    if (!deckName) {
        showToast("Veuillez entrer un nom pour le deck.", "error");
        return;
    }

    const decks = localStorage.getItem('decks');
    const decksData = decks ? JSON.parse(decks) : [];

    const newDeck = {
        name: deckName,
        cards: selectedCards
    };

    if (editingDeckIndex !== null) {
        decksData[editingDeckIndex] = newDeck;
        showToast("Deck modifié avec succès !", "success");
    } else {
        decksData.push(newDeck);
        showToast("Deck enregistré avec succès !", "success");
    }

    localStorage.setItem('decks', JSON.stringify(decksData));

    clearSelectedCards();
    loadMyDecks();
    document.getElementById('saveDeckButton').innerText = 'Créer le deck';
}


document.getElementById('saveDeckButton').addEventListener('click', saveDeck);

function editDeck(deckIndex) {
    document.getElementById('saveDeckButton').textContent = 'Modifier le deck';
    clearSelectedCards();
    editingDeckIndex = deckIndex;
    const decks = localStorage.getItem('decks');
    const decksData = decks ? JSON.parse(decks) : [];

    if (deckIndex < 0 || deckIndex >= decksData.length) {
        alert("Index de deck invalide.");
        return;
    }

    const deck = decksData[deckIndex];
    selectedCards = deck.cards.slice();


    deck.cards.forEach(async (cardId, i) => {
        const card = await Card.load(cardId);
        const img = selectedCardsContainer.children[i];
        img.src = card.image;
        img.alt = cardId;
        img.addEventListener('click', () => removeCardFromDeck(cardId));
    });

    document.getElementById('deckName').value = deck.name;

}



function clearSelectedCards() {
    selectedCards = [];
    const imgElements = Array.from(selectedCardsContainer.querySelectorAll('img'));

    imgElements.forEach((img) => {
        const cleanImg = img.cloneNode(true);
        cleanImg.src = '';
        cleanImg.alt = '';
        selectedCardsContainer.replaceChild(cleanImg, img);
    });
    document.getElementById('deckName').value = '';
    editingDeckIndex = null;
}