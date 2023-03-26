let persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
let arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

// convert arabic and persian numbers to english
function convertDigits(digits) {
    if(typeof digits === 'string') {
        for(var i=0; i<10; i++) {
            digits = digits.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
        }
    }
    return digits;
}

module.exports = { convertDigits };