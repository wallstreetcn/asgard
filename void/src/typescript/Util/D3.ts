module Asgard.Util {

    /**
     * 将选择器转换成d3.selection
     *
     * @param selection
     * @returns {any}
     */
    export function convertSelection(selection:any):D3.Selection {
        return selection instanceof d3.selection ? selection : d3.select(selection);
    }
}