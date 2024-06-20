import APage from "./APage.js";

export default class extends APage {
    constructor() {
        super();
        this.setTitle("Games");
    }
    async getHtml()
    {
        return `
        <h1> MINI RPG </h1>
        <p>
            PONG                       CASINO
        </p>
        `;
    }
}