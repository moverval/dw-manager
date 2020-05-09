export interface UserConfig {
    initAmount: number;
    levelState: LevelState;
}

export class UserConfigInitializer implements UserConfig {
    initAmount: number;
    levelState: LevelState;
    static defaultLevelState: LevelState = {
        1: 5000,
        2: 15000,
        3: 35000,
        4: 50000,
        5: 125000
    };

    constructor(initAmount: number, levelState?: LevelState) {
        this.initAmount = initAmount;

        if(levelState) {
            this.levelState = levelState;
        } else {
            this.levelState = UserConfigInitializer.defaultLevelState;
        }
    }
}

export interface CoinAmountState {
    initAmount: number;
    maxAmount: number;
}

export interface LevelState {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}
