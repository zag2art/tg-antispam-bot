import { Context } from "telegraf";

export interface SessionData {
  messageIds?: number[];
  joined?: boolean;
}
export interface IBotContext extends Context {
  session: SessionData;
}