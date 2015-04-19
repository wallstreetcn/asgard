module Asgard.Util {
    /**
     * 获取类名
     * @param obj
     * @returns {string}
     */
    export function getClassName(obj:any):string {
        if (obj && obj.constructor) {
            var strFun = obj.constructor.toString();
            var className = strFun.substr(0, strFun.indexOf('('));
            className = className.replace('function', '');
            return className.replace(/(^\s*)|(\s*$)/ig, '');
        }
        return typeof(obj);
    }

    export function isPlainObject(obj:any):boolean {
        if (type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }

        if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }

        return true;
    }

    export function extend(target:Object, ...args:Object[]):Object {

        var options, name, src, copy, copyIsArray, clone,
            i = 0,
            length = args.length;

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = args[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    if (copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) )) {


                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extend(clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;

    }
}