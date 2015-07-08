import Layout from './Layout/Layout.js';
import Axis from './Components/Axis';
import Utils from './Utils/Utils.js';
import Line from './Charts/Line.js';
import Linear from './Scale/Linear.js';
import FinanceTime from './Scale/FinanceTime.js';
import Data from './Data/Data.js';

var Asgard = {
    name: 'asgard',
    Layout: Layout,
    Scale:{
        Linear:Linear,
        FinanceTime:FinanceTime
    },
    Data:Data,
    Charts:{
        Line:Line
    },
    Components: {
        Axis: Axis
    },
    Utils: Utils
};

export default Asgard;