import Utils from '../Utils/Utils.js';

export default class Container {

    constructor() {
        this.clear();
        this.elementInjectMap = {};
    }


    count() {
        return this.containers.length;
    }

    elementInject(element) {
        for (let key in this.elementInjectMap) {

            let value = this.elementInjectMap[key];

            var injectFunName = 'set' + Utils.String.ucfirst(key);

            if (Utils.type(element[injectFunName]) === 'function') {
                element[injectFunName].call(element, value);
            } else {
                element[key] = value;
            }
        }
    }

    addElementInject(key, value) {
        this.elementInjectMap[key] = value;
        return this;
    }

    removeElementInject(key) {
        delete this.elementInjectMap[key];
        return this;
    }

    addElements(elements) {
        if (Array.isArray(elements)) {
            elements.forEach((element)=> {
                this.addElement(element);
            })
        }
        return this;
    }

    addElement(element, placement = 'append') {

        this.elementInject(element);

        switch (placement) {
            case 'prepend':
                this.containers.unshift(element);
                break;
            case 'append':
                this.containers.push(element);
                break;
            default:
                let l = this.components.length - 1;

                if (placement <= 0) {
                    placement = 0;
                } else if (placement >= l) {
                    placement = l;
                } else {
                    this.containers.splice(placement, 0, element);
                }
        }
        return this;
    }

    removeElement(name) {
        for (let i = 0, l = this.containers.length; i < l; i++) {

            let element = this.containers[i];

            if (element.getName() === name) {
                delete this.containers[i];
            }
        }

        return this;
    }

    clear() {
        this.containers = [];
        return this;
    }

    getElement(name) {
        for (let i = 0, l = this.containers.length; i < l; i++) {

            let element = this.containers[i];

            if (element.getName() === name) {
                return this.containers[i];
            }
        }
        return null;

    }

    render() {
        this.containers.forEach((element)=> {
            element.render();
        })
    }
}