export class Until {

    public static hasInArray(array: string[], toFind: string) {
        const index: undefined | number = Until.indexInArray(array, toFind);
        if (index === undefined) {
            return false;
        }
        return true;
    }

    public static indexInArray(array: string[], toFind: string): undefined | number {
        for (let i: number = 0; i < array.length; i++) {
            const element: string = array[i];
            if (element === toFind) {
                return i;
            }
        }
        return undefined;
    }

    public has(array: string[], toFind: string) {
        return Until.hasInArray(array, toFind);
    }

}
