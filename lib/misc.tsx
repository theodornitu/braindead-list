export function sleep(milliseconds: number) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

  
export function clamp(input: number, min: number, max: number): number {
    return input < min ? min : input > max ? max : input;
}

export function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
    const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    return clamp(mapped, out_min, out_max);
}

export function base64Encode(str: string) {
    return Buffer.from(str).toString('base64');
}

export function base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString('binary');
}

export function base64ToHex(str: string): string {
    return Buffer.from(str, 'base64').toString('hex');
}

export function hexToNumber(hex: string): number {
    return parseInt(hex, 16);
}

export function hexToString(hex: string): string {
    return Buffer.from(hex, 'hex').toString('ascii');
}

export function hexToBigInt(hex: string): BigInt {
    if (!hex) {
        return BigInt(0);
    }
    return BigInt('0x' + hex);
}
