const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
let data = require("./database.json");
let postsData =require("./postsDatabase.json");
const token = '';

const bot = new TelegramBot(token, {polling: true});
let AdminsIdGlobal=data.adminsAbsolute
let ModeratorsAll= data.days
let Channels= data.channels
let AdminsLocal= data.adminsLocal
let AdminsManagers= data.adminsManagers
let AwaitedPosts= postsData.awaitedPosts
let DeleteRequests= postsData.deleteRequests
let CommentsChannel= data.commentsChannel
let CloseComments=[]

let channelsString=""
let channelsButtonList=[]

let ManagerQue=[]
let ModerQue=[]
let WorkingModerators=[]
let PostQue=[]
let RePostQue=[]

let timerId = setInterval(() => CheckDateAndTime(), 10000);
let currentDay
let currentHour
let currentTime

fs.readFile('database.json', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("database.json connected");
    }
})
fs.readFile('postsDatabase.json', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("postsDatabase.json connected");
    }
})
//проверяет каждую минуту состояние модераторов в этот день
const CheckDateAndTime= () => {
    let now = new Date();
    currentDay=now.getDay()
    currentHour=now.getHours()
    currentTime=now.getTime()
  //  console.log("цикл начался")
    // console.log( PostQue[0])
    for(let j=0;j<ModeratorsAll.length;j++) { //колво каналов
        //цикл постинга

        for(let i=0;i<AwaitedPosts[j].length;i++) {//7 дней
            if (AwaitedPosts[j][i] !== undefined) {
                if (AwaitedPosts[j][i].finalDate <= currentTime) {
                    CopyPost(AwaitedPosts[j][i].moderId, AwaitedPosts[j][i].channelId, AwaitedPosts[j][i])
                    DeleteFromAwaitedPosts(j, i)
                }
            }
        }
        //цикл автоудаления
        if(DeleteRequests[j]){
            for(let i=0;i<DeleteRequests[j].length;i++){
                if(DeleteRequests[j][i].mustBeDeletedAt<=currentTime){
                    DeleteFromAutoDelete(DeleteRequests[j][i],i)
                }
            }
        }
        //цикл раздачи админок
        let Moderators=ModeratorsAll[j]
        let channelName = Channels[j]
        for (let i = 0; i < Moderators[currentDay].length; i++) {
           // console.log(WorkingModerators)
            if (currentHour >= Moderators[currentDay][i].startHour && currentHour < Moderators[currentDay][i].endHour) {
                // console.log("moder with id "+Moderators[currentDay][i].id+" is working now")
                if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) === -1) {
                    WorkingModerators.push(Moderators[currentDay][i].indexName)
                    bot.promoteChatMember(channelName, Moderators[currentDay][i].moderId, {
                        can_change_info: false,
                        can_post_messages: true,
                        can_edit_messages: true,
                        can_delete_messages: true,
                        can_invite_users: false,
                        can_restrict_members: false,
                        can_pin_messages: false,
                        can_promote_members: false,
                    }).then(() => {
                        console.log('User ' + Moderators[currentDay][i].indexName + ' promoted successfully')
                    }).catch((error) => {
                        console.error('Error promoting user:', error)
                    });
                }
            } else {
                //  console.log("moder with id "+Moderators[currentDay][i].id+" isnt working now")
                if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) !== -1) {
                    WorkingModerators.splice(WorkingModerators.indexOf(Moderators[currentDay][i].indexName), 1)
                    bot.promoteChatMember(channelName, Moderators[currentDay][i].moderId, {
                        can_change_info: false,
                        can_post_messages: false,
                        can_edit_messages: false,
                        can_delete_messages: false,
                        can_invite_users: false,
                        can_restrict_members: false,
                        can_pin_messages: false,
                        can_promote_members: false,
                    }).then(() => {
                        console.log('User ' + Moderators[currentDay][i].indexName + ' demoted successfully')
                    }).catch((error) => {
                        console.error('Error promoting user:', error)
                    });
                }
            }
        }
    }

}
const ChannelsString = () =>{
    channelsString=""
    channelsButtonList=[]
    for(let i = 0; i < Channels.length; i++){
        channelsString+=i+" - "+Channels[i]+" \n"
        channelsButtonList.push([{ text: Channels[i], callback_data: Channels[i] }])
    }
}
ChannelsString()
//добавление/удаление в бд
function newModerator(adminId) {
    this.adminId = adminId;
}
const CreateNewModerator = (chatId) => {
    let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chatId)])
    let EditedModerators=data
    EditedModerators.days[Moderator.channelId][Moderator.workingDay].push(Moderator)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    ModerQue.splice(ModerQue[ModerQue.findIndex(el => el.adminId === chatId)], 1)
    bot.sendMessage(chatId, `Новый модератор успешно добавлен на сервер`);

}
const CreateNewManager = (chatId) => {
    let thisManager = Object.assign({}, ManagerQue[ManagerQue.findIndex(el => el.adminId === chatId)])
    let EditedManagers=data

    EditedManagers.adminsManagers[thisManager.channelId].push(parseInt(thisManager.managerId,10))
    fs.writeFile('database.json', JSON.stringify(EditedManagers), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedManagers
        }
    })
    ManagerQue.splice(ManagerQue.findIndex(el => el.adminId === chatId), 1)
    bot.sendMessage(chatId, `Новый менеджер успешно добавлен на сервер`);
}
const CreateNewLocalAdmin = (chatId,userId) => {
    let EditedModerators=data
    EditedModerators.adminsLocal[newLocalAdminId].push(parseInt(userId,10))
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    newLocalAdminId=null
}
const CreateNewChannel = (chatId,channelName,commentsChannel) => {
    let EditedModerators=data
    let EditedPosts=postsData
    EditedModerators.channels.push(channelName)
    EditedModerators.adminsLocal.push(AdminsIdGlobal)
    EditedModerators.adminsManagers.push([])
    EditedModerators.days.push([[],[],[],[],[],[],[]])
    EditedPosts.awaitedPosts.push([])
    EditedPosts.deleteRequests.push([])
    EditedModerators.commentsChannel.push(commentsChannel)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
    bot.sendMessage(chatId, `Новый канал успешно добавлен на сервер`);
    ChannelsString()
}
const CreateNewAwaitedPost = (chatId,channelId) => {
    let EditedPosts=postsData
    console.log(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost)
    let requestedDate=new Date(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost,0)
    PostQue[chatId].finalDate=requestedDate.getTime()
    EditedPosts.awaitedPosts[channelId].push(PostQue[chatId])
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
}
const EditDatabaseDeleteModeratorByID = (chat) => {
    let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chat)])
    let EditedModerators=data
    for(let i =0;i<7;i++){

        let index = EditedModerators.days[Moderator.channelId][i].findIndex(obj => obj.moderId === Moderator.moderId);
        if(index!==-1){
            EditedModerators.days[Moderator.channelId][i].splice(index,1)
        }
    }
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    bot.sendMessage(chat, `Модератор с ID ${Moderator.moderId} полностью удален из базы данных этого канала`)
}
const DatabaseDeleteAllPostsFrom = (deletedModerId, chat) => {
    let EditedPosts=postsData
    for(let i=0;i<postsData.awaitedPosts.length;i++) {
        for (let j = 0; j < postsData.awaitedPosts[i].length; j++) {
            if (postsData.awaitedPosts[i][j].moderId==deletedModerId) {
                postsData.awaitedPosts[i].splice(j,1)
            }
        }
    }
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
    bot.sendMessage(chat, `Все посты от ID ${deletedModerId} убраны из очереди и не будут запощены`)
}
const EditDatabaseDeleteModeratorByDay = (chat) => {
    let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chat)])
    let EditedModerators=data
        let index = EditedModerators.days[Moderator.channelId][Moderator.workingDay].findIndex(obj => obj.moderId === Moderator.moderId);
        if(index!==-1){
            EditedModerators.days[Moderator.channelId][Moderator.workingDay].splice(index,1)
        }
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    bot.sendMessage(chat, `Модератор с ID ${Moderator.moderId} был удален из базы данных в день${Moderator.workingDay}`)
}
const DeleteManagerById = (chatId) => {
    let thisManager = Object.assign({}, ManagerQue[ManagerQue.findIndex(el => el.adminId === chatId)])
    let EditedManagers=data

    EditedManagers.adminsManagers[thisManager.channelId].splice(EditedManagers.adminsManagers.indexOf(thisManager.managerId),1)
    fs.writeFile('database.json', JSON.stringify(EditedManagers), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedManagers
        }
    })
    ManagerQue.splice(ManagerQue.findIndex(el => el.adminId === chatId), 1)
    bot.sendMessage(chatId, `Данный менеджер успешно удален с сервера`);
}
const DeleteNewLocalAdmin = (chatId,userId) => {
    let EditedModerators=data
    EditedModerators.adminsLocal[newLocalAdminId].splice(EditedModerators.adminsLocal.indexOf(parseInt(userId,10)),1)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    newLocalAdminId=null
}
const DeleteChannel = (chatId,channelName) => {
    let EditedModerators=data
    let EditedPosts=postsData
    EditedModerators.channels.splice(channelName,1)
    EditedModerators.adminsLocal.splice(channelName,1)
    EditedModerators.adminsManagers.splice(channelName,1)
    EditedModerators.days.splice(channelName,1)
    EditedPosts.awaitedPosts.splice(channelName,1)
    EditedPosts.deleteRequests.splice(channelName,1)
    EditedModerators.commentsChannel.splice(channelName,1)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
            postsData=EditedPosts
        }
    })
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
    bot.sendMessage(chatId, `Данный канал успешно удален`);
    ChannelsString()
}
const DeleteFromAwaitedPosts = (channelId,postId) => {
    let EditedPosts=postsData
    EditedPosts.awaitedPosts[channelId].splice(postId,1)
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
}
let newLocalAdminId
const CopyPost = (from, destination, postObject) => {
console.log("start")
    let inlineKeyboard={
        inline_keyboard: [

        ]
    }
    for(let i=0;i<postObject.buttonName.length;i++) {
        if (postObject.buttonName[i]) {
            inlineKeyboard.inline_keyboard.push([{text: postObject.buttonName[i], url: postObject.buttonUrl[i]}])
        }
    }
    if(postObject.type!=="repost") {
        console.log("if")
        bot.copyMessage(destination, from, postObject.postId, {reply_markup: inlineKeyboard})
            .then((copiedMessage) => {
                let copiedMessageId = copiedMessage.message_id
                if (postObject.autoDeleteHours) {
                    let now = new Date();
                    HangAutoDelete(postObject.autoDeleteHours, copiedMessageId, Channels.indexOf(postObject.channelId), now.getTime())
                }
                console.log(postObject)
                if (postObject.commentsAreClosed) {
                    CloseComments.push(copiedMessageId)
                    console.log(CloseComments)
                }
            })
            .catch((error) => {
                console.error('Error copying message:', error);
                bot.sendMessage(from, 'Error copying message. Скорее всего вы отправили неправильную ссылку добавляя кнопки.');
            });
    }else{
        bot.forwardMessage(destination, from, postObject.postId, {reply_markup: inlineKeyboard})
            .then((copiedMessage) => {
                let copiedMessageId = copiedMessage.message_id
                if (postObject.autoDeleteHours) {
                    let now = new Date();
                    HangAutoDelete(postObject.autoDeleteHours, copiedMessageId, Channels.indexOf(postObject.channelId), now.getTime())
                }
                console.log(postObject)
                if (postObject.commentsAreClosed) {
                    CloseComments.push(copiedMessageId)
                    console.log(postObject.forwardFrom)
                }
            })
            .catch((error) => {
                console.error('Error copying message:', error);
                bot.sendMessage(from, 'Error copying message. Скорее всего вы отправили неправильную ссылку добавляя кнопки.');
            });
    }
}
const HangAutoDelete = (time,postId,channelId,wasPostedOn) => {
    let EditedPosts=postsData
    let deleteRequest={
        time:time,
        postId:postId,
        channelId:channelId,
        wasPostedOn:wasPostedOn,
        mustBeDeletedAt:wasPostedOn+(3600000*time)
    }
    console.log(EditedPosts)
    EditedPosts.deleteRequests[channelId].push(deleteRequest)
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
}
const DeleteFromAutoDelete = (deleteObject,index) => {
    let EditedPosts=postsData
    DeleteMessage(Channels[deleteObject.channelId],deleteObject.postId)
    EditedPosts.deleteRequests[deleteObject.channelId].splice(index,1)
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
}
const DeleteMessage = (chatId,postId) =>{
    bot.deleteMessage(chatId,postId)
       console.log("delit otrabotal")

}
const CheckIfYouCanPost = (month, day, hours, minutes, chatId, channelIndex) =>{
    let nowS = new Date()
    let requestedDate=new Date(nowS.getFullYear(),month,day,hours,minutes,0)
    let bool=false
    let cellWithRequestedDay=ModeratorsAll[Channels.indexOf(channelIndex)][requestedDate.getDay()]
    if(AdminsLocal[Channels.indexOf(channelIndex)].indexOf(chatId)!==-1||AdminsIdGlobal.indexOf(chatId)!==-1){bool=true}
    for(let i=0;i<cellWithRequestedDay.length;i++){
        if(cellWithRequestedDay[i].moderId==chatId){
            if(hours>=cellWithRequestedDay[i].startHour&&hours<cellWithRequestedDay[i].endHour){
                bool=true
            }
        }
    }
        return bool
}

//команды для бота

bot.onText(/\/CheckMyId/, (msg) => {
    const resp = msg.from.first_name + "  " + msg.from.id;
    bot.sendMessage(msg.chat.id, resp);
});
bot.onText(/\/time/, (msg) => {
    bot.sendMessage(msg.chat.id, Date().toString());
});
bot.onText(/\/workingModerators/, (msg) => {
    bot.sendMessage(msg.chat.id, WorkingModerators.toString());
});
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "\nДОБАВВЛЕНИЕ/УДАЛЕНИЕ МОДЕРОВ\n /AddModer - добавить модератора \n /DeleteModerFull - удалить модератора из базы данных ПОЛНОСТЬЮ \n " +
        "/DeleteModerOneDay - удалить модератора из базы данных в выбраный день \nДЛЯ АДМИНОВ\n /workingModerators список модераторов работающих сейчас" +
        "\n /AddManagerToChannel добавить менеджера с правами добавлять и удалять модераторов из базы данных в выбранном канале \n /DeleteDelayedPostsById удалить из отложки все посты от модера с этим Id \n /AddLocalAdminToChannel добавить локального админа, открыть все возможности пользователю в ОДНОМ КАНАЛЕ" +
        "\n /AddChannel добавить бота в новый канал \n /DeleteManagerToChannel удалить менеджера \n /DeleteLocalAdmin удалить менеджера \n /DeleteChannel отвязать бота от выбраного канала\nОБЩИЕ КОМАНДЫ \n /CheckMyId - получить id \n/time - посмотреть время на сервере \n " );
});
bot.onText(/\/AddModer/, (msg) => {

        bot.sendMessage(msg.chat.id, "Выберите канал в который вы хотите добавить нового модератора", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
});
bot.onText(/\/DeleteModerFull/, (msg) => {
        bot.sendMessage(msg.chat.id, "Напишите ID канала из которого вы хотите ПОЛНОСТЬЮ УДАЛИТЬ модератора во все дни недели", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
});
bot.onText(/\/DeleteModerOneDay/, (msg) => {
        bot.sendMessage(msg.chat.id, "Напишите ID канала из которого вы хотите удалить модератора в выбранный день недели", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
});
bot.onText(/\/AddManagerToChannel/, (msg) => {
        bot.sendMessage(msg.chat.id, "Выберите канал в который вы хотите добавить МЕНЕДЖЕРА", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
});
bot.onText(/\/AddLocalAdminToChannel/, (msg) => {
    if(AdminsIdGlobal.indexOf(msg.from.id)===-1){
        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только ХОЗЯИН ЭТОГО БОТА может назначать админов в каналы");
    }
    else{
        bot.sendMessage(msg.chat.id, "Выберите канал в который вы хотите добавить ЛОКАЛЬНОГО АДМИНА", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
    }
});
bot.onText(/\/AddChannel/, (msg) => {
    if(AdminsIdGlobal.indexOf(msg.from.id)===-1){
        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только ХОЗЯИН ЭТОГО БОТА может добавлять бота в новые каналы в каналы");
    }
    else{
        bot.sendMessage(msg.chat.id, "Напишите Id канала в формате @name", { reply_markup: { force_reply: true } });
    }
});
bot.onText(/\/DeleteManagerToChannel/, (msg) => {
    bot.sendMessage(msg.chat.id, "Выберите канал из которого вы хотите удалить МЕНЕДЖЕРА", { reply_markup: { force_reply: true } });
    bot.sendMessage(msg.chat.id, " "+channelsString);
});
bot.onText(/\/DeleteLocalAdmin/, (msg) => {
    if(AdminsIdGlobal.indexOf(msg.from.id)===-1){
        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только ХОЗЯИН ЭТОГО БОТА может назначать админов в каналы");
    }
    else{
        bot.sendMessage(msg.chat.id, "Выберите канал из которого вы хотите добавить ЛОКАЛЬНОГО АДМИНА", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
    }
});
bot.onText(/\/DeleteChannel/, (msg) => {
    if(AdminsIdGlobal.indexOf(msg.from.id)===-1){
        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только ХОЗЯИН ЭТОГО БОТА может управлять каналами");
    }
    else{
        bot.sendMessage(msg.chat.id, "ВАЖНО, отвязывая бота от канала вы удаляете всю базу данных к нему, включая информацию о расписании модераторов и админ права в нем ");
        bot.sendMessage(msg.chat.id, "Выберите номер канала который вы хотели бы удалить", { reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, " "+channelsString);
    }
});
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const initialKeyboard = {
        inline_keyboard: [
            [{ text: 'Создать пост', callback_data: 'create' }],
            [{ text: 'Сделать репост', callback_data: 'repost' }],
        ]
    };

    bot.sendMessage(chatId, 'Нажмите на кнопку чтоб создать пост', {
        reply_markup: initialKeyboard
    });
});
bot.onText(/\/DeleteDelayedPostsById/, (msg) => {
    if(AdminsIdGlobal.indexOf(msg.from.id)===-1){
        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только ХОЗЯИН ЭТОГО БОТА может удалить все сообщения от пользователя");
    }
    else{
        bot.sendMessage(msg.chat.id, "Напишите ID человека все посты которого нужно удалить из отложки", { reply_markup: { force_reply: true } });
    }
});
//обработка колбеков
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const buttonData = query.data;
    let responseText;
    let replyMarkup;
    let index;
    let nowS = new Date()
    switch (buttonData) {

        case 'create':
            responseText = 'Выберите канал на который вы хотите создать пост';
            replyMarkup = {
                inline_keyboard: channelsButtonList
            };
            let thisPost= {
                "type":"create",
                "moderId":chatId,
                "buttonName":[],
                "buttonUrl":[],
            }
            index = PostQue.findIndex(el => el.moderId === chatId);
            if(index===-1){
                PostQue.push(thisPost)
            }else{
                PostQue[index]=thisPost
            }
            break;
        case 'repost':
            responseText = 'Выберите канал на который вы хотите отправить репост';
            replyMarkup = {
                inline_keyboard: channelsButtonList
            };

            index = PostQue.findIndex(el => el.moderId === chatId);
            if(index===-1){
                PostQue.push( {
                    "type":"repost",
                    "moderId":chatId,
                    "buttonName":[],
                    "buttonUrl":[],
                })
            }else{
                PostQue[index]={
                    "type":"repost",
                    "moderId":chatId,
                    "buttonName":[],
                    "buttonUrl":[],
                }
            }
            let index2 = RePostQue.findIndex(el => el.moderId === chatId);
            if(index2===-1) {
                RePostQue.push({"moderId": chatId})
            }else{
                RePostQue[index2]={"moderId": chatId}
            }
            break;
        case 'autoDelete':
            responseText = 'Выберите через сколько нужно будет удалить сообщенеи';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: '12 часов', callback_data: '12h' }],
                    [{ text: '24 часов', callback_data: '24h' }],
                    [{ text: '48 часов', callback_data: '48h' }],
                    [{ text: 'Выбрать свое время (не более 48 часов)', callback_data: 'customhours' }],
                ]
            };
            break;
        case 'noComments':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].commentsAreClosed=true
            responseText = 'Комментарии под постом будут недоступны';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                    [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                    [{ text: 'Убрать комментарии', callback_data: 'returnComments' }],
                    [{ text: 'Продолжить', callback_data: 'continue' }]
                ]
            };
            break;
        case 'returnComments':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].commentsAreClosed=false
            responseText = 'Комментарии под постом снова доступны';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                    [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                    [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                    [{ text: 'Продолжить', callback_data: 'continue' }]
                ]
            };
            break;
        case '12h':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].autoDeleteHours=12
            responseText = 'Пост будет автоматически удален через 12 часов';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                    [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                    [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                    [{ text: 'Продолжить', callback_data: 'continue' }]
                ]
            };
            break;
        case '24h':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].autoDeleteHours=24
            responseText = 'Пост будет автоматически удален через 24 часа';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                    [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                    [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                    [{ text: 'Продолжить', callback_data: 'continue' }]
                ]
            };
            break;
        case '48h':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].autoDeleteHours=47.9
            responseText = 'Пост будет автоматически удален через 48 часа';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                    [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                    [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                    [{ text: 'Продолжить', callback_data: 'continue' }]
                ]
            };
            break;
        case 'customhours':
            responseText = 'ВНИМАНИЕ в документации telegram bot API написано что бот не может удалять сообщения запощенные более чем 48 часов назад';
            bot.sendMessage(chatId,"Напишите через сколько часов удалить пост, минуты можно указать дробным числом", {reply_markup: {force_reply: true}});
            replyMarkup = {
                inline_keyboard: [

                ]
            };
            break;
        case 'continue':
            index = PostQue.findIndex(el => el.moderId === chatId);
            responseText = 'Пост готов, отправить его сейчас либо отложить отправку?';
            replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Сейчас', callback_data: 'now' }],
                    [{ text: 'Сегодня', callback_data: 'today' }],
                    [{ text: 'Завтра', callback_data: 'nextDay' }],
                    [{ text: 'Послезавтра', callback_data: 'nextNextDay' }],
                    [{ text: 'Выбрать свою дату', callback_data: 'custom' }],
                ]
            };
            break;
        case 'addButton':
            responseText = 'Меню добавления кнопки';
            replyMarkup = {
                inline_keyboard: [],
            };
            bot.sendMessage(chatId, "Напишите название кнопки", {reply_markup: {force_reply: true}});
            break;
        case 'now':
            index = PostQue.findIndex(el => el.moderId === chatId);
            let channelIndex = PostQue[index].channelId
            if(CheckIfYouCanPost(nowS.getMonth(),nowS.getDate(),nowS.getHours(),nowS.getMinutes(),query.from.id,channelIndex)){
            responseText = ' Пост отправлен, чтоб создать новый пропишите /start';
            replyMarkup = {
                inline_keyboard: [

                ]
            };
            CopyPost(chatId,channelIndex,PostQue[index])
            }else{
                responseText = 'В данный момент вы не можете выложить пост на этом канале, попробуйте другое время либо другой канал';
                replyMarkup = {
                    inline_keyboard: [
                        [{ text: 'Сейчас', callback_data: 'now' }],
                        [{ text: 'Сегодня', callback_data: 'today' }],
                        [{ text: 'Завтра', callback_data: 'nextDay' }],
                        [{ text: 'Послезавтра', callback_data: 'nextNextDay' }],
                        [{ text: 'Выбрать свою дату', callback_data: 'custom' }],
                    ]
                };
            }
            break;
        case 'today':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].dayPost=nowS.getDate()
            PostQue[index].monthPost=nowS.getMonth()
            responseText = 'Вы выбрали сегодняшний день '+nowS.getDate()+" число "+(nowS.getMonth()+1)+" месяц";
            replyMarkup = {
                inline_keyboard: [],
            };
            bot.sendMessage(chatId, "Напишите в котором часу опубликовать пост (двухзначное/однозначное число без разделителей)", {reply_markup: {force_reply: true}});
            break;
        case 'nextDay':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].dayPost=(nowS.getDate()+1)
            PostQue[index].monthPost=nowS.getMonth()
            responseText = 'Вы выбрали завтрашний день '+(nowS.getDate()+1)+" число "+(nowS.getMonth()+1)+" месяц";
            replyMarkup = {
                inline_keyboard: [],
            };
            bot.sendMessage(chatId, "Напишите в котором часу опубликовать пост (двухзначное/однозначное число без разделителей)", {reply_markup: {force_reply: true}});
            break;
        case 'nextNextDay':
            index = PostQue.findIndex(el => el.moderId === chatId);
            PostQue[index].dayPost=(nowS.getDate()+2)
            PostQue[index].monthPost=nowS.getMonth()

            responseText = 'Вы выбрали день послезавтра '+(nowS.getDate()+2)+" число "+(nowS.getMonth()+1)+" месяц";
            replyMarkup = {
                inline_keyboard: [],
            };
            bot.sendMessage(chatId, "Напишите в котором часу опубликовать пост (двухзначное/однозначное число без разделителей)", {reply_markup: {force_reply: true}});
            break;
        case 'custom':
            responseText = "Вы выбрали задать свою дату";
            replyMarkup = {
                inline_keyboard: [],
            };
            bot.sendMessage(chatId, "Напишите день когда хотите опубликовать пост (двухзначное/однозначное число без разделителей)", {reply_markup: {force_reply: true}});
            break;
        default:
            if(Channels.indexOf(buttonData)!==-1) {
                responseText = "Вы выбрали канал " + buttonData;
                replyMarkup = {
                    inline_keyboard: []

                };
                index = PostQue.findIndex(el => el.moderId === chatId);
                PostQue[index].channelId=buttonData
                if( PostQue[index].type==="create"){
                    bot.sendMessage(chatId, "Отправьте свой пост ответом на это сообщение", {reply_markup: {force_reply: true}});
                }else{
                    bot.sendMessage(chatId, "Перешлите сообщение, репост которого вы хотить сделать");
                }
            }
            break;
    }

    bot.editMessageText(responseText, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
    });
});
//команды для бота с реплаем
let newChannelId
bot.on('message', (msg) => {

    if(CloseComments.indexOf(msg.forward_from_message_id)!==-1){//нужно для удаления комментов
        let channelIndex="@"+msg.sender_chat.username
        DeleteMessage(CommentsChannel[Channels.indexOf(channelIndex)],msg.message_id)
        CloseComments.splice(CommentsChannel[Channels.indexOf(channelIndex)],1)
    }
    console.log(msg.forward_date)
    if(msg.forward_date){
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
            if(index!==-1&&PostQue[index].type==="repost"){
                PostQue[index].postId=msg.message_id
                PostQue[index].forwardFrom=msg.forward_from_message_id
                const initialKeyboard = {
                    inline_keyboard: [
                        [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                        [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                        [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                        [{ text: 'Продолжить', callback_data: 'continue' }]
                    ]
                };
                bot.sendMessage(msg.chat.id, `Вы можете редактировать/удалить пост просто отредактировав свое сообщение выше, теперь выберите дополнительные настройки для этого поста и нажмите "Продолжить"`,{reply_markup: initialKeyboard})
            }

    }

    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите канал в который вы хотите добавить нового модератора") {
        if(parseInt(msg.text,10)<AdminsLocal.length) {
            if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1||AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
                let addModerModer= new newModerator(msg.chat.id)
                if(ModerQue.findIndex(el => el.adminId === msg.chat.id)===-1){
                    ModerQue.push(addModerModer)}
                bot.sendMessage(msg.chat.id, `Напишите ID нового модератора в формате 1111111111`, {reply_markup: {force_reply: true}});
                let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
                ModerQue[index].channelId = msg.text
            } else {
                bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
            }
        } else{
            bot.sendMessage(msg.chat.id, "ОШИБКА, группы с данным индексом не существует");
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID нового модератора в формате 1111111111") {
        bot.sendMessage(msg.chat.id, `Напишите уникальное имя нового модератора`,{ reply_markup: { force_reply: true } });
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].moderId=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID человека все посты которого нужно удалить из отложки") {
        DatabaseDeleteAllPostsFrom(msg.text,msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите уникальное имя нового модератора" ) {
        bot.sendMessage(msg.chat.id, `Напишите день недели в который будет работать новый модератор`,{ reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, ` 0 - Воскресение \n 1 - Понедельник \n 2 - Вторник \n 3 - Среда \n 4 - Четверг \n 5 - Пятница  \n 6 - Суббота`);
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].name=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите день недели в который будет работать новый модератор") {
        bot.sendMessage(msg.chat.id, `Напишите час в котором будет НАЧИНАТЬ работать новый модератор`,{ reply_markup: { force_reply: true } });
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].workingDay=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите час в котором будет НАЧИНАТЬ работать новый модератор") {
        bot.sendMessage(msg.chat.id, `Напишите час в котором будет ЗАКАНЧИВАТЬ работать новый модератор`,{ reply_markup: { force_reply: true } });
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].startHour=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите час в котором будет ЗАКАНЧИВАТЬ работать новый модератор") {
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].endHour=msg.text
        ModerQue[index].indexName=`${ModerQue[index].channelId}_${ModerQue[index].moderId}_${ ModerQue[index].name}_${ModerQue[index].workingDay}_${ModerQue[index].startHour}_${ModerQue[index].endHour}`
        if(parseInt(ModerQue[index].startHour)>=parseInt(msg.text)){
            bot.sendMessage(msg.chat.id, `ОШИБКА, время начала работы не может быть больше времени конца \n Если вы хотите добавить модератора. работающего до полуночи и после
             - добавте его 2 раза указав концом работы 24, а началом - 0`);
        }else {
            bot.sendMessage(msg.chat.id, `${ModerQue[index].channelId},\n${ModerQue[index].moderId},\n${ModerQue[index].name},\n${ModerQue[index].workingDay},\n${ModerQue[index].startHour},\n${ModerQue[index].endHour}`);
            bot.sendMessage(msg.chat.id, `Если все данные заполнены правильно напишите ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если все данные заполнены правильно напишите ответьте на это сообщение любым символом") {
        CreateNewModerator(msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите канал в который вы хотите добавить МЕНЕДЖЕРА") {
        if(AdminsLocal[msg.text].indexOf(msg.from.id)===-1){
            bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только админы В ЭТОМ БОТЕ могут добавлять менеджеров");
        }
        else {
            let thisManager= {
                "adminId":msg.from.id,
                "channelId":msg.text
            }
            ManagerQue.push(thisManager)
            bot.sendMessage(msg.chat.id, "Напишите ID нового менеджера в формате 1111111111", {reply_markup: {force_reply: true}});
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID нового менеджера в формате 1111111111") {
        let index = ManagerQue.findIndex(el => el.adminId === msg.chat.id);
        ManagerQue[index].managerId=msg.text
        bot.sendMessage(msg.chat.id, `${ManagerQue[index].channelId},\n ${ManagerQue[index].managerId}`);
        bot.sendMessage(msg.chat.id, `Если все данные менеджера заполнены правильно напишите ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });

    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если все данные менеджера заполнены правильно напишите ответьте на это сообщение любым символом") {
        CreateNewManager(msg.chat.id)
    }//442
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите через сколько часов удалить пост, минуты можно указать дробным числом") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].autoDeleteHours=msg.text
        const initialKeyboard = {
            inline_keyboard: [
                [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                [{ text: 'Продолжить', callback_data: 'continue' }]
            ]
        };
        bot.sendMessage(msg.chat.id, `Пост будет автоматически удален через `+msg.text+`  часов`,{reply_markup: initialKeyboard})
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Отправьте свой пост ответом на это сообщение") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].postId=msg.message_id
        const initialKeyboard = {
            inline_keyboard: [
                [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                [{ text: 'Продолжить', callback_data: 'continue' }]
            ]
        };
        bot.sendMessage(msg.chat.id, `Вы можете редактировать/удалить пост просто отредактировав свое сообщение выше, теперь выберите дополнительные настройки для этого поста и нажмите "Продолжить"`,{reply_markup: initialKeyboard})
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите название кнопки") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].buttonName.push(msg.text)
        bot.sendMessage(msg.chat.id, `Отправте ссылку по которой кнопка должна активировать переход`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Отправте ссылку по которой кнопка должна активировать переход") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].buttonUrl.push(msg.text)
        const initialKeyboard = {
            inline_keyboard: [
                [{ text: 'Добавить кнопки', callback_data: 'addButton' }],
                [{ text: 'Повесить автоудаление', callback_data: 'autoDelete' }],
                [{ text: 'Убрать комментарии', callback_data: 'noComments' }],
                [{ text: 'Продолжить', callback_data: 'continue' }]
            ]
        };
        CopyPost(msg.chat.id,msg.chat.id,PostQue[index])
        bot.sendMessage(msg.chat.id, `Ваш пост сейчас выглядит так`,{reply_markup: initialKeyboard});

    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите в котором часу опубликовать пост (двухзначное/однозначное число без разделителей)") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].hoursPost=Number(msg.text)
        bot.sendMessage(msg.chat.id, `Напишите минуты, в которые нужно опубликовать пост (двухзначное/однозначное число без разделителей)`,{ reply_markup: { force_reply: true } });

    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите минуты, в которые нужно опубликовать пост (двухзначное/однозначное число без разделителей)") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        let nowS = new Date();
        PostQue[index].yearPost = nowS.getFullYear()
        PostQue[index].minutesPost = Number(msg.text)
        let month = nowS.getMonth()
        let day = nowS.getDate()
        if (PostQue[index].monthPost) {
            month = PostQue[index].monthPost
        }
        if (PostQue[index].dayPost) {
            day = PostQue[index].dayPost
        }
        if (nowS > new Date(nowS.getFullYear(), month, day, PostQue[index].hoursPost, PostQue[index].minutesPost)) {
            bot.sendMessage(msg.chat.id, `Вы не можете отправить пост в отложку на время которое уже прошло, выберите другую дату либо вариат Сeйчас'`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Сейчас', callback_data: 'now'}],
                        [{text: 'Сегодня', callback_data: 'today'}],
                        [{text: 'Завтра', callback_data: 'nextDay'}],
                        [{text: 'Послезавтра', callback_data: 'nextNextDay'}],
                        [{text: 'Выбрать свою дату', callback_data: 'custom'}],
                    ]
                }
            })
        } else {
            if (CheckIfYouCanPost(month, day, PostQue[index].hoursPost, PostQue[index].minutesPost, msg.from.id, PostQue[index].channelId)) {
                CreateNewAwaitedPost(index, Channels.indexOf(PostQue[index].channelId))
                bot.sendMessage(msg.chat.id, `Пост успешно отложен, вы все еще можете редактировать его либо удалить) пропишите /start для создания следующего поста`);
            } else {
                bot.sendMessage(msg.chat.id, `Вы не можете выложить пост на этом канале в указанное время, попробуйте другое время либо другой канал'`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Сейчас', callback_data: 'now'}],
                            [{text: 'Сегодня', callback_data: 'today'}],
                            [{text: 'Завтра', callback_data: 'nextDay'}],
                            [{text: 'Послезавтра', callback_data: 'nextNextDay'}],
                            [{text: 'Выбрать свою дату', callback_data: 'custom'}],
                        ]
                    }
                })
            }
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите день когда хотите опубликовать пост (двухзначное/однозначное число без разделителей)") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].dayPost=msg.text
        bot.sendMessage(msg.chat.id, `Напишите номер месяца, в которые нужно опубликовать пост (двухзначное/однозначное от 1 до 12)`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите номер месяца, в которые нужно опубликовать пост (двухзначное/однозначное от 1 до 12)") {
        let index = PostQue.findIndex(el => el.moderId === msg.chat.id);
        PostQue[index].monthPost=(msg.text-1)
        bot.sendMessage(msg.chat.id, `Напишите в котором часу опубликовать пост (двухзначное/однозначное число без разделителей)`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID канала из которого вы хотите ПОЛНОСТЬЮ УДАЛИТЬ модератора во все дни недели") {
        if(parseInt(msg.text,10)<AdminsLocal.length) {
            if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1||AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
                let addModerModer= new newModerator(msg.chat.id)
                if(ModerQue.findIndex(el => el.adminId === msg.chat.id)===-1){
                    ModerQue.push(addModerModer)}
                bot.sendMessage(msg.chat.id, `Напишите ID модератора которого вы хотите ПОЛНОСТЬЮ УДАЛИТЬ в формате 1111111111`, {reply_markup: {force_reply: true}});
                let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
                ModerQue[index].channelId = msg.text
            } else {
                bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
            }
        } else{
            bot.sendMessage(msg.chat.id, "ОШИБКА, группы с данным индексом не существует");
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID модератора которого вы хотите ПОЛНОСТЬЮ УДАЛИТЬ в формате 1111111111") {
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].moderId=msg.text
        bot.sendMessage(msg.chat.id, `Вы выбрали модератора с ID ${msg.text}`)
        bot.sendMessage(msg.chat.id, `Если действительно хотите ПОЛНОСТЬЮ УДАЛИТЬ этого модератора напишите ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если действительно хотите ПОЛНОСТЬЮ УДАЛИТЬ этого модератора напишите ответьте на это сообщение любым символом") {
        EditDatabaseDeleteModeratorByID(msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID канала из которого вы хотите удалить модератора в выбранный день недели") {
        if(parseInt(msg.text,10)<AdminsLocal.length) {
            if (AdminsLocal[msg.text].indexOf(msg.from.id) !== -1||AdminsManagers[msg.text].indexOf(msg.from.id) !== -1) {
                let addModerModer= new newModerator(msg.chat.id)
                if(ModerQue.findIndex(el => el.adminId === msg.chat.id)===-1){
                    ModerQue.push(addModerModer)}
                bot.sendMessage(msg.chat.id, `Напишите день в который вы хотите удалить модератора`,{ reply_markup: { force_reply: true } });
                let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
                ModerQue[index].channelId = msg.text
            } else {
                bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
            }
        } else{
            bot.sendMessage(msg.chat.id, "ОШИБКА, группы с данным индексом не существует");
        }

    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите день в который вы хотите удалить модератора") {
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].workingDay=msg.text
        bot.sendMessage(msg.chat.id, `Напишите ID модератора которого вы ходите удалить в выбраный день`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID модератора которого вы ходите удалить в выбраный день") {
        let index = ModerQue.findIndex(el => el.adminId === msg.chat.id);
        ModerQue[index].moderId=msg.text
        bot.sendMessage(msg.chat.id, `Если действительно хотите УДАЛИТЬ этого модератора В ЭТОТ ДЕНЬ напишите ответ на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если действительно хотите УДАЛИТЬ этого модератора В ЭТОТ ДЕНЬ напишите ответ на это сообщение любым символом") {
        EditDatabaseDeleteModeratorByDay(msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите канал в который вы хотите добавить ЛОКАЛЬНОГО АДМИНА") {
        newLocalAdminId=msg.text
        bot.sendMessage(msg.chat.id, `Напишите ID локального админа которого вы хотите добавить в выбраный канал`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID локального админа которого вы хотите добавить в выбраный канал") {
        bot.sendMessage(msg.chat.id, `Админ ${msg.text} добавлен на канал ${newLocalAdminId} и может назначать модераторов в нем`,{ reply_markup: { force_reply: true } });
        CreateNewLocalAdmin(msg.chat.id,msg.text)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите Id канала в формате @name") {
        newChannelId=msg.text.trim()
        bot.sendMessage(msg.chat.id, `Напишите ID чата для комментов, его можно узнать по ссылке, открыв группу в вебтелеграме, например у публичного чата https://web.telegram.org/k/#@VillageNGP
        ID = @VillageNGP у приватного чата https://web.telegram.org/k/#-1595692878 ID = -1595692878`);
        bot.sendMessage(msg.chat.id, `Если не планируете открывать/закрывать комментарии через бота можете написать 0 вместо ID чата`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если не планируете открывать/закрывать комментарии через бота можете написать 0 вместо ID чата") {
        let id
        if(msg.text[0]==="@"){
            id=msg.text
        }else{
            id=msg.text-1000000000000

        }
        CreateNewChannel(msg.chat.id,newChannelId,id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите канал из которого вы хотите удалить МЕНЕДЖЕРА") {
        if(AdminsLocal[msg.text].indexOf(msg.from.id)===-1){
            bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды, только админы В ЭТОМ БОТЕ могут добавлять менеджеров");
        }
        else {
            let thisManager= {
                "adminId":msg.from.id,
                "channelId":msg.text
            }
            ManagerQue.push(thisManager)
            bot.sendMessage(msg.chat.id, "Напишите ID  менеджера, которого хотите удалить в формате 1111111111", {reply_markup: {force_reply: true}});
        }
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID  менеджера, которого хотите удалить в формате 1111111111") {
        let index = ManagerQue.findIndex(el => el.adminId === msg.chat.id);
        ManagerQue[index].managerId=msg.text
        bot.sendMessage(msg.chat.id, `${ManagerQue[index].channelId},\n ${ManagerQue[index].managerId}`);
        bot.sendMessage(msg.chat.id, `Если действительно хотите удалить этого менеджера ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если действительно хотите удалить этого менеджера ответьте на это сообщение любым символом") {
        DeleteManagerById(msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите канал из которого вы хотите добавить ЛОКАЛЬНОГО АДМИНА") {
        newLocalAdminId=msg.text
        bot.sendMessage(msg.chat.id, `Напишите ID локального админа которого вы хотите удалить из выбранного канала`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID локального админа которого вы хотите удалить из выбранного канала") {
        bot.sendMessage(msg.chat.id, `Админ ${msg.text} удален с канала ${newLocalAdminId} и больше не может назначать модераторов в нем`,{ reply_markup: { force_reply: true } });
        DeleteNewLocalAdmin(msg.chat.id,msg.text)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Выберите номер канала который вы хотели бы удалить") {
        DeleteChannel(msg.chat.id,msg.text)
    }

});




