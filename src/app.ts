import { Telegraf, session } from "telegraf";
import { IConfigInterface } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";
import { Command } from "./commands/command.class";
import LocalSession from "telegraf-session-local";
import { GigachatBanCommand } from "./commands/gigachat_ban.command";

class Bot {
  bot: Telegraf<IBotContext>;
  commands: Command[] = [];

  constructor (private readonly configService: IConfigInterface) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
    this.bot.use(
      new LocalSession({ database: 'sessions.json'}).middleware()
    );
  }

  init() {
    this.commands = [
      new GigachatBanCommand(this.bot, this.configService)
    ];

    for (const command of this.commands) {
      command.handle();
    }

    this.bot.launch();
  }
}

const bot = new Bot(new ConfigService());
bot.init();

