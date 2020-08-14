export function createRandomLightColor() {
    let repeat: (c: string, r: number) => string;
    return (repeat = (characters: string, rounds: number) => {
        return characters[Math.floor(Math.random() * characters.length)] + (rounds && repeat(characters, rounds - 1));
    })("3456789abcdef", 4);
}
