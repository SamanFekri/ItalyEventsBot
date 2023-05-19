const { Markup } = require('telegraf');

const USER_STATUS = {
    NEW: 'new',
    NOT_VERIFIED: 'not_verified',
    VERIFIED: 'verified',
};

const AD_STATUS = {
    INIT: 'init',
    ASK_CITY: 'ask_city',
    ASK_TITLE: 'ask_title',
    ASK_ENGLISH: 'ask_english',
    ASK_ADDRESS: 'ask_address',
    ASK_TICKET: 'ask_ticket',
    ASK_REGION: 'ask_region',
    ASK_MONTH: 'ask_month',
    ASK_DAY: 'ask_day',
    ASK_HOUR: 'ask_hour',
    ASK_PRICE: 'ask_price',
    ASK_DETAIL: 'ask_detail',
    ASK_PIC: 'ask_pic',
    ASK_IS_PLANNER: 'ask_is_planner',
    ASK_CONFIRM: 'ask_confirm',

    COMPLETE: 'complete',
    PUBLISHED: 'published',
    ADVERTISOR: 'advertisor',
    REJECT: 'reject',
    CANCELED: 'canceled',
};

const process = [AD_STATUS.INIT, AD_STATUS.ASK_TITLE, AD_STATUS.ASK_REGION, AD_STATUS.ASK_PRICE, AD_STATUS.ASK_ADDRESS, AD_STATUS.ASK_MONTH, AD_STATUS.ASK_DAY, AD_STATUS.ASK_HOUR, AD_STATUS.ASK_TICKET, AD_STATUS.ASK_DETAIL, AD_STATUS.ASK_PIC,  AD_STATUS.ASK_IS_PLANNER, AD_STATUS.ASK_CONFIRM];
const AD_CAT = {
    a_concert: {
        icon: '🎤',
        display: '🎤 کنسرت',
        text: 'کنسرت',
        code: 'a_concert',
        steps: process
    },
    a_festival: {
        icon: '🎪',
        display: '🎪 فستیوال',
        text: 'فستیوال',
        code: 'a_festival',
        steps: process
    },
    a_bazaar: {
        icon: '🧺',
        display: '🧺 بازارچه',
        text: 'بازارچه',
        code: 'a_bazaar',
        steps: process
    },
    a_exhibition: {
        icon: '🎨',
        display: '🎨 نمایشگاه',
        text: 'نمایشگاه',
        code: 'a_exhibition',
        steps: process
    },
    a_workshop: {
        icon: '⚙️',
        display: '⚙️ کارگاه',
        text: 'کارگاه',
        code: 'a_workshop',
        steps: process
    },
    a_expert: {
        icon: '👨‍🏫',
        display: '👨‍🏫 کاری',
        text: 'کاری',
        code: 'a_expert',
        steps: process
    },
    a_party: {
        icon: '🎉',
        display: '🎉 پارتی',
        text: 'پارتی',
        code: 'a_party',
        steps: process
    },
    a_theater: {
        icon: '🎭',
        display: '🎭 تئاتر',
        text: 'تئاتر',
        code: 'a_theater',
        steps: process
    },
    a_game: {
        icon: '🎮',
        display: '🎮 بازی',
        text: 'بازی',
        code: 'a_game',
        steps: process
    },
    a_food: {
        icon: '🍝',
        display: '🍝 غذا',
        text: 'غذا',
        code: 'a_food',
        steps: process
    }
}; 

const BUTTONS = {
    NEW_AD: '📝 ثبت رویداد جدید',
    RULES: '📜 قوانین',
    CANCEL: '❌ لغو',
    CONTACT_US: '📞 تماس با ما',
    SHARE_PHONE:  Markup.button.contactRequest('📱 اشتراک تلفن'),
}

const ALL_CAT_KEYBOARD = [
    {
        a_bazaar: AD_CAT.a_bazaar.display,
        a_festival: AD_CAT.a_festival.display,
        a_concert: AD_CAT.a_concert.display,
    },
    {
        a_expert: AD_CAT.a_expert.display,
        a_exhibition: AD_CAT.a_exhibition.display,
        a_party: AD_CAT.a_party.display,
    },
    {
        a_theater: AD_CAT.a_theater.display,
        a_game: AD_CAT.a_game.display,
        a_workshop: AD_CAT.a_workshop.display,
    }
];
const REGION_KEYBOARD = [
    {
        rome: 'رم',
        milan: 'میلان',
    }, 
    {
        torin: 'تورین',
        lecco: 'لکو',
        como: 'کومو',
    },
    {
        pavia: 'پاویا',
        piacensa: 'پیاچنزا',
        padova: 'پادوا',
    }, 
    {
        veniece: 'ونیز',
        pisa: 'پیزا',
        naples: 'ناپلی',
    },
    {
        felorence: 'فلورنس',
        bolognia: 'بولونیا',
        genova: 'جنوا',
    },
    {
        other: 'سایر',
        bolzano: 'بولزانو',
        siena: 'سیه‌نا',
    },
]
const MONTH_KEYBOARD = [
    {
        mar: 'مارچ',
        feb: 'فوریه',
        jan: 'ژانویه',
    },
    {
        jun: 'جون',
        may: 'می',
        apr: 'آپریل',
    },
    {
        sep: 'سپتامبر',
        aug: 'آگوست',
        jul: 'جولای',
    },
    {
        dec: 'دسامبر',
        nov: 'نوامبر',
        oct: 'اکتبر',
    }
];

function DAY_KEYBOARD(month) {
    let year = new Date().getFullYear();
    if(month < new Date().getMonth() + 1) {
        year += 1;
    }
    console.log(`NOW ${month} ${year}}`);
    // return array of days in month with key number of day and value number of day
    // each row has 7 days
    let days = [];
    let days_in_month = new Date(year, month, 0).getDate();
    let middle_row = {};
    for (let i = 0; i < days_in_month; i++) {
        middle_row[i + 1] = i + 1;
        if ((i + 1) % 7 == 0) {
            days.push(middle_row);
            middle_row = {};
        }
    }
    if (middle_row != {}) {
        // fill the middle row with empty days to reach 7 days
        let empty_days = 7 - Object.keys(middle_row).length;
        for (let i = 0; i < empty_days; i++) {
            middle_row[`ig${i + 1}`] = ' ';
        }
        days.push(middle_row);
    }
    return days;
}

const ENGLISH_EVENT_KEYBOARD = [
    {
        yes: 'بله',
        no: 'خیر',
    }
]

const NO_PIC_KEYBOARD = [
    {
        no_pic: 'بدون عکس',
    }
];

const NO_DETAIL_KEYBOARD = [
    {
        no_pic: 'بدون توضیحات',
    }
];

const FREE_PRICE_KEYBOARD = [
    {
        free: 'رایگان',
    }
];

const FULL_DAY_KEYBOARD = [
    {
        full_day: 'تمام روز',
    }
];

const START_KEYBOARD = [
    {
        start: BUTTONS.NEW_AD,
    }
];

const YES_NO_KEYBOARD = [
    {
        yes: 'بله',
        no: 'خیر',
    }
];

const ACCEPT_RULES_KEYBOARD = [
    {
        accept_rules: '✅ قوانین کانال را می‌پذیرم',
    }
]
const PUBLISH_KEYBOARD = [
    {
        publish: '✅ ارسال',
        reject: '❌ لغو',
    }
];

const ADMIN_KEYBOARD = [
    {
        reject: '❌ لغو',
        publish: '✅ ارسال',
    },
    // {
    //     // ad_channel: '📢 آگهی ها',
    // }
];



const MAIN_MENU = [
    [BUTTONS.NEW_AD],
    [BUTTONS.CONTACT_US, BUTTONS.RULES],
    [BUTTONS.CANCEL]
]

module.exports = { 
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
    FULL_DAY_KEYBOARD,
 };