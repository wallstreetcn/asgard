export default class Container {

    constructor() {
        this.clear();
        this.elementInjectMap = {};
    }

    elementInject(element) {
        for (let key in this.elementInjectMap) {
            let value = this.elementInjectMap[key];
            if (typeof element[key] === 'Function') {
                element[key].call(element, value);
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
                this.container.unshift(element);
                break;
            case 'append':
                this.container.push(element);
                break;
            default:
                let l = this.components.length - 1;

                if (placement <= 0) {
                    placement = 0;
                } else if (placement >= l) {
                    placement = l;
                } else {
                    this.container.splice(placement, 0, element);
                }
        }
        return this;
    }

    removeElement(name) {
        for (let i = 0, l = this.container.length; i < l; i++) {

            let element = this.container[i];

            if (element.getName() === name) {
                delete this.container[i];
            }
        }

        return this;
    }

    clear() {
        this.container = [];
        return this;
    }

    getElement(name) {
        for (let i = 0, l = this.container.length; i < l; i++) {

            let element = this.container[i];

            if (element.getName() === name) {
                return this.container[i];
            }
        }
        return null;

    }
}