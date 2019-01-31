var ChineseToNumber  = require('chinese-number-parser');

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
	let result = hour + ":" + minute + ":00";
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
 * 3. mixture
 * [x]   5点半      ['5', '点', '半']
 * [x]   十二点30
 * [x]   12点30
 * [ ]   4.     these two can't be recognized.
 * [ ]   4.半
 * 
 */
const chineseTimeToNumberTime = (basic_list) => {
    let res = "";
    let zh_num_list = [];
    for (let i=0; i < basic_list.length; i++){
        let word = basic_list[i];
        let number = Number(word);
        // if the word is a number
        if (!isNaN(number)){
            res += number;
        }
        else if (word === "点" || word === ":"){
            res += ":";
        }
        else{
            let zh_num = String(ChineseToNumber(word));
            if ( i === 0)
                res += zh_num;
            else {
                if (word === "半"){
                    res += "30";
                    return res;
                }
                else
                    zh_num_list.push(zh_num);
            }
        }  
    }
    for (let i=0; i< zh_num_list.length; i++){
        let zh_num = zh_num_list[i];
        if (isNaN(Number(zh_num))){
            continue;
        }
        // e.g. 十二点五十
        else if (zh_num === "10" && i === zh_num_list.length-1){
            res += "0";
        }
        else
            res += zh_num_list[i];
    }
    if (res[res.length-1] === ':'){
        res += '00';
    }
    return res;
}

module.exports = {
    idToTime,
    timeToId,
    formatTime,
    chineseTimeToNumberTime
}