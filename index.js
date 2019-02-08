var TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
require("tls").DEFAULT_ECDH_CURVE = "auto"

var config = require('./config.json')

const token = config.token

var chats = [-1001480220158];

const bot = new TelegramBot(token, {polling: true});

var hosts = ['http://capgov.cos.ufrj.br' , 'http://www.cos.ufrj.br', 'https://ufrj.br/', 'https://portal.fiocruz.br/'];

var resps_anterior = []


bot.on('message', (msg) => {
    
    
    let promises = []
    let  resps = []

    hosts.forEach(host => promises.push(axios.get(host)))
    const promisesResolved = promises.map(promise => promise.catch(error => ({ error })))

    axios.all(promisesResolved).then(axios.spread((...responses) => { 
        responses.forEach( (response,response_idx) => {
            if(!response.error) resps.push(response.request.socket.servername + ' is online')
            else {
                console.log(response.error)
                resps.push(hosts[response_idx] + ' is offline')
            }
        })
        bot.sendMessage(msg.chat.id, resps.join('\n'));
        console.log(msg.chat.id);
    } , (error) => console.log(error.message)))

   
});

var cron = require('node-cron');

cron.schedule('1-59 * * * * *', () => {

  //console.log(chats);   
  //console.log('running every minute 1, 2, 4 and 5');
  

  let promises = []
  let resps = []
  let send_messages = false
  hosts.forEach(host => promises.push(axios.get(host)))
  const promisesResolved = promises.map(promise => promise.catch(error => ({ error })))

  axios.all(promisesResolved).then(axios.spread((...responses) => { 
      responses.forEach((response,response_idx) => {
          if(!response.error) resps.push(response.request.socket.servername + ' is online')
          else { 
              resps.push(hosts[response_idx] + ' is offline')
              send_messages = true
          }
      })
      
      if(!resps.every( e => resps_anterior.includes(e)) && (resps[0] != resps_anterior[0] ||  resps[0] == (hosts[response_idx] + ' is offline') ) ) chats.forEach(chat => bot.sendMessage(chat, resps.join('\n')) );
      
      resps_anterior = resps;
  } , (error) => console.log(error.message)))

  

});