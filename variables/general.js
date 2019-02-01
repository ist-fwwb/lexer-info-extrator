var ChineseToNumber  = require('chinese-number-parser');

const prefix = "http://";
const domain = "47.106.8.44";
const port = "31000";
const server = prefix + domain + ":" + port;

const dateToString = (date) => (date.toLocaleDateString([],{year:"numeric", month:"2-digit", day:"numeric"}).replace(/\//g,'-'));
const today = dateToString(new Date());

const roomController = {
    "getRoom": () => (server + "/meetingroom" ),
    "getRoomByRoomId": (roomId) => (server + "/meetingroom/" + roomId),
    "createRoom": () => (server + "/meetingroom"), // json params in req body
    "editRoomByRoomId": (roomId) => (server + "/meetingroom/" + roomId), // json params in req body
    "deleteRoomByRoomId": (roomId) => (server + "/meetingroom/" + roomId),
};

const timeSliceController = {
    "getTimeSilceByDateAndRoomId": (date, roomId) => (server + "/timeSlice?date=" + date + "&roomId=" + roomId),
    "getTimeSilceByRoomId": (roomId) => (server + "/timeSlice?roomId=" + roomId),
};

const idToTime = (id) => {
    if (id % 2 === 0)
        return String(id / 2) + ":00";
    else
        return String((id - 1 ) / 2) + ":30";
}
  
const timeToId = (time) => {
    let li = time.split(':');
    return Number(li[0]) * 2 + (Number(li[1]) === 30 ? 1 : 0);
}

// format time to xx:30 or xx:00
// convert 2:00 to 14:00
const formatTime = (time) => {
	let array = time.split(':');
	let hour = Number(array[0]);
    let minute = Number(array[1]);
	if (minute < 0 || minute > 60){
        return -1;
    }
	if ( minute < 25){
		minute = "00";
	}
	else if (Math.abs(minute-30) <= 15){
		minute = "30";
	}
	else {
		minute = "00";
		if (hour === 23){
			hour = "00";
		}
		else{
			hour += 1;
		}
    }
    if (0 < hour && hour < 8){
        hour += 12;
    }
	let result = hour + ":" + minute;
	return result;
}

/**
 * different kinds of time from baidu nlp api
 * 1. The most friendly one. 
 * [x]   12:30 => ['12', ':', '30']
 * 2. all chinese.
 * [x]   五点       ['五', '点']
 * [x]   十二点半    ['十二', '点', '半']
 * [x]   十四点四十五 ['十四', '点', '四', '十', '五']
 * [x]   十二点零四分 ['十二', '点', '零', '四', '分']
 * [x]   十二点零四 ['十二', '点', '零', '四']
 * [x]   十二月二十五十二点半 ["十二", "月", "二", "十", "五"] & ["十", "二" ,"点" ,"半"]
 * 3. mixture
 * [x]   5点半      ['5', '点', '半']
 * [x]   十二点30
 * [x]   12点30
 * [ ]   五号12点   ["五号", "12", "点"],
 * [ ]   5号12点    ["5", "号", "12", "点"]
 * [ ]   十二月五号12点 ["十二", "月", "五号", "12", "点"]
 * [ ]   11月五号12点   ["11", "月", "五号", "12", "点"]
 * [ ]   11月5号12点    ["11", "月", "5", "号", "12", "点"]
 * [ ]   4.     the following two can't be recognized.
 * [ ]   4.半
 * 
 */

 /**
  * do not support date contains year !
  * 
  * @param {Array<String>} basic_list 
  */
const chineseDateToNumberDate = (basic_list) => {
    let now = new Date();
    let res_year = now.getFullYear();
    let res_month;
    let res_day;

    let s = "";
    let res = "";
    for (let i=0; i < basic_list.length; i++){
        s += basic_list[i];
    }
    s = s.replace("号", "");
    s = s.replace("日", "");
    if (s.includes("月")){
        let s_list = s.split("月");

        let number = Number(s_list[0]);
        if (!isNaN(number)){
            res_month = String(number);
        }
        else{
            res_month = ChineseToNumber(s_list[0]);
        }
        number = Number(s_list[1]);
        if (!isNaN(number)){
            res_day = String(number);
        }
        else{
            res_day = ChineseToNumber(s_list[1]);
        }
    }
    else{
        res_month = now.getMonth()+1;
        let number = Number(s);
        if (!isNaN(number)){
            res_day = String(number);
        }
        else{
            res_day = ChineseToNumber(s);
        }
    }
    res = res_year + "-" + res_month + "-" + res_day;
    return res;
}

 /**
  * @param {Array<String>} basic_list 
  */
const chineseTimeToNumberTime = (basic_list) => {
    let s = "";
    let res = "";
    for (let i=0; i < basic_list.length; i++){
        s += basic_list[i];
    }
    let s_list;
    if (s.includes(":")){
        s_list = s.split(":");
    }
    else if (s.includes("点")){
        s_list = s.split("点");
    }
    if (s_list.length === 1){
        let ele = s_list[0];
        let number = Number(ele);
        if (!isNaN(number)){
            res += String(number);
        }
        else{
            res += ChineseToNumber(ele);
        }
        res += ":00"
    }
    else if (s_list.length === 2){
        let ele = s_list[0];
        let number = Number(ele);
        if (!isNaN(number)){
            res += String(number);
        }
        else{
            res += ChineseToNumber(ele);
        }
        res += ":"
        ele = s_list[1];
        number = Number(ele);
        if (!isNaN(number)){
            res += String(number);
        }
        else if (ele === "半"){
            res += "30";
        }
        else if (ele === "" || ele === "钟"){
            res += "00";
        }
        else{
            res += ChineseToNumber(ele);
        }
    }
    return res;
}

module.exports = {
    idToTime,
    timeToId,
    formatTime,
    chineseTimeToNumberTime,
    chineseDateToNumberDate,
    roomController,
    timeSliceController,
    today,
}