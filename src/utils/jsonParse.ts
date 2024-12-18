

export default function jsonParse<T = unknown>(str?: string | undefined): T | undefined {
    console.log('getUserInfoStorage2222:', str);
    if (!str) {

        return undefined;
    }
    try {
        return JSON.parse(str) as T;
    } catch (error) {
        console.error('jsonParse error:', error);
        return undefined;
    }

}