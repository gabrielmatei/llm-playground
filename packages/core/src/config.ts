import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
if (process.env.INIT_CWD) {
  dotenv.config({ path: resolve(process.env.INIT_CWD, ".env") });
}
dotenv.config({ path: resolve(process.cwd(), "../../.env") });


export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function getOptionalEnv<T extends string>(name: string, fallback: T): T {
  return (process.env[name] ?? fallback) as T;
}

