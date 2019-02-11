var timeToId = require("../variables/general").timeToId;
var idToTime = require("../variables/general").idToTime;
var chineseWeekdayToNumberDate = require("../variables/general").chineseWeekdayToNumberDate;
var chineseTimeToNumberTime = require("../variables/general").chineseTimeToNumberTime;
var chineseDateToNumberDate = require("../variables/general").chineseDateToNumberDate;
var formatTime = require("../variables/general").formatTime;
var today = require("../variables/general").today;

const utils_list = {
    tv: "TV",
    airconditioner: "AIRCONDITIONER",
    blackboard: "BLACKBOARD",
    table: "TABLE",
    wifi: "WIFI",
    network: "NETWORK",
    projector: "PROJECTOR",
    power: "POWER"
}

const extractInfo = (items) => {
    let res = {};
    let timeList = [];
    let startTime;
    let endTime;
    let date = "";
    let timeFlag = false;

    // shanghainese patch
    for (let i=0; i<items.length; i++){
        let item = items[i];
        if (item.item === "两月"){
            item = items[i+1];
            item.item = "二月" + item.item;
            item.basic_words.unshift("二月");
            items.splice(i,1);
            break;
        }
    }

    let utils = [];

    function push_utils(utils, util){
        if (utils.indexOf(util) === -1){
            utils.push(util);
        }
    };

    for (let i in items){
        let item = items[i];
        if (item.item.includes("电视")){
            push_utils(utils, utils_list.tv);
        }
        else if (item.item.includes("空调")){
            push_utils(utils, utils_list.airconditioner);
        }
        else if (item.item.includes("投影")){
            push_utils(utils, utils_list.projector);
        }
        else if (item.item.includes("网络") || item.item.includes("wifi") || item.item.includes("WIFI") || item.item.includes("无线网络")){
            push_utils(utils, utils_list.wifi);
        }
        else if (item.item.includes("黑板")){
            push_utils(utils, utils_list.blackboard);
        }
        else if (item.item.includes("桌子")){
            push_utils(utils, utils_list.table);
        }
        else if (item.item.includes("电源")){
            push_utils(utils, utils_list.power);
        }

        // extract time
        if (item.ne === "TIME"){
            timeFlag = true;
            let zh_weekday = "";
            let zh_date_time = item.basic_words;
            let zh_time = [];
            let zh_date = [];
            let local_date_flag = false;
            let local_time_flag = false;
            let local_week_flag = false;

            for (let j = 0; j < zh_date_time.length; j++){
                let temp_ele = zh_date_time[j];

                if (temp_ele.includes("周")){
                    zh_weekday = temp_ele;
                    local_week_flag = true;
                    zh_date = []
                    continue;
                }
                else if (temp_ele.includes("礼拜")){
                    zh_weekday += temp_ele;
                    j++;
                    temp_ele = zh_date_time[j];
                    zh_weekday += temp_ele;
                    local_week_flag = true;
                    zh_date = []
                    continue;
                }
                else if (temp_ele === "下午" || temp_ele ==="上午" || temp_ele ==="晚上"){
                    continue;
                }

                if (local_date_flag){
                    zh_time.push(temp_ele);
                }
                else {
                    zh_date.push(temp_ele);
                }

                if (temp_ele.includes("号") || temp_ele.includes("日") || temp_ele === "明天" || temp_ele === "后天" || temp_ele === "今天"){
                    local_date_flag = true;
                }
                
            }
            /**
             * 1. Case: date_flag === false 
             * time without date
             * e.g. 12:30, 十二点半, ...
             * 
             * 2. Case: date_flag === true
             * time with date
             * e.g. 十二月五号十二点半, 11月5号十一点四十, ...
             */
            if (local_week_flag){
                console.log("zh_weekday: " + zh_weekday)
                date = chineseWeekdayToNumberDate(zh_weekday);
                zh_time = zh_date;
            }
            else if (local_date_flag === false){
                zh_time = zh_date;
                date = today
            }
            else if (local_date_flag){
                console.log("zh_date: "+zh_date);
                date = chineseDateToNumberDate(zh_date);
                console.log("num_date: "+date);
            }

            if (zh_time.length > 0){
                local_time_flag = true;
            }
            
            
            if (local_time_flag){
                console.log("zh_time: "+zh_time);
                let num_time = chineseTimeToNumberTime(zh_time);
                console.log("num_time: "+num_time);
                let format_time = formatTime(num_time);
                console.log("format_time: "+format_time);
                timeList.push(format_time);
            }
        }
    }
    if (!timeFlag){
        res.error = "No Time Info";
        return res;
    }
    console.log(timeList)
    if (timeList.length > 0){
        if (timeList.length === 1){
            startTime = timeToId(timeList[0]);
            endTime = startTime+2;
        }
        else if (timeList.length > 1){
            let time1 = timeToId(timeList[0]);
            let time2 = timeToId(timeList[1]);
            if (time1 > time2){
                startTime = time2;
                endTime = time1;
            }
            else{
                startTime = time1;
                endTime = time2;
            }
        }
        
        res.startTime = (startTime > 47 || startTime < 0) ? -1: startTime;
        res.endTime = (endTime > 47 || endTime < 0) ? -1: endTime;
    }
    else{
        res.startTime = -1;
        res.endTime = -1;
    }
    res.date = date ? date : -1;
    res.utils = utils;
    return res;
}

module.exports = { extractInfo };