import base64js from "base64-js";

import createZlQrCodeForFlapDoor from "./createZlQrCodeForFlapDoor";
import {
    intToByteArray,
    shortToByteArray,
    xorResult,
    intToByteArrayLittleEndian,
    getAESEncryptCurTime,
} from "./utils";

const DoorAccessTypes = {
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
    30: "YUNTIAN",
};

export const createQrCode = ({ qrInfo, type, namespace }) => {
    const {
        qrCodeKey,
        qrDriver,
        currentTime,
        qrImageTimeout,
        doorType,
        expireTimeMs,
    } = qrInfo;

    let qrCodeByteArr;
    try {
        qrCodeByteArr = base64js.toByteArray(qrCodeKey);
    } catch (error) {
        console.log(error);
    }
    const doorAccessType = DoorAccessTypes[doorType];
    let qrCodeBase64;

    switch (qrDriver) {
        case "zuolin":
            if (
                doorAccessType === "ZLACLINK_WIFI" ||
        doorAccessType === "ZLACLINK_NOWIFI" ||
        doorAccessType === "ACLINK_ZL_GROUP"
            ) {
                // "ZUOLIN"版本老门禁处理
                qrCodeBase64 = createZlQrCode(qrCodeByteArr);
            } else if (
                doorAccessType === "ZUOLIN_V3" ||
        doorAccessType === "ZLACLINK_UNION" ||
        doorAccessType === "WEIGEN_UNION" ||
        doorAccessType === "WEIGEN"
            ) {
                // "ZUOLIN"版本新门禁处理
                qrCodeBase64 = qrCodeKey;
            }
            break;
        case "zuolin_v2":
            if (
                doorAccessType === "ZLACLINK_WIFI" ||
        doorAccessType === "ZLACLINK_NOWIFI" ||
        doorAccessType === "ACLINK_ZL_GROUP"
            ) {
                // "ZUOLIN_V2"版本老门禁处理
                qrCodeBase64 = createZlQrCodeForFlapDoor(
                    qrCodeByteArr,
                    Date.now(),
                    qrImageTimeout
                );
            } else if (
                doorAccessType === "ZUOLIN_V3" ||
        doorAccessType === "ZLACLINK_UNION"
            ) {
                // "ZUOLIN_V2"版本新门禁处理
                qrCodeBase64 = createZlQrCodeForFlapDoorNew(
                    qrCodeByteArr,
                    currentTime,
                    qrImageTimeout,
                    namespace
                );
            } else if (
                doorAccessType === "WEIGEN_UNION" ||
        doorAccessType === "WEIGEN"
            ) {
                qrCodeBase64 = createWeiGenV2QrCode(
                    qrCodeByteArr,
                    currentTime,
                    expireTimeMs
                );
            }
            break;
        default:
            // 其他直接返回
            qrCodeBase64 = qrCodeKey;
            break;
    }

    // 如果是一码通的话返回的字节流，单单门禁的话直接转成base64
    return type === "ecard" ? createECardQrcode(qrCodeBase64) : qrCodeBase64;
};

// "ZUOLIN"版本老门禁处理
function createZlQrCode(qrCodeByteArr) {
    const type = [0, 1];
    const cmdArr = [8, 0];
    const lengthArr = shortToByteArray(qrCodeByteArr.length + cmdArr.length);
    const timeArr = intToByteArray(parseInt(Date.now() / 1000));

    return base64js.fromByteArray([
        ...type,
        ...lengthArr,
        ...cmdArr,
        ...qrCodeByteArr,
        ...timeArr,
    ]);
}

// "ZUOLIN_V2"版本新门禁处理
function createZlQrCodeForFlapDoorNew(
    qrCodeByteArr,
    currentTime,
    qrImageTimeout,
    namespace
) {
    const cmd = parseInt("03", 16);
    const len = shortToByteArray(qrCodeByteArr.length + 5);
    const data = qrCodeByteArr.slice(3);
    const currentTimeByteArr = intToByteArray(parseInt(currentTime / 1000));
    const expiredTimeByteArr = intToByteArray(
        parseInt((qrImageTimeout + currentTime) / 1000)
    );

    const encryptArr = [...currentTimeByteArr, ...expiredTimeByteArr];
    const encryptArrXor = xorResult(encryptArr);
    const result =
    namespace === "yuespace"
        ? [cmd, ...len, ...data, ...encryptArrXor]
        : [cmd, ...len, ...data, ...encryptArr];

    return base64js.fromByteArray(result);
}

function createWeiGenV2QrCode(qrCodeByteArr, currentTime, expireTimeMs) {
    const currentTimeByteArr = intToByteArrayLittleEndian(
        parseInt(currentTime / 1000)
    );
    const expiredTimeByteArr = intToByteArrayLittleEndian(
        parseInt(expireTimeMs / 1000)
    );
    const timeByteArr = intToByteArrayLittleEndian(parseInt(Date.now() / 1000));

    const aes_encry_cur_time = base64js.toByteArray(
        getAESEncryptCurTime(currentTimeByteArr, expiredTimeByteArr, timeByteArr)
    );

    return base64js.fromByteArray([...qrCodeByteArr, ...aes_encry_cur_time]);
}

// 一卡通版本门禁处理
function createECardQrcode(qrCodeKey) {
    const qrCodeByteArr = base64js.toByteArray(qrCodeKey);
    const cmd = parseInt("02", 16);
    let len = parseInt(qrCodeByteArr.length, 10);

    return base64js.fromByteArray([cmd, len, ...qrCodeByteArr]);
}

console.log(base64js.toByteArray("aGVsbG8="));
