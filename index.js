const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
let data = require("./database.json");
const token = '5859957737:AAG7-GOtOc6qmZx4NPOiYu1PwxwMkSsc95U';

const bot = new TelegramBot(token, {polling: true});
let AdminsIdGlobal=data.adminsAbsolute
let AdminsId=[1111111111,2222222222,650051224]
let ModeratorsAll= data.days
let Channels= data.channels
let AdminsLocal= data.adminsLocal
let AdminsManagers= data.adminsManagers

let channelsString=""

let ManagerQue=[]
let ModerQue=[]
let WorkingModerators=[]

let timerId = setInterval(() => CheckDateAndTime(), 180000);
let currentDay
let currentHour

fs.readFile('database.json', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("database.json connected");
    }
})//проверяет каждую минуту состояние модераторов в этот день
const CheckDateAndTime= () => {
    let now = new Date();
    currentDay=now.getDay()
    currentHour=now.getHours()
    for(let j=0;j<ModeratorsAll.length;j++) {
        let Moderators=ModeratorsAll[j]
        let channelName = Channels[j]
        for (let i = 0; i < Moderators[currentDay].length; i++) {
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
    for(let i = 0; i < Channels.length; i++){
        channelsString+=i+" - "+Channels[i]+" \n"
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
const CreateNewChannel = (chatId,channelName) => {
    let EditedModerators=data
    EditedModerators.channels.push(channelName)
    EditedModerators.adminsLocal.push(AdminsIdGlobal)
    EditedModerators.adminsManagers.push([])
    EditedModerators.days.push([[],[],[],[],[],[],[]])
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    bot.sendMessage(chatId, `Новый канал успешно добавлен на сервер`);
    ChannelsString()
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
    EditedModerators.channels.splice(channelName,1)
    EditedModerators.adminsLocal.splice(channelName,1)
    EditedModerators.adminsManagers.splice(channelName,1)
    EditedModerators.days.splice(channelName,1)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    bot.sendMessage(chatId, `Данный канал успешно удален`);
    ChannelsString()
}
let newLocalAdminId
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
        "\n /AddManagerToChannel добавить менеджера с правами добавлять и удалять модераторов из базы данных в выбранном канале \n /AddLocalAdminToChannel добавить локального админа, открыть все возможности пользователю в ОДНОМ КАНАЛЕ" +
        "\n /AddChannel добавить бота в новый канал \n /DeleteManagerToChannel удалить менеджера \n /DeleteLocalAdmin удалить менеджера \n /DeleteChannel отвязать бота от выбраного канала\nОБЩИЕ КОМАНДЫ \n /CheckMyId - получить id \n/time - посмотреть время на сервере \n  ");
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
//команды для бота с реплаем

bot.on('message', (msg) => {
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
        CreateNewChannel(msg.chat.id,msg.text.trim())
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




