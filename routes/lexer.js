var express = require('express');
var AipNlpClient = require("baidu-aip-sdk").nlp;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var timeToId = require("../variables/general").timeToId;
var idToTime = require("../variables/general").idToTime;
var chineseTimeToNumberTime = require("../variables/general").chineseTimeToNumberTime;
var formatTime = require("../variables/general").formatTime;

let router = express.Router();

const APP_ID = "15515844";
const API_KEY = "X1bclMZIYWTYE1SHPZyGU6Pm";
const SECRET_KEY = "SyEAFM243BAik2aGzoc9vS4h7Hl9bdrO";

let client = new AipNlpClient(APP_ID, API_KEY, SECRET_KEY);
HttpClient.setRequestInterceptor(function(requestOptions) {
    // 查看参数
    console.log(requestOptions)
    // 修改参数
    requestOptions.timeout = 5000;
    // 返回参数
    return requestOptions;
});

router.get('/:text', function(req, res, next) {
    let text = req.params.text;
    client.lexer(text)
    .then((result) => {
        console.log(JSON.stringify(result));

        let extractedInfo = extractInfo(result.items);
        console.log(JSON.stringify(extractedInfo))
        extractedInfo.rawData = result;
        res.send(JSON.stringify(extractedInfo));
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    });
    
});

function extractInfo(items){
    let res = {};
    let timeList = [];
    let startTime;
    let endTime;
    let firstVerb = true;
    let content = "";
    for (let i in items){
        let item = items[i];
        // extract time
        if (item.ne === "TIME"){
            let zh_time = item.basic_words;
            console.log("zh_time: "+zh_time);
            let num_time = chineseTimeToNumberTime(zh_time);
            console.log("num_time: "+num_time);
            let format_time = formatTime(num_time);
            console.log("format_time: "+format_time);
            timeList.push(format_time);
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
    if (timeList.length === 1){
        startTime = timeList[0];
        endTime = idToTime(timeToId(timeList[0])+2)
    }
    else {
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
    res.content = content;
    return res;
}

module.exports = router;
