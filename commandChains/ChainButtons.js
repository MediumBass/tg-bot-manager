const users = require("../db/users.json");
const { botCommand, botButton, botReply, botFunction} = require("../db/languages.json");
const {ChangeUserLanguage} = require("../utils/channelsController");
const {CheckIfYouCanPost, CopyPost} = require("../utils/postsController");
const data = require("../db/database.json");
const RePostQue = [];
const ModeratorsAll = data.days;
class ChainButtons {
    ButtonHandler(bot,query,PostQue,channelsButtonList,CloseComments, Channels){
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const buttonData = query.data;
        let responseText;
        let replyMarkup;
        let index;
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
    }
}

module.exports = new ChainButtons()