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
const files = [
  "./.local_public_key.pem",
  "./.local_private_key.pem",
  "./.remote_public_key.pem",
];
const messages: string[] = [];

function packageError(err: string) {
  throw new Error(err);
}
function reportError(err: string) {
  spinner.fail(
    chalk.red(`Error Executing: ${chalk.redBright(err)}. Returning to menu.`)
  );
}

async function validateKeys(file: string) {
  return await new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!data) {
          reject("Error, Keys Do Not Exist. Proceed To Generate Keys Module.");
        } else {
          resolve(data);
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
      console.log(
        chalk.bgCyanBright(chalk.black("Press Chat Option 3 Times."))
      );
      spinner.start(chalk.cyan("Validating Keys"));
      const pubKey: any = await validateKeys(files[0]);
      const privKey: any = await validateKeys(files[1]);
      const rpubKey: any = await validateKeys(files[2]);
      spinner.succeed(chalk.cyan("Keys Validated."));
      const ws = new WebSocket("ws://localhost:8080");
      spinner.start(chalk.cyan("Connecting To Server."));
      ws.on("open", () => {
        spinner.succeed(chalk.cyan("Connected To Server."));
        console.log(chalk.cyan('Type "exit" to leave chat.\n'));
        while (true) {
          const message = rl.question("Enter Your Message: ");
          if (message === "exit") {
            // console.log(message)
            ws.close();
          }
            const encryptedMessage = encrypt(message, rpubKey);
            ws.send(encryptedMessage);
        }
      });
      ws.on("message", (data: any) => {
        const decryptedMessage = decrypt(data, privKey);
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
