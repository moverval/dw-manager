export function createRandomLightColor() {
    let code = Math.floor(Math.random() * 16);
    code |= Math.floor(Math.random() * 16) << 16;
    code |= Math.floor(Math.random() * 16) << 32;
    return code;
}
