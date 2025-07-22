
import {getRandomCard, getCard} from "./api.js";
const buttonOpenBooster = document.getElementById('buttonOpenBooster');
const boosterCards = document.getElementById('boosterCards');
const timeBeforeNextBooster = document.getElementById('timeBeforeNextBooster');

buttonOpenBooster.addEventListener('click', async () => {
    if( localStorage.getItem('lastOpened') && (new Date() - new Date(localStorage.getItem('lastOpened'))) < 5 * 60 * 1000) {
        const timeSinceLastOpen = new Date() - new Date(localStorage.getItem('lastOpened'));
        const timeLeft = Math.max(0, 5 * 60 * 1000 - timeSinceLastOpen);
        alert(`Il faut attendre encore ${Math.ceil(timeLeft / 1000)} secondes avant de pouvoir ouvrir un nouveau paquet.`);
        return;
    }
    const cards = await getRandomCard();
    boosterCards.innerHTML = cards.map(card => `
        <div class="card bg-gradient-to-br from-purple-700 via-purple-900 to-purple-800 rounded-xl shadow-lg p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300">
            <img src="${card.image}" alt="${card.getDisplayName()}" class="w-full h-auto rounded-md shadow-md mb-3" />
            <h3 class="text-white font-bold text-center text-sm md:text-base line-clamp-2">${card.getDisplayName()}</h3>
        </div>
    `).join('');
    const myCards = localStorage.getItem('cards');
    if (myCards) {
        console.log(myCards);
        const existingCards = JSON.parse(myCards);
        const newCards = [...existingCards, ...cards];
        localStorage.setItem('cards', JSON.stringify(newCards));
        localStorage.setItem('lastOpened', new Date().toISOString());
    } else {
        localStorage.setItem('cards', JSON.stringify(cards));
    }
});

window.addEventListener('load', () => {
    const lastOpened = localStorage.getItem('lastOpened');
    if (lastOpened) {
        const timeSinceLastOpen = new Date() - new Date(lastOpened);
        let timeLeft = Math.max(0, 5 * 60 * 1000 - timeSinceLastOpen);

        if (timeLeft > 0) {
            buttonOpenBooster.disabled = true;
            buttonOpenBooster.classList.add('cursor-not-allowed');

            const updateTimer = () => {
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    buttonOpenBooster.disabled = false;
                    timeBeforeNextBooster.textContent = 'Maintenant';
                    return;
                }
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                timeBeforeNextBooster.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                timeLeft -= 1000;
            };

            updateTimer();
            const timerInterval = setInterval(updateTimer, 1000);
        }
    }
})
