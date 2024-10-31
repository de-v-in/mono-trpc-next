import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { createHmac } from "crypto";

export interface IMaper {
  key: string;
  target: string;
  description: string;
}

@Entity()
export class User {
  @PrimaryKey({ type: "string" })
  id = v4();

  @Property({ type: "string", unique: true })
  email: string;

  @Property({ type: "string", lazy: true })
  password: string;

  @Property({ type: "timestamp" })
  createdAt = new Date();

  @Property({ type: "timestamp", onUpdate: () => new Date() })
  updateAt = new Date();

  constructor(email: string, password: string) {
    this.email = email;
    this.password = User.hashPassword(password);
  }

  static hashPassword(password: string): string {
    return createHmac("sha256", password).digest("hex");
  }
}
