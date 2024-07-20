const users = require("../db/users.json");
const { botCommand, botButton, botReply, botFunction} = require("../db/languages.json");
const {
    NewModerator,
    DatabaseDeleteAllPostsFrom,
    CreateNewModerator,
    CreateNewManager,
    EditDatabaseDeleteModeratorByID,
    EditDatabaseDeleteModeratorByDay,
    CreateNewLocalAdmin,
    DeleteManagerById,
    DeleteNewLocalAdmin
} = require("../utils/modersController");
const {CopyPost, CheckIfYouCanPost, CreateNewAwaitedPost} = require("../utils/postsController");
const {CreateNewChannel, DeleteChannel} = require("../utils/channelsController");
const data = require("../db/database.json");
const ManagerQue = [];
const ModerQue = [];
const AdminsManagers = data.adminsManagers;
const CommentsChannel = data.commentsChannel;
let newLocalAdminId;
let newChannelId;
class ChainTextCommands {
    CommandChainHandler(bot,msg,Channels,CloseComments,PostQue,AdminsLocal,AdminsIdGlobal, setNewData, setNewPostsData, ChannelsString ){
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
}
}

module.exports = new ChainTextCommands()