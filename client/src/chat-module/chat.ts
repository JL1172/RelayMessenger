import { chatHeading } from "../components/chat-heading";
import WebSocket from "ws";
import readline from "readline";
import crypto, { ECDH } from "crypto";
import fs, { read, readlink } from "fs";
import chalk from "chalk";
import { main } from "../main";
import ora from "ora";
import "dotenv/config";
import * as rl from "readline-sync";

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You> ",
});
const ws = new WebSocket("ws://localhost:8080");

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
  // const buffer = Buffer.from(message, "utf-8");
  // const encrypted = crypto.publicEncrypt(pubKey, buffer);
  // return encrypted.toString("base64");
  return message;
}
function decrypt(encryptedMessage: any, privKey: string) {
  // const buffer = Buffer.from(encryptedMessage, "base64");
  // const decrypted = crypto.publicDecrypt(privKey, encryptedMessage);
  // return decrypted.toString("utf-8");
  return encryptedMessage;
}