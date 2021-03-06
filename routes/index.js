var express = require('express');
var fs = require('fs');
var router = express.Router();
const {Client} = require('../index');

// const SESSION_FILE_PATH = '../session.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }
//

const client = new Client({
    // puppeteer: {headless: false,      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'},
    puppeteer: {headless: false,    },

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
    }).catch(err=>{
        console.log(err)
        res.send({msg: err, sendState: '501'});
    })
});

router.get('/send/:phone/:message', function (req, res, next) {
    let phone = `${req.params.phone}`;
    let message = `${req.params.message}`;
    const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    client.sendMessage(number, message, {}).then((r) => {
        console.log(`${phone} 已发送: ${message} !`);
        res.send({phone: phone, sendState: '202'});
    }).catch(err=>{
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


module.exports = router;

//  console.log(`${sendMessageTo}已注册`);
//           const number = sendMessageTo.includes('@c.us') ? sendMessageTo : `${sendMessageTo}@c.us`;
//           console.log(`${sendMessageTo} 已发送！`);
//           client.sendMessage(number, 'message', {});
