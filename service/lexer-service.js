var timeToId = require("../variables/general").timeToId;
var idToTime = require("../variables/general").idToTime;
var chineseTimeToNumberTime = require("../variables/general").chineseTimeToNumberTime;
var chineseDateToNumberDate = require("../variables/general").chineseDateToNumberDate;
var formatTime = require("../variables/general").formatTime;
var today = require("../variables/general").today;

const extractInfo = (items) => {
    let res = {};
    let timeList = [];
    let startTime;
    let endTime;
    let firstVerb = true;
    let content = "";
    let date = "";

    for (let i in items){
        let item = items[i];
        // extract time
        if (item.ne === "TIME"){
            timeFlag = true;
            let zh_date_time = item.basic_words;
            let zh_time = [];
            let zh_date = [];
            let local_date_flag = false;
            let local_time_flag = false;
            for (let j in zh_date_time){
                let temp_ele = zh_date_time[j];
                if (local_date_flag){
                    zh_time.push(temp_ele);
                }
                else {
                    zh_date.push(temp_ele);
                }
                if (temp_ele.includes("号") || temp_ele.includes("日")){
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
            if (local_date_flag === false){
                zh_time = zh_date;
                date = today
            }
            else {
                console.log("zh_date:"+zh_date);
                date = chineseDateToNumberDate(zh_date);
                console.log("num_date"+date);
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
        else if (firstVerb){
            if (item.pos === "v"){
                firstVerb = false;
            }
        }
        else if (!firstVerb){
            content += item.item;
        }
    }
    console.log(timeList)
    if (timeList.length > 0){
        if (timeList.length === 1){
            startTime = timeList[0];
            endTime = idToTime(timeToId(timeList[0])+2)
        }
        else if (timeList.length > 1){
            let time1 = timeToId(timeList[0]);
            let time2 = timeToId(timeList[1]);
            if (time1 > time2){
                startTime = idToTime(time2);
                endTime = idToTime(time1);
            }
            else{
                startTime = idToTime(time1);
                endTime = idToTime(time2);
            }
        }
        
        res.startTime = startTime;
        res.endTime = endTime;
    }
    else{
        res.startTime = -1;
        res.endTime = -1;
    }
    res.content = content ? content : -1;
    res.date = date ? date : -1;
    
    return res;
}

module.exports = { extractInfo };