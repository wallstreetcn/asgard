module Asgard.Util {

    /**
     * 首字母大写
     * @param str
     * @returns {string}
     */
    export function capitalize(str:string):string {
        return String(str.charAt(0)).toUpperCase() + String(str.substr(1));
    }

    /**
     * 将驼峰字符串oneTwoThree转换为one-two-three
     *
     * @param str
     * @returns {string}
     */
    export function humpSplit(str) {
        return str.replace(/([A-Z])/g, "-$1").toLowerCase();
    }
}