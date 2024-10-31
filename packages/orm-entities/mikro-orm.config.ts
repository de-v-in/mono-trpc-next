import { defineConfig } from "@mikro-orm/libsql";
import { BackendENV } from "@repo/env";
import { User } from "./user";

export default defineConfig({
  entities: [User],
  dbName: "database.db",
  debug: BackendENV.IS_DEV,
  discovery: { disableDynamicFileAccess: false },
});
