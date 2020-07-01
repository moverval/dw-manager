import { NumberMap } from "../Types";

export default class AccountEarnConfig {
    eat: number[];

    constructor(init: number[]) {
        this.eat = init;
    }

    get(type: AccountEarnType) {
        return this.eat[type];
    }

    set(type: AccountEarnType, value: number) {
        this.eat[type] = value;
    }
}

export enum AccountEarnType {
    WORD_SENT,
    BUMP_MADE,
    INVITED_PERSON,
    WORD_SENT_PS,
    AD_BONUS,
    KEEPING_TO_RULES,
    USEFUL_MESSAGE,
    AD_GOOD_UPVOTE,
    USER_JOINED,
}
