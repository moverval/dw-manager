export function createRandomLightColor() {
    return Math.floor(Math.random() * 150 + 100) |
            Math.floor(Math.random() * 150 + 100) << 8 |
            Math.floor(Math.random() * 150 + 100) << 16;
}
