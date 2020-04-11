import base64js from 'base64-js';

import { intToByteArray, shortToByteArray, xorResult } from './utils';

function createZlQrCodeForFlapDoor(qrArr, curTime, qrImagePeriod) {
    const type = [0, 1];
    const cmdArr = [9, 0];
    const currTimeArr = intToByteArray(parseInt(curTime / 1000));
    const imageTimeout = parseInt((curTime + qrImagePeriod) / 1000);
    const imageTimeArr = intToByteArray(imageTimeout);
    const checkSum = getCheckSum(currTimeArr, imageTimeArr);
    const checkSumArr = shortToByteArray(checkSum);
    const randomArr = new Array(8).fill(0);
    if (null != checkSumArr && checkSumArr.length == 2) {
        randomArr[0] = checkSumArr[0];
        randomArr[1] = checkSumArr[1];
    }

    let encryptArr = new Array(
        currTimeArr.length + imageTimeArr.length + randomArr.length
    ).fill(0);
    encryptArr.splice(0, currTimeArr.length, ...currTimeArr);
    encryptArr.splice(currTimeArr.length, imageTimeArr.length, ...imageTimeArr);
    encryptArr.splice(
        currTimeArr.length + imageTimeArr.length,
        randomArr.length,
        ...randomArr
    );
    encryptArr = xorResult(encryptArr);
    const lengthArr = shortToByteArray(
        cmdArr.length + qrArr.length + encryptArr.length
    );
    let resultArr = new Array(
        type.length +
      lengthArr.length +
      cmdArr.length +
      qrArr.length +
      encryptArr.length
    ).fill(0);
    resultArr.splice(0, type.length, ...type);
    resultArr.splice(type.length, lengthArr.length, ...lengthArr);
    resultArr.splice(type.length + lengthArr.length, cmdArr.length, ...cmdArr);
    resultArr.splice(
        cmdArr.length + type.length + lengthArr.length,
        qrArr.length,
        ...qrArr
    );
    resultArr.splice(
        cmdArr.length + type.length + lengthArr.length + qrArr.length,
        encryptArr.length,
        ...encryptArr
    );
    resultArr = [...resultArr, ...intToByteArray(parseInt(Date.now() / 1000))];
    const resultCode = base64js.fromByteArray(resultArr);
    return resultCode;
}

function getCheckSum(data1, data2) {
    let sum = 0;
    for (let i = 0; i < data1.length; i++) {
        sum += data1[i] & 0xff;
    }
    for (let i = 0; i < data2.length; i++) {
        sum += data2[i] & 0xff;
    }
    return sum;
}

export default createZlQrCodeForFlapDoor;
