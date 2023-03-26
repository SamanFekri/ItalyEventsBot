const { Markup } = require('telegraf');

class MKeyboard {
    constructor(items) {
        this.items = items;
    }

    generate() {
        return Markup.keyboard(this.items).reply_markup.keyboard;
    }
}

module.exports = { MKeyboard };