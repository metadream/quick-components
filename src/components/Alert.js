import { Dialog } from "./Dialog.js";

export class Alert extends Dialog {

    constructor(message, callback) {
        super({
            slot: message,
            buttons: [{
                label: "确定",
                primary: true,
                onclick: (self, btn) => {
                    callback && callback(self, btn);
                    this.hide();
                }
            }]
        });
    }

}