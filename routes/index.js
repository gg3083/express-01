var express = require('express');
var fs = require('fs');
const MessageMedia = require("../src/structures/MessageMedia");
var router = express.Router();
const {Client} = require('../index');
var bodyParser = require("body-parser");
var app            =         express();

// const SESSION_FILE_PATH = '../session.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const client = new Client({
    // puppeteer: {headless: false,      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'},
    puppeteer: {headless: false,},

    // session: sessionCfg
});

/* GET home page. */
router.get('/', function (req, res, next) {
    let qrCode = "init..."
    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrCode = qr
    });

    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
        // sessionCfg = session;
        // fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        //     if (err) {
        //         console.error(err);
        //     }
        // });
    });

    client.on('auth_failure', msg => {
        // Fired if session restore was unsuccessfull
        console.error('AUTHENTICATION FAILURE', msg);
    });

    client.on('ready', () => {

        console.log('Client is ready!');

        var day  = new Date()
        let month = day.getMonth() + 1
        if (month < 10){
            month = `0${month}`
        }
        let days = day.getDate()
        if (days < 10){
            days = `0${days}`
        }
        day = `${day.getFullYear()}-${month}-${days}`
        console.log(day)
        let filePath =`${process.env.USERPROFILE}\\Documents\\douba_crawler\\db\\${day}_whatsapp.json`
        var data = fs.readFileSync(filePath)
        console.log(data.toString())
        let result = JSON.parse(data)
        console.log(result.status, result.status != "1")
        if (result && result.status != "1"){
            fs.writeFile(filePath, '{"status": "1"}',  function(err) {
                if (err) {
                    return console.error(err);
                }
            });
        }

        res.send({state: '200'});
    });

    client.initialize();
    console.log('initialize')
});


router.get('/register/:phone', function (req, res, next) {
    let phone = `${req.params.phone}`;
    console.log(phone)


    client.isRegisteredUser(phone + '@c.us').then((r) => {
        console.log(`${phone} ${r === true ? '已' : '未'}注册`);
        res.send({phone: phone, isReg: r, sendState: '201'});
    }).catch(err => {
        console.log(err)
        res.send({msg: err, sendState: '501'});
    })
});

router.post('/send', function (req, res, next) {
    let phone = `${req.body.phone}`;
    let message = `${req.body.message}`;
    console.log('phone:', phone)
    console.log('message:', message)
    const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    client.sendMessage(number, message, {}).then((r) => {
        console.log(`${phone} 已发送: ${message} !`);
        res.send({phone: phone, sendState: '202'});
    }).catch(err => {
        console.log(err)
        res.send({msg: err, sendState: '502'});
    });

});

router.post('/sendImg', function (req, res, next) {
    let phone = `${req.body.phone}`;
    let message = `${req.body.message}`;
    let base64 = `${req.body.baseData}`;

    console.log('phone:', phone)
    console.log('message:', message)
    console.log('base64:', base64)
    const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;

    client.sendMessage(number, message, {}).then((r) => {
        console.log(`${phone} 已发送文字: ${message} !`);
        const media = new MessageMedia('image/png', base64);

        client.sendMessage(number, media, {}).then((r) => {
            console.log(`${phone} 已发送图片: ${message} !`);
            res.send({phone: phone, sendState: '202'});
        }).catch(err => {
            console.log(err)
            res.send({msg: err, sendState: '502'});
        });
    }).catch(err => {
        console.log(err)
        res.send({msg: err, sendState: '502'});
    });



});

router.get('/registerBatch/:phones', function (req, res, next) {
    let phones = `${req.params.phones}`;
    let phoneList = []
    if (phones.includes(",")) {
        phoneList = phones.split(",")
    } else {
        phoneList = [phones]
    }
    let resultData = []
    phoneList.forEach(phone => {
        client.isRegisteredUser(phone + '@c.us').then((r) => {
            console.log(`${phone} ${r === true ? '已' : '未'}注册`);
            resultData.push({phone: phone, isReg: r})
        })
        console.log('resultData-: ', resultData)
    })
    console.log('resultData: ', resultData)
    res.send(resultData);
});

router.get('/db', function(req, res, next) {
    var day  = new Date()
    let month = day.getMonth()
    if (month < 10){
        month = `0${month+1}`
    }
    let days = day.getDate()
    if (days < 10){
        days = `0${days+1}`
    }
    day = `${day.getFullYear()}-${month}-${days}`
    let filePath =`${process.env.USERPROFILE}\\Documents\\douba_crawler\\db\\${day}_whatsapp.json`
    var data = fs.readFileSync(filePath)
    console.log(data.toString())
    let result = JSON.parse(data)
    console.log(result.status, result.status != "1")
    if (result && result.status != "1"){
        fs.writeFile(filePath, '{"status": "1"}',  function(err) {
            if (err) {
                return console.error(err);
            }
        });
    }
    res.send(data);
});

router.get('/test2', function(req, res, next) {
    var day  = new Date()
    let month = day.getMonth()
    if (month < 10){
        month = `0${month+1}`
    }
    let days = day.getDate()
    if (days < 10){
        days = `0${days}`
    }
    day = `${day.getFullYear()}-${month}-${days}`
    console.log(day)
    let filePath =`${process.env.USERPROFILE}\\Documents\\douba_crawler\\db\\${day}_whatsapp.json`
    var data = fs.readFileSync(filePath)
    console.log(data.toString())
    let result = JSON.parse(data)
    console.log(result.status, result.status != "1")
    if (result && result.status != "1"){
        fs.writeFile(filePath, '{"status": "1"}',  function(err) {
            if (err) {
                return console.error(err);
            }
        });
    }
    res.send(data);
});

module.exports = router;

//  console.log(`${sendMessageTo}已注册`);
//           const number = sendMessageTo.includes('@c.us') ? sendMessageTo : `${sendMessageTo}@c.us`;
//           console.log(`${sendMessageTo} 已发送！`);
//           client.sendMessage(number, 'message', {});
