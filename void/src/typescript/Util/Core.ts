module Asgard.Util {

    export var class2type = {},
        hasOwn = class2type.hasOwnProperty;

    "Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach((name:string):void => {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    /**
     * 为元素生成className
     *
     * @param object
     * @param suffix
     * @returns {string}
     */
    export function generateClassName(object:Object, suffix?:string):string {
        return name.toLowerCase() + humpSplit(getClassName(object)) + (suffix ? '-' + suffix : '');
    }

    export function type(obj:any):string {
        if (obj == null) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
    }

    export function isWindow(obj:any):boolean {
        return obj != null && obj === obj.window;
    }

    export function isFunction(fun:any):boolean {
        return type(fun) === "function";
    }

    export function isPercent(str:string) {
        return /^-?\d+%$/.test(str);
    }

    export function convertPercent(str:any):number {
        return isPercent(str) ? parseInt(str) / 100 : str;
    }


}