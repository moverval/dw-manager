import TextWindow, {Input} from "../windowSystem/abstract/TextWindow";

export default class CloseWindow extends TextWindow {
    constructor() {
        super();
    }

    render() {
        this.embedCreator.description = `\`\`\`
  ____                _     _                          
 / ___| ___  ___  ___| |__ | | ___  ___ ___  ___ _ __  
| |  _ / _ \\/ __|/ __| '_ \\| |/ _ \\/ __/ __|/ _ \\ '_ \\ 
| |_| |  __/\\__ \\ (__| | | | | (_) \\__ \\__ \\  __/ | | |
 \\____|\\___||___/\\___|_| |_|_|\\___/|___/___/\\___|_| |_|
        \`\`\``;

        this.embedCreator.statusFields.set("footer", "Du kannst jederzeit wieder ein neues Fenster öffnen");

        this.update();
    }

    onLoad(): void {
        return;
    }

    onInput(input: Input): void {
        return;
    }

    unload(): boolean {
        return true;
    }
}
