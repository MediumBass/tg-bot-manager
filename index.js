const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const {CommandChainHandler} = require('./commandChains/ChainTextCommands')
const {ButtonHandler} = require('./commandChains/ChainButtons')
const { CheckDateAndTime } = require('./utils/timer');
let data = require('./db/database.json');
let postsData = require('./db/postsDatabase.json');
const users = require('./db/users.json');
const {
  botCommand, botButton
} = require('./db/languages.json');

const bot = new TelegramBot(process.env.TokenTG, { polling: true });

    // destructured data
const AdminsIdGlobal = data.adminsAbsolute;
const Channels = data.channels;
const AdminsLocal = data.adminsLocal;

let channelsString = '';
let channelsButtonList = [];

const postTimer = {
    DLTReq: postsData.deleteRequests,
    AwaitReq: postsData.awaitedPosts,
};

    // arrays for temporary params, needed to allow multiply users use same command at the same time

const WorkingModerators = [];
const PostQue = [];
const CloseComments = [];


    // edit local memory
const setNewData = (newData) => {
  data = newData;
};
const setNewPostsData = (newData) => {
  postsData = newData;
};
const ChannelsString = () => {
  channelsString = '';
  channelsButtonList = [];
  for (let i = 0; i < Channels.length; i++) {
    channelsString += `${i} - ${Channels[i]} \n`;
    channelsButtonList.push([{ text: Channels[i], callback_data: Channels[i] }]);
  }
};
    // starting bot
ChannelsString();
setInterval(() => CheckDateAndTime(bot, data, postsData, WorkingModerators, ...Object.values(postTimer), PostQue, CloseComments, setNewData, setNewPostsData, Channels), process.env.timeout);
console.log('databases connected');

    // bot commands
bot.onText(/\/CheckMyId/, (msg) => {
  const resp = `${msg.from.first_name}  ${msg.from.id}`;
  bot.sendMessage(msg.chat.id, resp);
});
bot.onText(/\/ChangeLanguage/, (msg) => {
  const chatId = msg.chat.id;
  const text = 'Please, choose language.';
  const initialKeyboard = {
    inline_keyboard: [
      [{ text: 'English 🇬🇧', callback_data: '0' }],
      [{ text: 'Українська 🇺🇦', callback_data: '1' }],
    ],
  };
  bot.sendMessage(chatId, text, {
    reply_markup: initialKeyboard,
  });
});
bot.onText(/\/time/, (msg) => {
  bot.sendMessage(msg.chat.id, Date().toString());
});
bot.onText(/\/workingModerators/, (msg) => {
  bot.sendMessage(msg.chat.id, WorkingModerators.toString());
});
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[0][users[msg.chat.id]]);
});
bot.onText(/\/AddModer/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[1][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  bot.sendMessage(msg.chat.id, ` ${channelsString}`);
});
bot.onText(/\/DeleteModerFull/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[2][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  bot.sendMessage(msg.chat.id, ` ${channelsString}`);
});
bot.onText(/\/DeleteModerOneDay/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[3][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  bot.sendMessage(msg.chat.id, ` ${channelsString}`);
});
bot.onText(/\/AddManagerToChannel/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[4][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  bot.sendMessage(msg.chat.id, ` ${channelsString}`);
});
bot.onText(/\/AddLocalAdminToChannel/, (msg) => {
  if (AdminsIdGlobal.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, botCommand[5][users[msg.chat.id]]);
  } else {
    bot.sendMessage(msg.chat.id, botCommand[6][users[msg.chat.id]], { reply_markup: { force_reply: true } });
    bot.sendMessage(msg.chat.id, ` ${channelsString}`);
  }
});
bot.onText(/\/AddChannel/, (msg) => {
  if (AdminsIdGlobal.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, botCommand[7][users[msg.chat.id]]);
  } else {
    bot.sendMessage(msg.chat.id, botCommand[8][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  }
});
bot.onText(/\/DeleteManagerToChannel/, (msg) => {
  bot.sendMessage(msg.chat.id, botCommand[9][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  bot.sendMessage(msg.chat.id, ` ${channelsString}`);
});
bot.onText(/\/DeleteLocalAdmin/, (msg) => {
  if (AdminsIdGlobal.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, botCommand[10][users[msg.chat.id]]);
  } else {
    bot.sendMessage(msg.chat.id, botCommand[11][users[msg.chat.id]], { reply_markup: { force_reply: true } });
    bot.sendMessage(msg.chat.id, ` ${channelsString}`);
  }
});
bot.onText(/\/DeleteChannel/, (msg) => {
  if (AdminsIdGlobal.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, botCommand[12][users[msg.chat.id]]);
  } else {
    bot.sendMessage(msg.chat.id, botCommand[13][users[msg.chat.id]]);
    bot.sendMessage(msg.chat.id, botCommand[14][users[msg.chat.id]], { reply_markup: { force_reply: true } });
    bot.sendMessage(msg.chat.id, ` ${channelsString}`);
  }
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  let initialKeyboard;
  let text;
  if (!users[chatId]) {
    text = 'Please, choose language.';
    initialKeyboard = {
      inline_keyboard: [
        [{ text: 'English 🇬🇧', callback_data: '0' }],
        [{ text: 'Українська 🇺🇦', callback_data: '1' }],
      ],
    };
  } else {
    text = botCommand[15][users[msg.chat.id]];
    initialKeyboard = {
      inline_keyboard: [
        [{ text: botButton[1][users[msg.chat.id]], callback_data: 'create' }],
        [{ text: botButton[2][users[msg.chat.id]], callback_data: 'repost' }],
      ],
    };
  }
  bot.sendMessage(chatId, text, {
    reply_markup: initialKeyboard,
  });
});
bot.onText(/\/DeleteDelayedPostsById/, (msg) => {
  if (AdminsIdGlobal.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, botCommand[16][users[msg.chat.id]]);
  } else {
    bot.sendMessage(msg.chat.id, botCommand[17][users[msg.chat.id]], { reply_markup: { force_reply: true } });
  }
});
    // buttons commands
bot.on('callback_query', (query) => {
  ButtonHandler(bot,query,PostQue,channelsButtonList,CloseComments, Channels)
});
    // reply-commands
bot.on('message', (msg) => {
  CommandChainHandler(bot,msg,Channels,CloseComments,PostQue,AdminsLocal,AdminsIdGlobal, setNewData, setNewPostsData, ChannelsString )
});
