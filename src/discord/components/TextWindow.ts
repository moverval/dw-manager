export default abstract class TextWindow {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    centerLeftWidth(text: string) {
        const textLength = text.length;
        return Math.floor((this.width - textLength) / 2);
    }

    centerRightWidth(text: string) {
        const textLength = text.length;
        return Math.ceil((this.width - textLength) / 2);
    }

    abstract render(): string;
    abstract update(): void;
}
