const { Telegraf, Input, Markup, Types } = require('telegraf');
const mongoose = require('mongoose');
const { AD, USER } = require('./models.js');
const { 
    USER_STATUS,
    AD_STATUS, 
    AD_CAT, 
    ALL_CAT_KEYBOARD,
    BUTTONS, 
    MAIN_MENU,
    NO_PIC_KEYBOARD,
    PUBLISH_KEYBOARD,
    ADMIN_KEYBOARD,
    FREE_PRICE_KEYBOARD,
    ACCEPT_RULES_KEYBOARD,
    START_KEYBOARD,
    NO_DETAIL_KEYBOARD,
    MONTH_KEYBOARD,
    DAY_KEYBOARD,
    REGION_KEYBOARD,
    ENGLISH_EVENT_KEYBOARD,
    YES_NO_KEYBOARD,
 } = require('./constants.js');
const fs = require('fs');
const Handlebars = require('handlebars')
const { IKeyboard } = require('./ikeyboard.js');
const { MKeyboard } = require('./mkeyboard.js');
const fn = require('./functions.js');



require('dotenv').config();

let msgs = {}
Handlebars.registerHelper('hashtag', function(str) {
    console.log(str);
    return `#${str.replace(/ /g, '_')}`;
});

Handlebars.registerHelper('adstat', function(stat) {
    stat = parseInt(stat)
    switch (stat) {
        case -1:
            return '❌❌ رد شده ❌❌';
        case 0:
            return '';
        case 1:
            return '✅✅ تایید شده ✅✅';
        case 2:
            return '📢📢 آکهی 📢📢';
    }
});

Handlebars.registerHelper('currency', function(price) {
    if (price <= 0) {
        return 'رایگان';
    }
    return `${price} دلار`;
});

Handlebars.registerHelper('cat_emoji', function(cat) {
    try {
        // if the text in AD_CAT is equal to cat then return icon, AD_CAT is json object
        for(let key in AD_CAT) {
            if(AD_CAT[key].text === cat) {
                return AD_CAT[key].icon;
            }
        }
    } catch (e) {
        console.log(e);
    }
    return '🎫';
});

fs.readdirSync('messages').forEach(filename => {
    let parts = filename.split('.');
    if (parts[1] !== 'html') {
        return;
    }
    let content = fs.readFileSync(`messages/${filename}`, 'utf8');
    msgs[parts[0]] = Handlebars.compile(content);
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// send the profile picture of user to olaf channel
async function olafMiddleware(ctx, next) {
    if(!ctx.user) {
        next();
        return;
    }
    try {
        let now = new Date().getTime();
        let last_seen = 0;
        if(ctx.user.last_seen) {
            last_seen = ctx.user.last_seen.getTime();
        }
        if (now - last_seen < 1000 * 60 * 60 * 24) {
            console.log(`HIT: ${ctx.user.id} `);
            next();
            return;
        }
        let data = {
            id: ctx.from.id,
            name: `${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}`,
            username: ctx.from.username ? ctx.from.username: null,
        }
        ctx.user.last_seen = new Date();
        await ctx.user.save();

        let photo_id = null;
        let photo = await ctx.telegram.getUserProfilePhotos(ctx.user.id);
        console.log(photo);
        if (photo.total_count > 0) {
            photo_id = photo.photos[0][0].file_id;
        }
        await sendCard(ctx, process.env.OLAF_CHANNEL_ID, msgs['olaf'](data), photo_id, null, null);
    } catch (e) {
        console.log(e);
    }
    next();
}

// find the city from the keyboard
function findFromKeyboard(key, keyboard) {
    for (let i = 0; i < keyboard.length; i++) {
        for (let k in keyboard[i]) {
            if (k === key) {
                return keyboard[i][k];
            }
        }
    }
    return null
}

// find month from the keyboard
function findMonth(month) {
    switch (month) {
        case 'jan':
            return 1;
        case 'feb':
            return 2;
        case 'mar':
            return 3;
        case 'apr':
            return 4;
        case 'may':
            return 5;
        case 'jun':
            return 6;
        case 'jul':
            return 7;
        case 'aug':
            return 8;
        case 'sep':
            return 9;
        case 'oct':
            return 10;
        case 'nov':
            return 11;
        case 'dec':
            return 12;
    }
    return 1;
}

// return the ad features and user features for template
function getFeatures(ad, user, stat = 0) {
    return {
        ad: {
            cat: AD_CAT[ad.cat].text,
            price: ad.price,
            detail: ad.detail,
            region: ad.region,
            time: ad.month ? `${ad.day} ${findFromKeyboard(ad.month, MONTH_KEYBOARD)}` : null,
            is_english_event: ad.is_english_event,
            address: ad.address,
            ticket: ad.ticket,
            isPlanenr: ad.is_planner,
        },
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
        },
        stat: stat,
    }
}

// send a card to the chat_id provided
async function sendCard(ctx, chat_id, text, pic = null, inline_keyboard = null, menu_keyboard = null) {
    try {
        let options = {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        };
        options.reply_markup = {}
        if (menu_keyboard) {
            options.reply_markup.keyboard = menu_keyboard;
        }
        if (inline_keyboard) {
            options.reply_markup.inline_keyboard = inline_keyboard;
        }
        if (pic) {
            options.caption = text;
            await ctx.telegram.sendPhoto(chat_id, pic, options);
        } else {
            await ctx.telegram.sendMessage(chat_id, text, options);
        }
    } catch (e) {
        console.log(e);
    }
}

// Edit the card
async function editCard(ctx, text, pic = null, inline_keyboard = null, menu_keyboard = null) {
    try {
        let options = {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        };
        options.reply_markup = {}
        if (menu_keyboard) {
            options.reply_markup.keyboard = menu_keyboard;
        }
        if (inline_keyboard) {
            options.reply_markup.inline_keyboard = inline_keyboard;
        }

        if (options.reply_markup == {}) {
            ctx.editReplyMarkup(options.reply_markup);
        }

        if (pic) {
            // change the caption of photo
            options.caption = text;
            await ctx.editMessageCaption(text, options);
        } else {
            await ctx.editMessageText(text, options);
        }
    } catch (e) {
        console.log(e);
    }
}

// Remove the card
async function removeCard(ctx) {
    await ctx.deleteMessage();
}

// Middleware - Get user from DB and merge with new data
function getUser(ctx, next) {
    try {
        USER.findOne({id: ctx.from.id}).then((user) => {
            if (user) {
                ctx.user = user;
                ctx.user = Object.assign(ctx.user, ctx.from);
                ctx.user.save().then(() => {
                    console.log(ctx.user);
                    next();
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                ctx.user = new USER(ctx.from);
                ctx.user.status = USER_STATUS.NEW;
                ctx.user._id = new mongoose.Types.ObjectId();
                ctx.user.created_at = new Date();

                ctx.user.save().then(() => {
                    next();
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    } catch (e) {
        console.log('============================')
        console.log(ctx)
        console.log(e);
        console.log('============================')
        console.log('')
        return;
    }
}

// Middleware - Check if user is user memeber of the channel
async function checkUserRole(ctx, next) {
    let chatMember = await bot.telegram.getChatMember(process.env.MAIN_CHANNEL_ID, ctx.user.id)
    if (!(chatMember.status === 'member' || chatMember.status === 'creator' || chatMember.status === 'administrator')) {
        sendCard(ctx, ctx.user.id, msgs['error_join'](), null, null, null);
        return
    }
    chatMember = await bot.telegram.getChatMember(process.env.ADMIN_CHANNEL_ID, ctx.user.id)
    ctx.user.is_admin = false;
    if (chatMember.status === 'creator' || chatMember.status === 'administrator') {
        ctx.user.is_admin = true;
    }
    next();
}

// Middleware - Check get user last ad
function getLastAd(ctx, next) {
    if (!ctx.user.last_ad) {
        next()
        return
    }
    AD.findOne({_id: ctx.user.last_ad}).then((ad) => {
        ctx.ad = ad;
        next();
    }).catch((err) => {
        console.log(err);
    });
}

// Start new ad
async function startAd(ctx) {
    if (ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
        return
    }
    if (ctx.user.last_ad) {
        sendCard(ctx, ctx.user.id, msgs['busy'](), null, null, null);
        return
    }
    let menu = new MKeyboard(MAIN_MENU).generate();
    await sendCard(ctx, ctx.user.id, msgs['start_ad'](), null, null, menu);
    askCat(ctx);
}

// find next step
function findNextStep(ctx, steps) {
    for(let i=0; i < steps.length - 1; i++) {
        if (steps[i] == ctx.ad.status) {
            return steps[i+1];
        }
    }
    return steps[steps.length - 1];
}

// ask next question
function askNext(ctx) {
    let next = findNextStep(ctx, AD_CAT[ctx.ad.cat].steps);
    console.log(`${ctx.ad.status} -> ${next}`);
    ctx.ad.status = next;
    
    ctx.ad.save().then(() => {}).catch((err) => {});
    let msg = ''
    let pic = null
    let ikey = null
    let month = 1
    switch(next) {
        case AD_STATUS.ASK_TITLE:
            msg = msgs['ask_title']();
            break;

        case AD_STATUS.ASK_ENGLISH:
            msg = msgs['ask_english']();
            ikey = new IKeyboard(ENGLISH_EVENT_KEYBOARD, 'sel_english', ctx.ad._id).generate();
            break;
        
        case AD_STATUS.ASK_REGION:
            msg = msgs['ask_region']();
            ikey = new IKeyboard(REGION_KEYBOARD, 'sel_region', ctx.ad._id).generate();
            break;

        case AD_STATUS.ASK_ADDRESS:
            msg = msgs['ask_address']();
            break;
        
        case AD_STATUS.ASK_MONTH:
            msg = msgs['ask_time']();
            ikey = new IKeyboard(MONTH_KEYBOARD, 'sel_month', ctx.ad._id).generate();
            break;
        
        case AD_STATUS.ASK_DAY:
            msg = msgs['ask_time']();
            month = findMonth(ctx.ad.month);
            console.log(DAY_KEYBOARD(month));
            ikey = new IKeyboard(DAY_KEYBOARD(month), 'sel_day', ctx.ad._id).generate();
            editCard(ctx, msg, null, ikey, null);
            return;
        
        case AD_STATUS.ASK_PRICE:
            msg = msgs['ask_price']();
            ikey = new IKeyboard(FREE_PRICE_KEYBOARD, 'sel_price', ctx.ad._id).generate();
            break;
        
        case AD_STATUS.ASK_DETAIL:
            msg = msgs['ask_detail']();
            ikey = new IKeyboard(NO_DETAIL_KEYBOARD, 'sel_detail', ctx.ad._id).generate();
            break;

        case AD_STATUS.ASK_TICKET:
            msg = msgs['ask_ticket']();
            break;
        
        case AD_STATUS.ASK_PIC:
            msg = msgs['ask_pic']();
            ikey = new IKeyboard(NO_PIC_KEYBOARD, 'sel_pic', ctx.ad._id).generate();
            break;

        case AD_STATUS.ASK_IS_PLANNER:
            msg = msgs['ask_planner']();
            ikey = new IKeyboard(YES_NO_KEYBOARD, 'sel_planner', ctx.ad._id).generate();
            break;
        
        case AD_STATUS.ASK_CONFIRM:
            msg = msgs['ad_template'](getFeatures(ctx.ad, ctx.user));
            pic = ctx.ad.pic;
            ikey = new IKeyboard(PUBLISH_KEYBOARD, 'sel_confirm', ctx.ad._id).generate();
            break;
    }
    sendCard(ctx, ctx.user.id, msg, pic, ikey, null);
}

// Create new ad
async function newAd(ctx, cat) {
    ctx.ad = new AD();
    ctx.ad._id = new mongoose.Types.ObjectId();
    ctx.ad.created_at = new Date();
    ctx.ad.owner_tg_id = ctx.user.id;
    ctx.ad.cat = cat;
    ctx.ad.status = AD_STATUS.INIT;
    ctx.ad.owner = ctx.user._id;
    await ctx.ad.save();

    ctx.user.last_ad = ctx.ad._id;
    await ctx.user.save();

    await editCard(ctx, msgs['sel_cat']({category: AD_CAT[cat].text}))

    askNext(ctx);
}

// User cancel ad with /cancel command or cancel button
function cancelAd(ctx) {
    if(!ctx.user.last_ad) {
        // No ad to cancel
        return
    }

    ctx.user.last_ad = null;
    ctx.user.save().then(() => {
        sendCard(ctx, ctx.user.id, msgs['remove_ad'](), null, null, null);
    }).catch((err) => {
        console.log(err);
    });

    ctx.ad.status = AD_STATUS.CANCELED;
    ctx.ad.save().then(() => {
        console.log('Ad canceled');
    }
    ).catch((err) => {
        console.log(err);
    });
}

// New Ad - Ask for category
function askCat(ctx) {
    let k = new IKeyboard(ALL_CAT_KEYBOARD, 'cat', null).generate();
    sendCard(ctx, ctx.user.id, msgs['ask_cat'](), null, k, null);
}

bot.use(getUser);
bot.use(olafMiddleware);
bot.use(checkUserRole);
bot.use(getLastAd);

// Read all inline keyboard callbacks from telegram bot api
bot.on('callback_query', async (ctx) => {
    let data = ctx.callbackQuery.data;
    let parts = data.split('__');
    console.log(parts);
    let sections = null;

    // system part
    if(parts[0] == 'sys') {
        switch(parts[1]) {
            case 'start':
                editCard(ctx, msgs['sys_start'](), null, null, null);
                startAd(ctx);
                break;
            case 'accept_rules':
                if(ctx.user.status == USER_STATUS.NEW) {
                    ctx.user.status = USER_STATUS.NOT_VERIFIED;
                    await ctx.user.save();
                }
                editCard(ctx, msgs['sys_rule'](), null, null, null);
                startAd(ctx);
                break;
        }
        return
    }
    // category part
    if (parts[0] == 'cat') {
        if (ctx.user.last_ad) {
            removeCard(ctx);
            sendCard(ctx, ctx.user.id, msgs['busy'](), null, null, null);
            return
        }
        sections = parts[1].split('_');
        // if(sections[0] === 'c') {
        //     // if(sections[1] == 'home') {
        //     //     let k = new IKeyboard(HOME_CAT_KEYBOARD, 'cat', null).generate();
        //     //     editCard(ctx, msgs['ask_cat'](), null, k, null);
        //     //     return
        //     // }
        //     let k = new IKeyboard(SELL_BUY_CAT_KEYBOARD, 'cat', null).generate();
        //     editCard(ctx, msgs['ask_cat'](), null, k, null);
        //     return
        // }
        await newAd(ctx, parts[1]);
        return
    }

    console.log(parts);
    // admin part
    if (parts[0] == 'admin') {
        if (!ctx.user.is_admin) {
            return
        }
        let ad = await AD.findOne({_id: parts[2]});
        let user = await USER.findOne({_id: ad.owner});
        let msg = '';
        let response = '';
        console.log(parts[1]);
        switch (parts[1]) {
            case 'publish':
                msg = msgs['ad_template'](getFeatures(ad, user, 1));
                response = msgs['ad_accepted']({code: ad._id});
                await editCard(ctx, msg, ad.pic, null, null);
                msg = msgs['ad_template'](getFeatures(ad, user, 0));
                await sendCard(ctx, process.env.MAIN_CHANNEL_ID, msg, ad.pic, null, null);
                await sendCard(ctx, user.id, response, null, null, null);
                ad.status = AD_STATUS.PUBLISHED;
                await ad.save();
                return
            case 'reject':
                response = msgs['ad_rejected']({code: ad._id});
                msg = msgs['ad_template'](getFeatures(ad, user, -1));
                await editCard(ctx, msg, ad.pic, null, null);
                await sendCard(ctx, user.id, response, null, null, null);
                ad.status = AD_STATUS.REJECTED;
                await ad.save();
                return
            case 'ad_channel':
                msg = msgs['ad_template'](getFeatures(ad, user, 2));
                response = msgs['ad_advertisor']({code: ad._id});
                await editCard(ctx, msg, ad.pic, null, null);
                msg = msgs['ad_template'](getFeatures(ad, user, 0));
                await sendCard(ctx, process.env.ADV_CHANNEL_ID, msg, ad.pic, null, null);
                await sendCard(ctx, user.id, response, null, null, null);
                ad.status = AD_STATUS.ADVERTISOR;
                await ad.save();
                return
        }
        return
    }

    // user part
    if (ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
        return
    }
    if (!(ctx.ad && parts[2] == ctx.ad._id)) {
        removeCard(ctx);
        return
    }
    switch (parts[0]) {
        case 'sel_region':
            ctx.ad.region = findFromKeyboard(parts[1], REGION_KEYBOARD);
            await editCard(ctx, msgs['sel_region']({region: ctx.ad.region}), null, null, null);
            await ctx.ad.save();
            askNext(ctx);
            break;
        
        case 'sel_english':
            ctx.ad.is_english_event = parts[1] == 'yes';
            await editCard(ctx, msgs['sel_english']({isEnglishEvent: ctx.ad.is_english_event}), null, null, null);
            await ctx.ad.save();
            askNext(ctx);
            break;

        case 'sel_month':
            ctx.ad.month = parts[1];
            await ctx.ad.save();
            askNext(ctx);
            break;

        case 'sel_day': {
            let month = findMonth(ctx.ad.month);
            let day = findFromKeyboard(parts[1], DAY_KEYBOARD(month));
            console.log(day);
            if (day == ' ') {
                return
            }
            ctx.ad.day = day;
            await ctx.ad.save();
            await editCard(ctx, msgs['sel_time']({date: `${ctx.ad.day} ${findFromKeyboard(ctx.ad.month, MONTH_KEYBOARD)}`}));
            askNext(ctx);
            }
            break;
        
        case 'sel_detail':
            ctx.ad.detail = null;
            await ctx.ad.save();
            await editCard(ctx, msgs['sel_detail']());
            askNext(ctx);
            break;
    
        case 'sel_pic':
            ctx.ad.pic = null;
            await ctx.ad.save();
            await editCard(ctx, msgs['sel_pic']());
            askNext(ctx);
            break;

        case 'sel_price':
            ctx.ad.price = -1;
            await ctx.ad.save();
            await editCard(ctx, msgs['sel_price']());
            askNext(ctx);
            break;

        case 'sel_planner':
            ctx.ad.is_planner = parts[1] == 'yes';
            await ctx.ad.save();
            await editCard(ctx, msgs['sel_planner']({isPlanenr: ctx.ad.is_planner}));
            askNext(ctx);
            break;
        
        case 'sel_confirm':
            let msg = msgs['ad_template'](getFeatures(ctx.ad, ctx.user));
            // change the card
            await editCard(ctx, msg, ctx.ad.pic, null, null);
            if (parts[1] == 'reject') {
                cancelAd(ctx);
                return
            }
            ctx.ad.status = AD_STATUS.COMPLETE;
            await ctx.ad.save();
            // add the last ad to null and last publish time to now
            ctx.user.last_ad = null;
            ctx.user.last_publish_time = new Date();
            await ctx.user.save();
            // publish card to admin channel
            let ikey = new IKeyboard(ADMIN_KEYBOARD, 'admin', ctx.ad._id).generate();
            sendCard(ctx, process.env.ADMIN_CHANNEL_ID, msg, ctx.ad.pic, ikey, null);
            // send message to user that admin will check the ad and after that publish it
            sendCard(ctx, ctx.user.id, msgs['ad_pending']({code: ctx.ad._id}), null, null, null);
            break;


    }
    
});

// on picture get the picture id and save it
bot.on('photo', async (ctx) => {
    if (ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
        return
    }
    if (!ctx.user.last_ad) {
        // No ad to ad fields
        return
    }
    if (!(ctx.ad && ctx.ad.status == AD_STATUS.ASK_PIC)) {
        return
    }
    ctx.ad.pic = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    await ctx.ad.save();
    // next question
    askNext(ctx);
});

bot.start(async (ctx) => {
    let start_key = new IKeyboard(START_KEYBOARD, 'sys').generate();
    if(ctx.user.status == USER_STATUS.NEW) {
        start_key = null
    }
    await sendCard(ctx, ctx.user.id, msgs['sys_start'](), null, start_key, null);
    if(ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
    }
});

// On new command show ask_cat msg
bot.command('new', startAd);
bot.hears(BUTTONS.NEW_AD, startAd);

// On new command cancel ad
bot.command('cancel', cancelAd);
bot.hears(BUTTONS.CANCEL, cancelAd);

// Read the rules
bot.hears(BUTTONS.RULES, async (ctx) => {
    await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, null, null);
})
// Contact us
bot.hears(BUTTONS.CONTACT_US, async (ctx) => {
    await sendCard(ctx, ctx.user.id, msgs['sys_contact_us'](), null, null, null);
});

// get the number of user
bot.on('contact', async (ctx) => {
    if (ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
        return
    }
    ctx.user.phone_number = `+${ctx.message.contact.phone_number}`;
    sendCard(ctx, ctx.user.id, msgs['shared_contact'](), null, null, null);
    if (ctx.user.status != USER_STATUS.NEW) {
        ctx.user.status = USER_STATUS.VERIFIED;
    }
    await ctx.user.save()
});

// get the input from text input
bot.on('text', async (ctx) => {
    if (ctx.user.status == USER_STATUS.NEW) {
        let rule_key = new IKeyboard(ACCEPT_RULES_KEYBOARD, 'sys').generate();
        await sendCard(ctx, ctx.user.id, msgs['sys_rule'](), null, rule_key, null);
        return
    }
    if (!ctx.user.last_ad) {
        // No ad to ad fields
        return
    }
    let ok = true;
    let text = ctx.message.text;
    switch (ctx.ad.status) {
        case AD_STATUS.ASK_TITLE:
            ctx.ad.title = text;
            break;
        
        case AD_STATUS.ASK_REGION:
            ctx.ad.region = text;
            break;
        
        case AD_STATUS.ASK_ADDRESS:
            ctx.ad.address = text;
            break;
        
        case AD_STATUS.ASK_DETAIL:
            ctx.ad.detail = text;
            break;
        
        case AD_STATUS.ASK_PRICE:
            text = fn.convertDigits(text);
            if(isNaN(text)) {
                sendCard(ctx, ctx.user.id, msgs['invalid_price'](), null, null, null);
                return
            }
            ctx.ad.price = text;
            break;

        case AD_STATUS.ASK_TICKET:
            ctx.ad.ticket = text;
            break;

        default:
            ok = false;
            break;
    }
    if (ok) {
        // save ad
        await ctx.ad.save();

        // go to the next question
        askNext(ctx);
    }
});

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true}).catch((err) => {
    console.log(err);
});

function launch() {
    try {
        bot.launch();
        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (e) {
        console.log(e);
        setTimeout(() => {
            launch();
        }, 1000 * 60);
    }
}

launch();