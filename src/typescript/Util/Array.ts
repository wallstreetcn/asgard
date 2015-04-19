module Asgard.Util {

    export function inArray(arr, serach) {
        return arr === null ? -1 : arr.indexOf(serach);
    }

    export function isArray(arr:any):boolean {
        return Array.isArray(arr);
    }
}