export class Until {

    public has(array: string[], toFind: string) {
        for (const i of array) {
            if (i === toFind) {
                return true;
            }
        }
        return false;
    }

}
