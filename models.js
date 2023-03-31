const mongoose = require('mongoose');

const USER = mongoose.model('User', {
    _id: mongoose.Schema.Types.ObjectId,
    id: Number,
    first_name: String,
    last_name: String,
    is_bot: Boolean,
    is_premium: Boolean,
    username: String,
    language_code: String,

    status: String,
    phone_number: String,
    last_ad: {type: mongoose.Schema.Types.ObjectId, ref: 'Ad', default: null, required: false},
    last_publish_time: Date,

    created_at: Date,
    last_seen: Date,
    is_blocked: Boolean,
});

const AD = mongoose.model('Ad', {
    _id: mongoose.Schema.Types.ObjectId,

    cat: String,
    price: Number,
    title: String,
    is_english_event: Boolean,
    address: String,
    ticket: String,
    month: String,
    day: Number,
    region: String,
    detail: String,
    pic: String,
    is_planner: Boolean,

    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    owner_tg_id: Number,
    status: String,

    created_at: Date,
    updated_at: Date,
});


module.exports = { USER, AD };
