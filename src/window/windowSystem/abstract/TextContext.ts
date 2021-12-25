export default abstract class TextContext {
    renderedText: string;

    abstract render(): string;

    cacheRender(): string {
        return this.renderedText;
    }
}
