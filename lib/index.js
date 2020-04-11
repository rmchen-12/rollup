'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _toConsumableArray = _interopDefault(require('@babel/runtime-corejs2/helpers/toConsumableArray'));
var _parseInt = _interopDefault(require('@babel/runtime-corejs2/core-js/parse-int'));
var _Date$now = _interopDefault(require('@babel/runtime-corejs2/core-js/date/now'));
var base64js = _interopDefault(require('base64-js'));
var CryptoJS = _interopDefault(require('crypto-js'));

function intToByteArray(i) {
  var result = new Array(4).fill(0); //由高位到低位

  result[0] = i >> 24 & 0xff;
  result[1] = i >> 16 & 0xff;
  result[2] = i >> 8 & 0xff;
  result[3] = i & 0xff;
  return result;
}

function intToByteArrayLittleEndian(i) {
  var result = new Array(4).fill(0); //由低位到高位

  result[3] = i >> 24 & 0xff;
  result[2] = i >> 16 & 0xff;
  result[1] = i >> 8 & 0xff;
  result[0] = i & 0xff;
  return result;
}

function shortToByteArray(i) {
  var result = new Array(2).fill(0); //由高位到低位

  result[0] = i >> 8 & 0xff;
  result[1] = i & 0xff;
  return result;
}

function xorResult(srcData) {
  var key = 'thisjustfortime!';
  var keyData = getBytes(key);

  if (null == srcData || null == keyData) {
    return srcData;
  }

  var resData = new Array(srcData.length).fill(0);

  for (var i = 0; i < srcData.length; i++) {
    resData[i] = srcData[i] ^ keyData[i];
  }

  return resData;
}

function getAESEncryptCurTime(currentTimeByteArr, expiredTimeByteArr, timeByteArr) {
  var aesPadding = getBytes('zuolinqr');
  var aesKey = CryptoJS.enc.Base64.parse(base64js.fromByteArray([].concat(_toConsumableArray(currentTimeByteArr), _toConsumableArray(expiredTimeByteArr), _toConsumableArray(aesPadding))));
  var data = CryptoJS.enc.Base64.parse(base64js.fromByteArray(timeByteArr));
  var iv = CryptoJS.enc.Base64.parse(base64js.fromByteArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]));
  var encrypted = CryptoJS.AES.encrypt(data, aesKey, {
    iv: iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding
  });
  return encrypted.toString();
}

function getBytes(string) {
  var utf8 = unescape(encodeURIComponent(string));
  var arr = [];

  for (var i = 0; i < utf8.length; i++) {
    arr.push(utf8.charCodeAt(i));
  }

  return arr;
}

function createZlQrCodeForFlapDoor(qrArr, curTime, qrImagePeriod) {
  var _encryptArr, _encryptArr2, _encryptArr3, _resultArr, _resultArr2, _resultArr3, _resultArr4, _resultArr5;

  var type = [0, 1];
  var cmdArr = [9, 0];
  var currTimeArr = intToByteArray(_parseInt(curTime / 1000));

  var imageTimeout = _parseInt((curTime + qrImagePeriod) / 1000);

  var imageTimeArr = intToByteArray(imageTimeout);
  var checkSum = getCheckSum(currTimeArr, imageTimeArr);
  var checkSumArr = shortToByteArray(checkSum);
  var randomArr = new Array(8).fill(0);

  if (null != checkSumArr && checkSumArr.length == 2) {
    randomArr[0] = checkSumArr[0];
    randomArr[1] = checkSumArr[1];
  }

  var encryptArr = new Array(currTimeArr.length + imageTimeArr.length + randomArr.length).fill(0);

  (_encryptArr = encryptArr).splice.apply(_encryptArr, [0, currTimeArr.length].concat(_toConsumableArray(currTimeArr)));

  (_encryptArr2 = encryptArr).splice.apply(_encryptArr2, [currTimeArr.length, imageTimeArr.length].concat(_toConsumableArray(imageTimeArr)));

  (_encryptArr3 = encryptArr).splice.apply(_encryptArr3, [currTimeArr.length + imageTimeArr.length, randomArr.length].concat(_toConsumableArray(randomArr)));

  encryptArr = xorResult(encryptArr);
  var lengthArr = shortToByteArray(cmdArr.length + qrArr.length + encryptArr.length);
  var resultArr = new Array(type.length + lengthArr.length + cmdArr.length + qrArr.length + encryptArr.length).fill(0);

  (_resultArr = resultArr).splice.apply(_resultArr, [0, type.length].concat(type));

  (_resultArr2 = resultArr).splice.apply(_resultArr2, [type.length, lengthArr.length].concat(_toConsumableArray(lengthArr)));

  (_resultArr3 = resultArr).splice.apply(_resultArr3, [type.length + lengthArr.length, cmdArr.length].concat(cmdArr));

  (_resultArr4 = resultArr).splice.apply(_resultArr4, [cmdArr.length + type.length + lengthArr.length, qrArr.length].concat(_toConsumableArray(qrArr)));

  (_resultArr5 = resultArr).splice.apply(_resultArr5, [cmdArr.length + type.length + lengthArr.length + qrArr.length, encryptArr.length].concat(_toConsumableArray(encryptArr)));

  resultArr = [].concat(_toConsumableArray(resultArr), _toConsumableArray(intToByteArray(_parseInt(_Date$now() / 1000))));
  var resultCode = base64js.fromByteArray(resultArr);
  return resultCode;
}

function getCheckSum(data1, data2) {
  var sum = 0;

  for (var i = 0; i < data1.length; i++) {
    sum += data1[i] & 0xff;
  }

  for (var _i = 0; _i < data2.length; _i++) {
    sum += data2[_i] & 0xff;
  }

  return sum;
}

var DoorAccessTypes = {
  0: "ZLACLINK_WIFI",
  1: "ZLACLINK_NOWIFI",
  5: "ACLINK_ZL_GROUP",
  6: "ACLINK_LINGLING_GROUP",
  7: "FACEPLUSPLUS",
  8: "DINGXIN",
  9: "DASHI",
  10: "WEIGEN",
  11: "ACLINK_LINGLING",
  12: "ACLINK_HUARUN_GROUP",
  13: "ACLINK_WANGLONG",
  14: "ACLINK_WANGLONG_GROUP",
  15: "ACLINK_WANGLONG_DOOR",
  16: "ACLINK_WANGLONG_DOOR_GROUP",
  17: "ACLINK_BUS",
  18: "ACLINK_UCLBRT_DOOR",
  19: "ZUOLIN_V3",
  20: "VANZHIHUI",
  21: "WUJING",
  22: "ZLACLINK_UNION",
  23: "HAIKANG_GROUP",
  24: "HUAKE_GROUP",
  25: "FUSHI",
  26: "MOREDIAN",
  27: "DAOER",
  28: "CHENGZHI",
  29: "WEIGEN_UNION",
  30: "YUNTIAN"
};
var createQrCode = function createQrCode(_ref) {
  var qrInfo = _ref.qrInfo,
      type = _ref.type,
      namespace = _ref.namespace;
  var qrCodeKey = qrInfo.qrCodeKey,
      qrDriver = qrInfo.qrDriver,
      currentTime = qrInfo.currentTime,
      qrImageTimeout = qrInfo.qrImageTimeout,
      doorType = qrInfo.doorType,
      expireTimeMs = qrInfo.expireTimeMs;
  var qrCodeByteArr;

  try {
    qrCodeByteArr = base64js.toByteArray(qrCodeKey);
  } catch (error) {
    console.log(error);
  }

  var doorAccessType = DoorAccessTypes[doorType];
  var qrCodeBase64;

  switch (qrDriver) {
    case "zuolin":
      if (doorAccessType === "ZLACLINK_WIFI" || doorAccessType === "ZLACLINK_NOWIFI" || doorAccessType === "ACLINK_ZL_GROUP") {
        // "ZUOLIN"版本老门禁处理
        qrCodeBase64 = createZlQrCode(qrCodeByteArr);
      } else if (doorAccessType === "ZUOLIN_V3" || doorAccessType === "ZLACLINK_UNION" || doorAccessType === "WEIGEN_UNION" || doorAccessType === "WEIGEN") {
        // "ZUOLIN"版本新门禁处理
        qrCodeBase64 = qrCodeKey;
      }

      break;

    case "zuolin_v2":
      if (doorAccessType === "ZLACLINK_WIFI" || doorAccessType === "ZLACLINK_NOWIFI" || doorAccessType === "ACLINK_ZL_GROUP") {
        // "ZUOLIN_V2"版本老门禁处理
        qrCodeBase64 = createZlQrCodeForFlapDoor(qrCodeByteArr, _Date$now(), qrImageTimeout);
      } else if (doorAccessType === "ZUOLIN_V3" || doorAccessType === "ZLACLINK_UNION") {
        // "ZUOLIN_V2"版本新门禁处理
        qrCodeBase64 = createZlQrCodeForFlapDoorNew(qrCodeByteArr, currentTime, qrImageTimeout, namespace);
      } else if (doorAccessType === "WEIGEN_UNION" || doorAccessType === "WEIGEN") {
        qrCodeBase64 = createWeiGenV2QrCode(qrCodeByteArr, currentTime, expireTimeMs);
      }

      break;

    default:
      // 其他直接返回
      qrCodeBase64 = qrCodeKey;
      break;
  } // 如果是一码通的话返回的字节流，单单门禁的话直接转成base64


  return type === "ecard" ? createECardQrcode(qrCodeBase64) : qrCodeBase64;
}; // "ZUOLIN"版本老门禁处理

function createZlQrCode(qrCodeByteArr) {
  var type = [0, 1];
  var cmdArr = [8, 0];
  var lengthArr = shortToByteArray(qrCodeByteArr.length + cmdArr.length);
  var timeArr = intToByteArray(_parseInt(_Date$now() / 1000));
  return base64js.fromByteArray([].concat(type, _toConsumableArray(lengthArr), cmdArr, _toConsumableArray(qrCodeByteArr), _toConsumableArray(timeArr)));
} // "ZUOLIN_V2"版本新门禁处理


function createZlQrCodeForFlapDoorNew(qrCodeByteArr, currentTime, qrImageTimeout, namespace) {
  var cmd = _parseInt("03", 16);

  var len = shortToByteArray(qrCodeByteArr.length + 5);
  var data = qrCodeByteArr.slice(3);
  var currentTimeByteArr = intToByteArray(_parseInt(currentTime / 1000));
  var expiredTimeByteArr = intToByteArray(_parseInt((qrImageTimeout + currentTime) / 1000));
  var encryptArr = [].concat(_toConsumableArray(currentTimeByteArr), _toConsumableArray(expiredTimeByteArr));
  var encryptArrXor = xorResult(encryptArr);
  var result = namespace === "yuespace" ? [cmd].concat(_toConsumableArray(len), _toConsumableArray(data), _toConsumableArray(encryptArrXor)) : [cmd].concat(_toConsumableArray(len), _toConsumableArray(data), _toConsumableArray(encryptArr));
  return base64js.fromByteArray(result);
}

function createWeiGenV2QrCode(qrCodeByteArr, currentTime, expireTimeMs) {
  var currentTimeByteArr = intToByteArrayLittleEndian(_parseInt(currentTime / 1000));
  var expiredTimeByteArr = intToByteArrayLittleEndian(_parseInt(expireTimeMs / 1000));
  var timeByteArr = intToByteArrayLittleEndian(_parseInt(_Date$now() / 1000));
  var aes_encry_cur_time = base64js.toByteArray(getAESEncryptCurTime(currentTimeByteArr, expiredTimeByteArr, timeByteArr));
  return base64js.fromByteArray([].concat(_toConsumableArray(qrCodeByteArr), _toConsumableArray(aes_encry_cur_time)));
} // 一卡通版本门禁处理


function createECardQrcode(qrCodeKey) {
  var qrCodeByteArr = base64js.toByteArray(qrCodeKey);

  var cmd = _parseInt("02", 16);

  var len = _parseInt(qrCodeByteArr.length, 10);

  return base64js.fromByteArray([cmd, len].concat(_toConsumableArray(qrCodeByteArr)));
}

console.log(base64js.toByteArray("aGVsbG8="));

exports.createQrCode = createQrCode;
