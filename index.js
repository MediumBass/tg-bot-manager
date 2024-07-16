const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { CheckDateAndTime } = require('./utils/timer');
const { CopyPost, CheckIfYouCanPost, CreateNewAwaitedPost } = require('./utils/postsController');
const {
  NewModerator, CreateNewModerator, CreateNewManager, CreateNewLocalAdmin, EditDatabaseDeleteModeratorByDay, EditDatabaseDeleteModeratorByID, DatabaseDeleteAllPostsFrom, DeleteManagerById, DeleteNewLocalAdmin,
} = require('./utils/modersController');
const { CreateNewChannel, DeleteChannel, ChangeUserLanguage } = require('./utils/channelsController');
let data = require('./db/database.json');
let postsData = require('./db/postsDatabase.json');
const users = require('./db/users.json');
const {
  botCommand, botButton, botReply, botFunction,
} = require('./db/languages.json');

const bot = new TelegramBot(process.env.TokenTG, { polling: true });

    // destructured data
const AdminsIdGlobal = data.adminsAbsolute;
const ModeratorsAll = data.days;
const Channels = data.channels;
const AdminsLocal = data.adminsLocal;
const AdminsManagers = data.adminsManagers;

const CommentsChannel = data.commentsChannel;
const CloseComments = [];

let channelsString = '';
let channelsButtonList = [];

const postTimer = {
    DLTReq: postsData.deleteRequests,
    AwaitReq: postsData.awaitedPosts,
};

    // arrays for temporary params, needed to allow multiply users use same command at the same time
const ManagerQue = [];
const ModerQue = [];
const WorkingModerators = [];
const PostQue = [];
const RePostQue = [];
let newLocalAdminId;
let newChannelId;

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
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const buttonData = query.data;
  const listOptions = {
    inline_keyboard: [
      [{ text: botButton[8][users[chatId]], callback_data: 'addButton' }],
      [{ text: botButton[9][users[chatId]], callback_data: 'autoDelete' }],
      [{ text: botButton[10][users[chatId]], callback_data: 'returnComments' }],
      [{ text: botButton[11][users[chatId]], callback_data: 'continue' }],
    ],
  };
  const listTime = {
    inline_keyboard: [
      [{ text: botButton[18][users[chatId]], callback_data: 'now' }],
      [{ text: botButton[19][users[chatId]], callback_data: 'today' }],
      [{ text: botButton[20][users[chatId]], callback_data: 'nextDay' }],
      [{ text: botButton[21][users[chatId]], callback_data: 'nextNextDay' }],
      [{ text: botButton[22][users[chatId]], callback_data: 'custom' }],
    ],
  };
  let responseText;
  let replyMarkup;
  let index;
  const nowS = new Date();
  if (buttonData <= 10) {
    ChangeUserLanguage(users, buttonData, chatId);
    responseText = botButton[0][buttonData];
  }
  switch (buttonData) {
    case 'create':
      responseText = botButton[3][users[chatId]];
      replyMarkup = {
        inline_keyboard: channelsButtonList,
      };
      const thisPost = {
        type: 'create',
        moderId: chatId,
        buttonName: [],
        buttonUrl: [],
      };
      index = PostQue.findIndex((el) => el.moderId === chatId);
      if (index === -1) {
        PostQue.push(thisPost);
      } else {
        PostQue[index] = thisPost;
      }
      break;
    case 'repost':
      responseText = botButton[4][users[chatId]];
      replyMarkup = {
        inline_keyboard: channelsButtonList,
      };

      index = PostQue.findIndex((el) => el.moderId === chatId);
      if (index === -1) {
        PostQue.push({
          type: 'repost',
          moderId: chatId,
          buttonName: [],
          buttonUrl: [],
        });
      } else {
        PostQue[index] = {
          type: 'repost',
          moderId: chatId,
          buttonName: [],
          buttonUrl: [],
        };
      }
      const index2 = RePostQue.findIndex((el) => el.moderId === chatId);
      if (index2 === -1) {
        RePostQue.push({ moderId: chatId });
      } else {
        RePostQue[index2] = { moderId: chatId };
      }
      break;
    case 'autoDelete':
      responseText = botButton[5][users[chatId]];
      replyMarkup = {
        inline_keyboard: [
          [{ text: '12 hours', callback_data: '12h' }],
          [{ text: '24 hours', callback_data: '24h' }],
          [{ text: '48 hours', callback_data: '48h' }],
          [{ text: botButton[6][users[chatId]], callback_data: 'customhours' }],
        ],
      };
      break;
    case 'noComments':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].commentsAreClosed = true;
      responseText = botButton[7][users[chatId]];
      replyMarkup = listOptions;
      break;
    case 'returnComments':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].commentsAreClosed = false;
      responseText = botButton[12][users[chatId]];
      replyMarkup = listOptions;
      break;
    case '12h':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].autoDeleteHours = 12;
      responseText = `${botButton[13][users[chatId]]}12${botButton[14][users[chatId]]}`;
      replyMarkup = listOptions;
      break;
    case '24h':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].autoDeleteHours = 24;
      responseText = `${botButton[13][users[chatId]]}24${botButton[14][users[chatId]]}`;
      replyMarkup = listOptions;
      break;
    case '48h':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].autoDeleteHours = 47.9;
      responseText = `${botButton[13][users[chatId]]}48${botButton[14][users[chatId]]}`;
      replyMarkup = listOptions;
      break;
    case 'customhours':
      responseText = botButton[15][users[chatId]];
      bot.sendMessage(chatId, botButton[16][users[chatId]], { reply_markup: { force_reply: true } });
      replyMarkup = {
        inline_keyboard: [

        ],
      };
      break;
    case 'continue':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      responseText = botButton[17][users[chatId]];
      replyMarkup = listTime;
      break;
    case 'addButton':
      responseText = botButton[23][users[chatId]];
      replyMarkup = {
        inline_keyboard: [],
      };
      bot.sendMessage(chatId, botButton[24][users[chatId]], { reply_markup: { force_reply: true } });
      break;
    case 'now':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      const channelIndex = PostQue[index].channelId;
      if (CheckIfYouCanPost(nowS.getMonth(), nowS.getDate(), nowS.getHours(), nowS.getMinutes(), query.from.id, channelIndex, ModeratorsAll, Channels, AdminsLocal, AdminsIdGlobal)) {
        responseText = botButton[25][users[chatId]];
        replyMarkup = {
          inline_keyboard: [

          ],
        };
        CopyPost(bot, chatId, channelIndex, PostQue[index], CloseComments, Channels, botFunction[0][users[chatId]]);
      } else {
        responseText = botButton[26][users[chatId]];
        replyMarkup = listTime;
      }
      break;
    case 'today':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].dayPost = nowS.getDate();
      PostQue[index].monthPost = nowS.getMonth();
      responseText = botButton[27][users[chatId]] + nowS.getDate() + botButton[28][users[chatId]] + (nowS.getMonth() + 1) + botButton[29][users[chatId]];
      replyMarkup = {
        inline_keyboard: [],
      };
      bot.sendMessage(chatId, botButton[30][users[chatId]], { reply_markup: { force_reply: true } });
      break;
    case 'nextDay':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].dayPost = (nowS.getDate() + 1);
      PostQue[index].monthPost = nowS.getMonth();
      responseText = botButton[31][users[chatId]] + (nowS.getDate() + 1) + botButton[28][users[chatId]] + (nowS.getMonth() + 1) + botButton[29][users[chatId]];
      replyMarkup = {
        inline_keyboard: [],
      };
      bot.sendMessage(chatId, botButton[30][users[chatId]], { reply_markup: { force_reply: true } });
      break;
    case 'nextNextDay':
      index = PostQue.findIndex((el) => el.moderId === chatId);
      PostQue[index].dayPost = (nowS.getDate() + 2);
      PostQue[index].monthPost = nowS.getMonth();

      responseText = botButton[32][users[chatId]] + (nowS.getDate() + 2) + botButton[28][users[chatId]] + (nowS.getMonth() + 1) + botButton[29][users[chatId]];
      replyMarkup = {
        inline_keyboard: [],
      };
      bot.sendMessage(chatId, botButton[30][users[chatId]], { reply_markup: { force_reply: true } });
      break;
    case 'custom':
      responseText = botButton[33][users[chatId]];
      replyMarkup = {
        inline_keyboard: [],
      };
      bot.sendMessage(chatId, botButton[34][users[chatId]], { reply_markup: { force_reply: true } });
      break;
    default:
      if (Channels.indexOf(buttonData) !== -1) {
        responseText = botButton[35][users[chatId]] + buttonData;
        replyMarkup = {
          inline_keyboard: [],

        };
        index = PostQue.findIndex((el) => el.moderId === chatId);
        PostQue[index].channelId = buttonData;
        if (PostQue[index].type === 'create') {
          bot.sendMessage(chatId, botButton[36][users[chatId]], { reply_markup: { force_reply: true } });
        } else {
          bot.sendMessage(chatId, botButton[37][users[chatId]]);
        }
      }
      break;
  }

  bot.editMessageText(responseText, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
});
    // reply-commands
bot.on('message', (msg) => {
  const listOptions = {
    inline_keyboard: [
      [{ text: botButton[8][users[msg.chat.id]], callback_data: 'addButton' }],
      [{ text: botButton[9][users[msg.chat.id]], callback_data: 'autoDelete' }],
      [{ text: botButton[10][users[msg.chat.id]], callback_data: 'returnComments' }],
      [{ text: botButton[11][users[msg.chat.id]], callback_data: 'continue' }],
    ],
  };
  const listTime = {
    inline_keyboard: [
      [{ text: botButton[18][users[msg.chat.id]], callback_data: 'now' }],
      [{ text: botButton[19][users[msg.chat.id]], callback_data: 'today' }],
      [{ text: botButton[20][users[msg.chat.id]], callback_data: 'nextDay' }],
      [{ text: botButton[21][users[msg.chat.id]], callback_data: 'nextNextDay' }],
      [{ text: botButton[22][users[msg.chat.id]], callback_data: 'custom' }],
    ],
  };
  const chatId = msg.chat.id;
  if (CloseComments.indexOf(msg.forward_from_message_id) !== -1) { // нужно для удаления комментов
    const channelIndex = `@${msg.sender_chat.username}`;
    bot.deleteMessage(CommentsChannel[Channels.indexOf(channelIndex)], msg.message_id);
    CloseComments.splice(CommentsChannel[Channels.indexOf(channelIndex)], 1);
  }
  console.log(msg.forward_date);
  if (msg.forward_date) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    if (index !== -1 && PostQue[index].type === 'repost') {
      PostQue[index].postId = msg.message_id;
      PostQue[index].forwardFrom = msg.forward_from_message_id;
      bot.sendMessage(msg.chat.id, botReply[0][users[chatId]], { reply_markup: listOptions });
    }
  }

  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[1][users[chatId]]) {
    if (parseInt(msg.text, 10) < AdminsLocal.length) {
      if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1 || AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
        const addModerModer = new NewModerator(msg.chat.id);
        if (ModerQue.findIndex((el) => el.adminId === msg.chat.id) === -1) {
          ModerQue.push(addModerModer);
        }
        bot.sendMessage(msg.chat.id, botReply[3][users[chatId]], { reply_markup: { force_reply: true } });
        const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
        ModerQue[index].channelId = msg.text;
      } else {
        bot.sendMessage(msg.chat.id, botReply[1][users[chatId]]);
      }
    } else {
      bot.sendMessage(msg.chat.id, botReply[2][users[chatId]]);
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[3][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[4][users[chatId]], { reply_markup: { force_reply: true } });
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].moderId = msg.text;
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[5][users[chatId]]) {
    DatabaseDeleteAllPostsFrom(bot, msg.text, msg.chat.id, setNewPostsData, botFunction[9][users[chatId]], botFunction[10][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[4][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[6][users[chatId]], { reply_markup: { force_reply: true } });
    bot.sendMessage(msg.chat.id, botReply[7][users[chatId]]);
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].name = msg.text;
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[8][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[9][users[chatId]], { reply_markup: { force_reply: true } });
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].workingDay = msg.text;
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[9][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[10][users[chatId]], { reply_markup: { force_reply: true } });
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].startHour = msg.text;
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[10][users[chatId]]) {
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].endHour = msg.text;
    ModerQue[index].indexName = `${ModerQue[index].channelId}_${ModerQue[index].moderId}_${ModerQue[index].name}_${ModerQue[index].workingDay}_${ModerQue[index].startHour}_${ModerQue[index].endHour}`;
    if (parseInt(ModerQue[index].startHour) >= parseInt(msg.text)) {
      bot.sendMessage(msg.chat.id, botReply[11][users[chatId]]);
    } else {
      bot.sendMessage(msg.chat.id, `${ModerQue[index].channelId},\n${ModerQue[index].moderId},\n${ModerQue[index].name},\n${ModerQue[index].workingDay},\n${ModerQue[index].startHour},\n${ModerQue[index].endHour}`);
      bot.sendMessage(msg.chat.id, botReply[12][users[chatId]], { reply_markup: { force_reply: true } });
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[12][users[chatId]]) {
    CreateNewModerator(bot, msg.chat.id, ModerQue, setNewData, botFunction[3][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[13][users[chatId]]) {
    if (AdminsLocal[msg.text].indexOf(msg.from.id) === -1) {
      bot.sendMessage(msg.chat.id, botReply[14][users[chatId]]);
    } else {
      const thisManager = {
        adminId: msg.from.id,
        channelId: msg.text,
      };
      ManagerQue.push(thisManager);
      bot.sendMessage(msg.chat.id, botReply[15][users[chatId]], { reply_markup: { force_reply: true } });
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[15][users[chatId]]) {
    const index = ManagerQue.findIndex((el) => el.adminId === msg.chat.id);
    ManagerQue[index].managerId = msg.text;
    bot.sendMessage(msg.chat.id, `${ManagerQue[index].channelId},\n ${ManagerQue[index].managerId}`);
    bot.sendMessage(msg.chat.id, botReply[16][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[17][users[chatId]]) {
    CreateNewManager(bot, msg.chat.id, ManagerQue, setNewData, botFunction[4][users[chatId]]);
  }// 442
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[18][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].autoDeleteHours = msg.text;
    bot.sendMessage(msg.chat.id, botReply[19][users[chatId]] + msg.text + botButton[14][users[chatId]], { reply_markup: listOptions });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botButton[36][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].postId = msg.message_id;
    bot.sendMessage(msg.chat.id, botReply[21][users[chatId]], { reply_markup: listOptions });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botButton[24][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].buttonName.push(msg.text);
    bot.sendMessage(msg.chat.id, botReply[22][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[22][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].buttonUrl.push(msg.text);

    CopyPost(bot, msg.chat.id, msg.chat.id, PostQue[index], CloseComments, Channels, botFunction[0][users[chatId]]);
    bot.sendMessage(msg.chat.id, botReply[23][users[chatId]], { reply_markup: listOptions });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botButton[30][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].hoursPost = Number(msg.text);
    bot.sendMessage(msg.chat.id, botReply[24][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[24][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    const nowS = new Date();
    PostQue[index].yearPost = nowS.getFullYear();
    PostQue[index].minutesPost = Number(msg.text);
    let month = nowS.getMonth();
    let day = nowS.getDate();
    if (PostQue[index].monthPost) {
      month = PostQue[index].monthPost;
    }
    if (PostQue[index].dayPost) {
      day = PostQue[index].dayPost;
    }
    if (nowS > new Date(nowS.getFullYear(), month, day, PostQue[index].hoursPost, PostQue[index].minutesPost)) {
      bot.sendMessage(msg.chat.id, botReply[25][users[chatId]], {
        reply_markup: listTime,
      });
    } else if (CheckIfYouCanPost(month, day, PostQue[index].hoursPost, PostQue[index].minutesPost, msg.from.id, PostQue[index].channelId, ModeratorsAll, Channels, AdminsLocal, AdminsIdGlobal)) {
      CreateNewAwaitedPost(index, Channels.indexOf(PostQue[index].channelId), PostQue);
      bot.sendMessage(msg.chat.id, botReply[26][users[chatId]]);
    } else {
      bot.sendMessage(msg.chat.id, botReply[27][users[chatId]], {
        reply_markup: listTime,
      });
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botButton[34][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].dayPost = msg.text;
    bot.sendMessage(msg.chat.id, botButton[30][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[28][users[chatId]]) {
    const index = PostQue.findIndex((el) => el.moderId === msg.chat.id);
    PostQue[index].monthPost = (msg.text - 1);
    bot.sendMessage(msg.chat.id, botButton[30][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[2][users[chatId]]) {
    if (parseInt(msg.text, 10) < AdminsLocal.length) {
      if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1 || AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
        const addModerModer = new NewModerator(msg.chat.id);
        if (ModerQue.findIndex((el) => el.adminId === msg.chat.id) === -1) {
          ModerQue.push(addModerModer);
        }
        bot.sendMessage(msg.chat.id, botReply[29][users[chatId]], { reply_markup: { force_reply: true } });
        const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
        ModerQue[index].channelId = msg.text;
      } else {
        bot.sendMessage(msg.chat.id, botReply[1][users[chatId]]);
      }
    } else {
      bot.sendMessage(msg.chat.id, botReply[2][users[chatId]]);
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[29][users[chatId]]) {
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].moderId = msg.text;
    bot.sendMessage(msg.chat.id, botReply[30][users[chatId]] + msg.text);
    bot.sendMessage(msg.chat.id, botReply[31][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[31][users[chatId]]) {
    EditDatabaseDeleteModeratorByID(bot, msg.chat.id, ModerQue, setNewData, botFunction[6][users[chatId]], botFunction[7][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[3][users[chatId]]) {
    if (parseInt(msg.text, 10) < AdminsLocal.length) {
      if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1 || AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
        const addModerModer = new NewModerator(msg.chat.id);
        if (ModerQue.findIndex((el) => el.adminId === msg.chat.id) === -1) {
          ModerQue.push(addModerModer);
        }
        bot.sendMessage(msg.chat.id, botReply[32][users[chatId]], { reply_markup: { force_reply: true } });
        const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
        ModerQue[index].channelId = msg.text;
      } else {
        bot.sendMessage(msg.chat.id, botReply[1][users[chatId]]);
      }
    } else {
      bot.sendMessage(msg.chat.id, botReply[2][users[chatId]]);
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[32][users[chatId]]) {
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].workingDay = msg.text;
    bot.sendMessage(msg.chat.id, botReply[33][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[33][users[chatId]]) {
    const index = ModerQue.findIndex((el) => el.adminId === msg.chat.id);
    ModerQue[index].moderId = msg.text;
    bot.sendMessage(msg.chat.id, botReply[34][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[34][users[chatId]]) {
    EditDatabaseDeleteModeratorByDay(bot, msg.chat.id, ModerQue, setNewData, botFunction[6][users[chatId]], botFunction[8][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[6][users[chatId]]) {
    newLocalAdminId = msg.text;
    bot.sendMessage(msg.chat.id, botReply[35][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[35][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[36][users[chatId]] + msg.text + botReply[37][users[chatId]] + newLocalAdminId + botReply[38][users[chatId]]);
    CreateNewLocalAdmin(msg.chat.id, msg.text, newLocalAdminId, setNewData);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[39][users[chatId]]) {
    newChannelId = msg.text.trim();
    bot.sendMessage(msg.chat.id, botReply[40][users[chatId]]);
    bot.sendMessage(msg.chat.id, botReply[41][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[41][users[chatId]]) {
    let id;
    if (msg.text[0] === '@') {
      id = msg.text;
    } else {
      id = msg.text - 1000000000000;
    }
    CreateNewChannel(bot, msg.chat.id, newChannelId, id, AdminsIdGlobal, setNewData, setNewPostsData, ChannelsString, botFunction[1][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[9][users[chatId]]) {
    if (AdminsLocal[msg.text].indexOf(msg.from.id) === -1) {
      bot.sendMessage(msg.chat.id, botReply[14][users[chatId]]);
    } else {
      const thisManager = {
        adminId: msg.from.id,
        channelId: msg.text,
      };
      ManagerQue.push(thisManager);
      bot.sendMessage(msg.chat.id, botReply[42][users[chatId]], { reply_markup: { force_reply: true } });
    }
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[42][users[chatId]]) {
    const index = ManagerQue.findIndex((el) => el.adminId === msg.chat.id);
    ManagerQue[index].managerId = msg.text;
    bot.sendMessage(msg.chat.id, `${ManagerQue[index].channelId},\n ${ManagerQue[index].managerId}`);
    bot.sendMessage(msg.chat.id, botReply[43][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[43][users[chatId]]) {
    DeleteManagerById(bot, msg.chat.id, ManagerQue, setNewData, botFunction[5][users[chatId]]);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[11][users[chatId]]) {
    newLocalAdminId = msg.text;
    bot.sendMessage(msg.chat.id, botReply[44][users[chatId]], { reply_markup: { force_reply: true } });
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botReply[44][users[chatId]]) {
    bot.sendMessage(msg.chat.id, botReply[36] + msg.text + botReply[45][users[chatId]] + newLocalAdminId + botReply[46][users[chatId]], { reply_markup: { force_reply: true } });
    DeleteNewLocalAdmin(msg.chat.id, msg.text, newLocalAdminId, setNewData);
  }
  if (msg.reply_to_message && msg.reply_to_message.text === botCommand[14][users[chatId]]) {
    DeleteChannel(bot, msg.chat.id, msg.text, setNewData, setNewPostsData, ChannelsString, botFunction[2][users[chatId]]);
  }
});
