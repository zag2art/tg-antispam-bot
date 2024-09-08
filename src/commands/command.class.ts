import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { IConfigInterface } from "../config/config.interface";

export abstract class Command {
  constructor (public bot: Telegraf<IBotContext>, public readonly configService: IConfigInterface) {
    this.bot = bot;
  }

  abstract handle(): void;
}