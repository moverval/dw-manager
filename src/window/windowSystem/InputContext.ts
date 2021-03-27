import UserInputManager, {InputFunction} from "../UserInputManager";

export default class InputContext {
    inputManager: UserInputManager;
    userId: string;
    channelId: string;

    constructor(inputManager: UserInputManager, userId: string, channelId: string) {
        this.inputManager = inputManager;
        this.userId = userId;
        this.channelId = channelId;
    }

    unload() {
        this.inputManager.clearInputFunction(this.userId, this.channelId);
    }
}
