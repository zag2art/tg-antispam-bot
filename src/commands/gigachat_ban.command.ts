import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";
import { IConfigInterface } from "../config/config.interface";
import { GigaChat } from 'gigachat-node';
import prompt from "./prompt";

export class GigachatBanCommand extends Command {
  messageNumber: number;
  client: any;

  constructor(public bot: Telegraf<IBotContext>, readonly configService: IConfigInterface) {
    super(bot, configService)
    this.messageNumber = Number(configService.get('MESSAGE_NUMBER'));
    this.client = new GigaChat(configService.get('GIGACHAT_AUTH'), true, true, true);
    this.client.createToken().catch((err: any) => {
      console.log('Error, was not able to create a token:', err.message);
    });
  }

  async isMessageSpam(message: string): Promise<boolean> {
    const responce = await this.client.completion({
      "model":"GigaChat:latest",
      "messages": [
        {
          role:"system",
          content: prompt
        },
        {
          role:"user",
          content: message
        }
      ]
    })
  
    console.log(JSON.stringify(responce, null, 2))
  
    return responce.choices[0].message.content === 'true'    
  }

  handle(): void {

    this.bot.on(message("text"), async (ctx, next) => {
      console.log('text', ctx.text);
      // игнорируем всех юзеров, которые заджойнились
      // до того, как мы запустили бот в группе
      if (!ctx.session.joined) {
        //console.log('joined')
        return;
      }

      const {messageIds = []} = ctx.session;

      messageIds.push(ctx.message.message_id);

      // проверяем второе (по умолчанию) сообщение
      // задается в .env файле
      // console.log('messageIds.length === this.messageNumber', messageIds.length === this.messageNumber);
      if (messageIds.length === this.messageNumber) {

        if (await this.isMessageSpam(ctx.text)) {
          const userId = ctx.message.from.id;
          // бенем юзера, удаляя у него историю
          ctx.telegram.banChatMember(ctx.message.chat.id, userId, undefined, {
            revoke_messages: true
          });
          // удаляем все его сообщения
          ctx.deleteMessages(messageIds);
          
          const userName = ctx.message.from.first_name;
          ctx.reply(`User ${userName} was removed - Spam/Bot.`);
          console.log(`Remove user: ${userName} because of text: ${ctx.text}`)
          ctx.session = {};
        } else {
          ctx.session = {};
        }
        
        next();
      }
    });

    this.bot.on(message('new_chat_members'), (ctx, next) => {
      console.log('new_chat_members');
      ctx.session.joined = true;
      ctx.session.messageIds = [];
    });
  }  
}

