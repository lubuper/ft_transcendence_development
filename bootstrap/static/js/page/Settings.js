import APage from "./APage.js";

export default class extends APage {
    constructor() {
        super();
        this.setTitle("Settings");
    }
    async getHtml()
    {
        return `
        <h1> Graphic Settings </h1>
        <p>
            Low                       High
        </p>
        <h1> Sound Settings </h1>
        <p>
            VOLUME METER HERE
        </p>
        <h1> Difficulty Settings </h1>
        <p>
            Easy                       Hard
        </p>
        `;
    }
}