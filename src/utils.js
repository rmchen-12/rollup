import CryptoJS from 'crypto-js';
import base64js from 'base64-js';

function intToByteArray(i) {
    const result = new Array(4).fill(0);
    //由高位到低位
    result[0] = (i >> 24) & 0xff;
    result[1] = (i >> 16) & 0xff;
    result[2] = (i >> 8) & 0xff;
    result[3] = i & 0xff;
    return result;
}

function intToByteArrayLittleEndian(i) {
    const result = new Array(4).fill(0);
    //由低位到高位
    result[3] = (i >> 24) & 0xff;
    result[2] = (i >> 16) & 0xff;
    result[1] = (i >> 8) & 0xff;
    result[0] = i & 0xff;
    return result;
}

function shortToByteArray(i) {
    const result = new Array(2).fill(0);
    //由高位到低位
    result[0] = (i >> 8) & 0xff;
    result[1] = i & 0xff;
    return result;
}

function xorResult(srcData) {
    const key = 'thisjustfortime!';
    const keyData = getBytes(key);
    if (null == srcData || null == keyData) {
        return srcData;
    }
    const resData = new Array(srcData.length).fill(0);
    for (let i = 0; i < srcData.length; i++) {
        resData[i] = srcData[i] ^ keyData[i];
    }
    return resData;
}

function getAESEncryptCurTime(
    currentTimeByteArr,
    expiredTimeByteArr,
    timeByteArr
) {
    const aesPadding = getBytes('zuolinqr');
    const aesKey = CryptoJS.enc.Base64.parse(
        base64js.fromByteArray([
            ...currentTimeByteArr,
            ...expiredTimeByteArr,
            ...aesPadding
        ])
    );

    const data = CryptoJS.enc.Base64.parse(base64js.fromByteArray(timeByteArr));
    const iv = CryptoJS.enc.Base64.parse(
        base64js.fromByteArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    );

    const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
        iv,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding
    });

    return encrypted.toString();
}

function getBytes(string) {
    const utf8 = unescape(encodeURIComponent(string));
    const arr = [];
    for (let i = 0; i < utf8.length; i++) {
        arr.push(utf8.charCodeAt(i));
    }
    return arr;
}

export {
    intToByteArray,
    shortToByteArray,
    xorResult,
    getBytes,
    intToByteArrayLittleEndian,
    getAESEncryptCurTime
};
