const { Markup } = require('telegraf');

class IKeyboard {
    constructor(items, prefix, postfix) {
        this.items = items;
        this.prefix = prefix;
        this.postfix = postfix;
    }

    generate() {
        let buttons = [];
        // Loop over items which is json array with elements like this: {'key1': 'value1', 'key2': 'value2'}
        for (let i = 0; i < this.items.length; i++) {
            let row = [];
            // Loop over keys of each item
            for (let key in this.items[i]) {
                // Add button to row
                if (this.postfix) {
                    row.push(Markup.button.callback(this.items[i][key], `${this.prefix}__${key}__${this.postfix}`));
                } else {
                    row.push(Markup.button.callback(this.items[i][key], `${this.prefix}__${key}`));
                }
            }
            // Add row to buttons
            buttons.push(row);
        }
        return Markup.inlineKeyboard(buttons).reply_markup.inline_keyboard;
    }
}

module.exports = { IKeyboard };