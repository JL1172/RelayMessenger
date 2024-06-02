import { chatHeading } from "../components/chat-heading";
import WebSocket from "ws";
import readline from "readline";
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
function encrypt(message: string, pubKey: string) {
  // const buffer = Buffer.from(message, "utf-8");
  // const encrypted = crypto.publicEncrypt(
  //   // { key: pubKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  //   pubKey,
  //   buffer
  // );
  // return encrypted.toString("base64");
  return message;
}
function decrypt(encryptedMessage: Buffer, privKey: string) {
  // const buffer = Buffer.from(encryptedMessage, "base64");
  // const decrypted = crypto.publicDecrypt(
  //   // { key: privKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  //   privKey,
  //   buffer
  // );
  // return decrypted.toString("utf-8");
  return encryptedMessage.toString("utf-8");
}
export async function mainChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "You> ",
  });
  try {
    displayHeading();
    const ws = new WebSocket("ws://localhost:8080");
    const publicKey: any = await validateKeys(files[2]);
    const privateKey: any = await validateKeys(files[1]);
    ws.on("open", () => {
      console.log("Connected to server. Wait for 'You>' to appear");
      rl.prompt();

      // Handle user input
      rl.on("line", (line: string) => {
        if (line.trim() === "exit") {
          ws.close();
          rl.close();
          return;
        }
        const encryptedMessage = encrypt(line, publicKey);
        ws.send(encryptedMessage);
        rl.prompt();
      });
    });

    // Handle incoming WebSocket messages
    ws.on("message", (data: any) => {
      const decryptedMessage = decrypt(data, privateKey);
      console.log(`Unknown Sender: ${decryptedMessage}`);
      rl.prompt();
    });

    // Handle WebSocket connection close event
    ws.on("close", () => {
      console.log("Disconnected from server.");
      main();
    });

    // Handle WebSocket errors
    ws.on("error", (error) => {
      packageError(error + "");
    });
  } catch (err: any) {
    reportError(err);
    setTimeout(() => {
      mainChat();
    }, 3000);
  }
}
