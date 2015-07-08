import Utils from '../Utils/Utils.js';

export default class Data {

    constructor(options = {}) {
        this.clear();
        Utils.forEach(options, (data, name)=> {
            this.addData(name, data);
        });
    }

    clear() {
        this.container = [];
    }

    getDataByName(name) {
        var getData = null;
        Utils.forEach(this.container, function (data) {
            if (data.name === name) {
                getData = data;
            }
        });
        return data;
    }


    addData(name, data) {
        this.container.push({
            name: name,
            data: this.transform(data)
        });

        return this;
    }

    getXDomain() {

        let defaultData = this.container[0] || [];

        return Utils.Array.map(defaultData.data, function (d) {
            return new Date(d.date);
        });

    }

    transform(data) {
        return Utils.Array.map(data, function (d) {
            return {
                date: d.start * 1000,
                high: d.high,
                low: d.low,
                open: d.open,
                close: d.close,
                price: d.price,
                volume: d.volume
            }
        });
    }

}