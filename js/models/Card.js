import { getCard} from "../api.js";

export class Card {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.rarity = data.rarity;
        this.image = data.image ? data.image + '/high.png' : "https://i.ebayimg.com/images/g/SNcAAOSwR0JUUpp8/s-l1200.gif";
        this.hp = data.hp;
        this.types = data.types || [];
        this.attacks = data.attacks || [];
        this.weaknesses = data.weaknesses || [];
    }

    static async load(cardId) {
        const cardData = await getCard(cardId);
        return new Card(cardData);
    }
    getDisplayName() {
        return this.name || 'Carte sans nom';
    }


}
