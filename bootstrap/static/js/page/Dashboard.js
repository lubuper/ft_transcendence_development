import APage from "./APage.js";

export default class extends APage {
    constructor() {
        super();
        this.setTitle("ft_transcendence");
    }
    async getHtml()
    {
        return `
        <h1> Welcome to ft_transcendence! </h1>
        <p>
            Choose a direction to transcend.
        </p>
        `;
    }
}