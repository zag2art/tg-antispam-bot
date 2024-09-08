import { DotenvParseOutput, config } from "dotenv";
import { IConfigInterface } from "./config.interface";

export class ConfigService implements IConfigInterface {
  private config: DotenvParseOutput;

  constructor () {
    const {error, parsed} = config();

    if (error) {
      throw Error('.env file not found');
    }

    if (!parsed) {
      throw Error('.env file is empty');
    }

    this.config = parsed;
  }

  get(key: string): string {
    const res = this.config[key]
    if (!res) {
      throw Error(`There is no key: '${key}' in your .env file`);
    }
    return res;
  }
}