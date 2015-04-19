module Asgard.Stock.Components {

    export interface ComponentsInterface {
        [id:string]:ComponentInterface
    }

    export interface ComponentInterface {
        draw():ComponentInterface;
    }

}