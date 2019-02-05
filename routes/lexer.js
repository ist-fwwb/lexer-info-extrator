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
    let extractedInfo={};

    client.lexer(text)
    .then((result) => {
        console.log(JSON.stringify(result));
        extractedInfo.rawData = result;
        try{
            extractedInfo = extractInfo(result.items);
            console.log(JSON.stringify(extractedInfo));
        }
        catch(err){
            console.log("Extract Error:"+err)
            extractedInfo.error = "Extract Error";
            return res.send(JSON.stringify(extractedInfo));
        }
        if (extractInfo.error){
            return res.send(JSON.stringify(extractedInfo));
        }
        return res.send(JSON.stringify(extractedInfo));
        
    })
    .catch((err) => {
        console.log(err);
        extractedInfo.error = err;
        return res.send(extractInfo);
    });
    
});

module.exports = router;
