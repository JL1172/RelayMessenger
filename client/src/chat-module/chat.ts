import { chatHeading } from "../components/chat-heading";
import WebSocket from "ws";
import * as rl from "readline-sync";
import crypto, { ECDH } from "crypto";
import fs, { read, readlink } from "fs";
import chalk from "chalk";
import { main } from "../main";
import ora from "ora";
import "dotenv/config";

const spinner: ora.Ora = ora();
const file = "./.rsa.json";

function packageError(err: string) {
  throw new Error(err);
}
function reportError(err: string) {
  spinner.fail(
    chalk.red(`Error Executing: ${chalk.redBright(err)}. Returning to menu.`)
  );
}

async function validateKeys() {
  return await new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!data) {
          reject("Error, Keys Do Not Exist. Proceed To Generate Keys Module.");
        } else {
          const parsed = JSON.parse(data);
          if (
            !("LOCAL_RSA_PUBLIC" in parsed) ||
            !("LOCAL_RSA_PRIVATE" in parsed)
          ) {
            reject(
              "Error: Keys Do Not Exist. Proceed To Generate Keys Module."
            );
          } else {
            resolve(parsed);
          }
        }
      }
    });
  });
}
function displayHeading() {
  console.clear();
  console.log(chalk.cyan(chatHeading()));
}
function displayDirectories() {
  const result = rl.keyInSelect(["Chat", "Main Menu", "Close Program"], "", {
    cancel: false,
  });
  return result;
}
function encrypt(message: string, pubKey: string) {
  const buffer = Buffer.from(message, "utf-8");
  const encrypted = crypto.publicEncrypt(pubKey, buffer);
  return encrypted.toString("base64");
}
function decrypt(encryptedMessage: any, privKey: string) {
  const buffer = Buffer.from(encryptedMessage, "base64");
  const decrypted = crypto.publicDecrypt(privKey, buffer);
  return decrypted.toString("utf-8");
}
export async function mainChat() {
  try {
    displayHeading();
    const res = displayDirectories();
    if (res === 2) {
      console.log(chalk.red("Closing Program"));
      process.exit(1);
    } else if (res === 1) {
      spinner.start(chalk.cyan("Returning To Main Menu."));
      setTimeout(() => {
        main();
        spinner.stop();
      }, 1000);
    } else if (res === 0) {
      spinner.start(chalk.cyan("Validating Keys"));
      const keys = await validateKeys();
      spinner.succeed(chalk.cyan("Keys Validated."));
      const ws = new WebSocket(process.env.URL + "");
      spinner.start(chalk.cyan("Connecting To Server."));
      ws.on("open", () => {
        spinner.succeed(chalk.cyan("Connected To Server."));
        const message = rl.question("You: ");
        const encryptedMessage = encrypt(
          message,
          (keys as any).REMOTE_RSA_PRIV
        );
        ws.send(encryptedMessage);
      });
      ws.on("message", (data: any) => {
        const decryptedMessage = decrypt(data, (keys as any).LOCAL_RSA_PRIVATE);
        console.log(chalk.cyan(`Unknown Sender: ${decryptedMessage}`));
      });
      ws.on("close", () => {
        spinner.start(chalk.cyan("Disconnecting from server"));
        setTimeout(() => {
          spinner.succeed(chalk.cyan("Successfully Disconnected From Server."));
        }, 1000);
      });
      mainChat();
    }
  } catch (err: any) {
    reportError(err.message ? err.message : err);
    setTimeout(() => {
      mainChat();
    }, 4000);
  }
}
