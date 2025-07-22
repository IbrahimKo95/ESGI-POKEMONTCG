import {Card} from "./models/Card.js";

const cardsContainer = document.getElementById('cardsContainer');

const typeColor = {
    "Plante": "#4caf50",
    "Feu": "#f44336",
    "Eau": "#2196f3",
    "Électrique": "#ffeb3b",
    "Psy": "#9c27b0",
    "Combat": "#ff5722",
    "Incolore": "#9e9e9e",
    "Obscurité": "#000000",
    "Métal": "#9e9e9e",
    "Fée": "#f48fb1",
    "Dragon": "#ff9800",
    "Vol": "#03a9f4",
    "Roche": "#795548",
    "Spectre": "#673ab7",
    "Acier": "#607d8b",
}

async function loadMyCards() {
    const myCards = localStorage.getItem('cards');
    if (myCards) {
        const cards = JSON.parse(myCards);
        cards.map(async cardData => {
            const card = await Card.load(cardData.id);
            const cardDiv = document.createElement('div');
            cardDiv.className = "bg-[#1f1c4c] p-3 rounded-lg shadow-md text-center";
            cardDiv.innerHTML = `
                <img src="${card.image}" alt="Carte Pokémon"
                     class="mx-auto w-full max-w-[220px] aspect-[63/88] object-cover rounded mb-2 bg-gray-700"/>
                <p class="text-sm font-semibold">${card.name}</p>
            `;
            let typeContainer = document.createElement('div');
            typeContainer.className = "flex justify-center gap-1 mt-2";
            card.types.forEach(type => {
                const typeSpan = document.createElement('span');
                typeSpan.className = "text-xs text-white px-2 py-0.5 rounded font-bold";
                typeSpan.style.backgroundColor = typeColor[type] || "#9e9e9e";
                typeSpan.textContent = type;
                typeContainer.appendChild(typeSpan);
            });
            cardDiv.appendChild(typeContainer);
            cardDiv.addEventListener('click', () => {
                modalOpen(card);
            })
            cardsContainer.appendChild(cardDiv);
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyCards();
})

function modalOpen(card) {
    const modal = document.getElementById('cardModal');
    const modalCardImage = document.getElementById('modalCardImage');
    const modalCardName = document.getElementById('modalCardName');
    const modalCardTypes = document.getElementById('modalCardTypes');
    const modalCardAttacks = document.getElementById('modalCardAttacks');
    modalCardTypes.innerHTML = '';

    modalCardImage.src = card.image;
    modalCardName.textContent = card.getDisplayName();
    card.types.forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = "text-xs text-white px-2 py-0.5 rounded font-bold mr-1";
        typeSpan.style.backgroundColor = typeColor[type] || "#9e9e9e";
        typeSpan.textContent = type;
        modalCardTypes.appendChild(typeSpan);
    })

    modalCardAttacks.innerHTML = '';

    card.attacks.forEach(type => {
        const attackDiv = document.createElement('div');
        attackDiv.className = "bg-gray-800 p-2 rounded mb-2";
        attackDiv.innerHTML = `
            <p class="text-sm text-white">${type.name}</p>
            <p class="text-xs text-gray-400">${type.damage ? `Dégâts: ${type.damage}` : ''}</p>
            <p class="text-xs text-gray-400">${type.effect || ''}</p>
        `;
        modalCardAttacks.appendChild(attackDiv);
    })

    modal.style.display = 'flex';
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close')) {
            modal.style.display = 'none';
        }
    });
}