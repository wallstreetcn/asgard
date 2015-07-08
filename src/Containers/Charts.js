import Container from './Container.js';
import Chart from '../Charts/Chart.js';

export default class Charts extends Container {
    constructor() {
        super();
    }

    addElement(element, placement = 'append') {
        if (element instanceof Chart) {
            super.addElement(element, placement);
        }
    }
}