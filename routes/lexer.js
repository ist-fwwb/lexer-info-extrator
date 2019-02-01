var express = require('express');
var AipNlpClient = require("baidu-aip-sdk").nlp;
var HttpClient = require("baidu-aip-sdk").HttpClient;
const extractInfo = require("../service/lexer-service").extractInfo;
const fetch = require("node-fetch");
const roomController = require("../variables/general").roomController;

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
        let extractedInfo={};
        //extractedInfo.rawData = result;
        try{
            extractedInfo = extractInfo(result.items);
            console.log(JSON.stringify(extractedInfo));
        }
        catch(err){
            console.log("Extract Error:"+err)
            extractedInfo.error = "Extract Error";
            res.send(JSON.stringify(extractedInfo));
        }
        let startTime = extractedInfo.startTime === -1 ? null : extractedInfo.startTime;
        let endTime = extractedInfo.endTime === -1 ? null : extractedInfo.endTime;
        let date = extractedInfo.date === -1 ? null : extractedInfo.date;
        let api = roomController.getRoomByStartTimeAndEndTimeAndDate(startTime, endTime, date);
        console.log(api)
        fetch(api, {
            method: 'get',
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            if (data.error){
                extractedInfo.error = data.error
            }
            else{
                if (data.length === 0){
                    extractedInfo.roomId = -1;
                }
                else {
                    extractedInfo.roomId = data[0].id;
                    extractedInfo.location = data[0].location
                }
            }
            res.send(JSON.stringify(extractedInfo));
            
        })
        .catch((err) => {
            console.log("Fetch Error:"+err)
            extractedInfo.error = "Fetch Error";
            res.send(JSON.stringify(extractedInfo));
        })
        
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    });
    
});

module.exports = router;
