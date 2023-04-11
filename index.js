const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
let data = require("./database.json");
const token = '5859957737:AAG7-GOtOc6qmZx4NPOiYu1PwxwMkSsc95U';

const bot = new TelegramBot(token, {polling: true});

let AdminsId=[1111111111,2222222222,650051224]
let Moderators= data.days

let WorkingModerators=[]
let timerId = setInterval(() => CheckDateAndTime(), 60000);
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
    for(let i=0;i<Moderators[currentDay].length;i++){
        if(currentHour>=Moderators[currentDay][i].startHours&&currentHour<Moderators[currentDay][i].endHours){
           // console.log("moder with id "+Moderators[currentDay][i].id+" is working now")
            if(WorkingModerators.indexOf(Moderators[currentDay][i].indexName)===-1){

                WorkingModerators.push(Moderators[currentDay][i].indexName)
                bot.promoteChatMember("@sexreceiver", Moderators[currentDay][i].id, {
                    can_change_info: false,
                    can_post_messages: true,
                    can_edit_messages: true,
                    can_delete_messages: true,
                    can_invite_users: false,
                    can_restrict_members: false,
                    can_pin_messages: false,
                    can_promote_members: false,
                }).then(() => {
                    console.log('User '+Moderators[currentDay][i].indexName+' promoted successfully')
                }).catch((error) => {
                    console.error('Error promoting user:', error)
                });
            }else{}
        }
        else{
          //  console.log("moder with id "+Moderators[currentDay][i].id+" isnt working now")
            if(WorkingModerators.indexOf(Moderators[currentDay][i].indexName)!==-1){
                WorkingModerators.splice(WorkingModerators.indexOf(Moderators[currentDay][i].indexName),1)
                bot.promoteChatMember("@sexreceiver", Moderators[currentDay][i].id, {
                    can_change_info: false,
                    can_post_messages: false,
                    can_edit_messages: false,
                    can_delete_messages: false,
                    can_invite_users: false,
                    can_restrict_members: false,
                    can_pin_messages: false,
                    can_promote_members: false,
                }).then(() => {
                    console.log('User '+Moderators[currentDay][i].indexName+' demoted successfully')
                }).catch((error) => {
                    console.error('Error promoting user:', error)
                });
            }
        }
    }
    console.log(WorkingModerators)

}

//добавление/удаление в бд

const EditDatabaseAddModerator = (day,newModerator,chat) => {
    let EditedModerators=data
    EditedModerators.days[day].push(newModerator)
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators

        }
    })
    bot.sendMessage(chat, `Новый модератор успешно добавлен на сервер`);
}
const CreateNewModerator = (ModerId,ModerName,ModerWorkingDay,ModerStartHour,ModerEndHour,IndexName,chat) => {
    let newModerator = {
        "id": ModerId,
        "name": ModerName,
        "startHours": ModerStartHour,
        "endHours": ModerEndHour,
        "indexName": IndexName,
        "workingDay": ModerWorkingDay
    };
    EditDatabaseAddModerator(ModerWorkingDay,newModerator,chat)
}
const EditDatabaseDeleteModeratorByID = (ModerID,chat) => {
    let EditedModerators=data
    for(let i =0;i<7;i++){
        bot.promoteChatMember("@sexreceiver", ModerID, {
            can_change_info: false,
            can_post_messages: false,
            can_edit_messages: false,
            can_delete_messages: false,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_promote_members: false,
        }).then(() => {
            console.log('User demoted successfully')
        }).catch((error) => {
            console.error('Error promoting user:', error)
        });
        let index = EditedModerators.days[i].findIndex(obj => obj.id === ModerID);
        if(index!==-1){
            console.log(i)
            EditedModerators.days[i].splice(index,1)
        }

    }
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators

        }
    })
    bot.sendMessage(chat, `Модератор с ID ${ModerID} полностью удален из базы данных`)
}
const EditDatabaseDeleteModeratorByDay = (day,ModerID,chat) => {
    let EditedModerators=data
        bot.promoteChatMember("@sexreceiver", ModerID, {
            can_change_info: false,
            can_post_messages: false,
            can_edit_messages: false,
            can_delete_messages: false,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_promote_members: false,
        }).then(() => {
            console.log('User demoted successfully')
        }).catch((error) => {
            console.error('Error promoting user:', error)
        });
        let index = EditedModerators.days[day].findIndex(obj => obj.id === ModerID);
        if(index!==-1){
            EditedModerators.days[day].splice(index,1)
        }
    fs.writeFile('database.json', JSON.stringify(EditedModerators), err => {
        if (err) {
            console.error(err);
        } else {
            data=EditedModerators
        }
    })
    bot.sendMessage(chat, `Модератор с ID ${ModerID} был удален из базы данных в день${day}`)
}

let newModerId
let newModerName
let newModerWorkingDay
let newModerStartHour
let newModerEndHour
let newModerIndexName

let DeleteEverywhereID
let DeleteOneDayID
let DeleteOneDayDay

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
    bot.sendMessage(msg.chat.id, "\n /CheckMyId - получить id \n /AddModer - добавить модератора \n /DeleteModerFull - удалить модератора из базы данных ПОЛНОСТЬЮ \n " +
        "/DeleteModerOneDay - удалить модератора из базы данных в выбраный день \n /time - посмотреть время на сервере \n /workingModerators список модераторов работающих сейчас");
});
bot.onText(/\/AddModer/, (msg) => {

    if(AdminsId.indexOf(msg.from.id)===-1){

        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
        }
    else{

        bot.sendMessage(msg.chat.id, "Напишите ID нового модератора в формате 1111111111", { reply_markup: { force_reply: true } });
    }
});
bot.onText(/\/DeleteModerFull/, (msg) => {

    if(AdminsId.indexOf(msg.from.id)===-1){

        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
    }
    else{
        bot.sendMessage(msg.chat.id, "Напишите ID модератора которого хотите ПОЛНОСТЬЮ УДАЛИТЬ во все дни недели", { reply_markup: { force_reply: true } });
    }
});
bot.onText(/\/DeleteModerOneDay/, (msg) => {

    if(AdminsId.indexOf(msg.from.id)===-1){

        bot.sendMessage(msg.chat.id, "У вас недостаточно прав для использования этой команды,обратитесь к админу");
    }
    else{
        bot.sendMessage(msg.chat.id, "Напишите день в который вы хотите удалить модератора", { reply_markup: { force_reply: true } });
    }
});

//команды для бота с реплаем

bot.on('message', (msg) => {
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID нового модератора в формате 1111111111") {
        bot.sendMessage(msg.chat.id, `Напишите уникальное имя нового модератора`,{ reply_markup: { force_reply: true } });
        newModerId=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите уникальное имя нового модератора" ) {
        bot.sendMessage(msg.chat.id, `Напишите день недели в который будет работать новый модератор`,{ reply_markup: { force_reply: true } });
        bot.sendMessage(msg.chat.id, ` 0 - Воскресение \n 1 - Понедельник \n 2 - Вторник \n 3 - Среда \n 4 - Четверг \n 5 - Пятница  \n 6 - Суббота`);
        newModerName=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите день недели в который будет работать новый модератор") {
        bot.sendMessage(msg.chat.id, `Напишите час в котором будет НАЧИНАТЬ работать новый модератор`,{ reply_markup: { force_reply: true } });
        newModerWorkingDay=msg.text
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите час в котором будет НАЧИНАТЬ работать новый модератор") {
        newModerStartHour=msg.text
        bot.sendMessage(msg.chat.id, `Напишите час в котором будет ЗАКАНЧИВАТЬ работать новый модератор`,{ reply_markup: { force_reply: true } });

    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите час в котором будет ЗАКАНЧИВАТЬ работать новый модератор") {
        newModerEndHour=msg.text
        newModerIndexName=`${newModerId}_${newModerName}_${newModerWorkingDay}_${newModerStartHour}_${newModerEndHour}`
        if(parseInt(newModerStartHour)>=parseInt(msg.text)){
            bot.sendMessage(msg.chat.id, `ОШИБКА, время начала работы не может быть больше времени конца \n Если вы хотите добавить модератора. работающего до полуночи и после
             - добавте его 2 раза указав концом работы 24, а началом - 0`);
        }else {
            bot.sendMessage(msg.chat.id, `${newModerId},\n${newModerName},\n${newModerWorkingDay},\n${newModerStartHour},\n${newModerEndHour}`);
            bot.sendMessage(msg.chat.id, `Если все данные заполнены правильно напишите ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });

        }

    }

    if (msg.reply_to_message && msg.reply_to_message.text === "Если все данные заполнены правильно напишите ответьте на это сообщение любым символом") {

        CreateNewModerator(newModerId,
         newModerName,
         newModerWorkingDay,
         newModerStartHour,
         newModerEndHour,
         newModerIndexName,
            msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID модератора которого хотите ПОЛНОСТЬЮ УДАЛИТЬ во все дни недели") {
        DeleteEverywhereID=msg.text
        bot.sendMessage(msg.chat.id, `Вы выбрали модератора с ID ${DeleteEverywhereID}`)
        bot.sendMessage(msg.chat.id, `Если действительно хотите ПОЛНОСТЬЮ УДАЛИТЬ этого модератора напишите ответьте на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если действительно хотите ПОЛНОСТЬЮ УДАЛИТЬ этого модератора напишите ответьте на это сообщение любым символом") {
        EditDatabaseDeleteModeratorByID(DeleteEverywhereID,msg.chat.id)
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите день в который вы хотите удалить модератора") {
        DeleteOneDayDay=msg.text
        bot.sendMessage(msg.chat.id, `Напишите ID модератора которого вы ходите удалить в выбраный день`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Напишите ID модератора которого вы ходите удалить в выбраный день") {
        DeleteOneDayID=msg.text
        bot.sendMessage(msg.chat.id, `Если действительно хотите УДАЛИТЬ этого модератора В ЭТОТ ДЕНЬ напишите ответ на это сообщение любым символом`,{ reply_markup: { force_reply: true } });
    }
    if (msg.reply_to_message && msg.reply_to_message.text === "Если действительно хотите УДАЛИТЬ этого модератора В ЭТОТ ДЕНЬ напишите ответ на это сообщение любым символом") {
        EditDatabaseDeleteModeratorByDay(DeleteOneDayDay,DeleteOneDayID,msg.chat.id)
    }
});



