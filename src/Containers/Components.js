import Container from './Container.js';
import Component from '../Components/Component.js';

export default class Components extends Container {
    constructor() {
        super();
    }

    addElement(element, placement = 'append') {
        if (element instanceof Component) {
            super.addElement(element, placement);
        }
    }
}

