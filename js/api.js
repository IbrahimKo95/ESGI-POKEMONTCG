import {Card} from "./models/Card.js";


export async function getRandomCard(count = 5) {
    return fetch('https://api.tcgdex.net/v2/fr/cards')
        .then(res => res.json())
        .then(async data => {
            const shuffled = data.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            return await Promise.all(
                selected.map(cardData => Card.load(cardData.id))
            );
        })
        .catch(err => console.error(err));
}

export async function getCard(id) {
    return fetch(`https://api.tcgdex.net/v2/fr/cards/${id}`)
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
}
