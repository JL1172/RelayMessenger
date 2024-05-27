import { chatHeading } from "../components/chat-heading";
import WebSocket from "ws";
import * as rl from "readline-sync";
import crypto from "crypto";
import fs from "fs";
import chalk from "chalk";
import { main } from "../main";

const file = "../.rsa.json";

function packageError(err: string) {
  throw new Error(err);
}
function reportError(err: string) {
  console.error(
    chalk.red(
      `Error Executing: ${chalk.redBright(err)}. Redirecting to main menu.`
    )
  );
  setTimeout(() => {
    main();
  }, 4000);
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
          if (!parsed.LOCAL_RSA_PUBLIC || !parsed.LOCAL_RSA_PRIVATE) {
            reject("Error Keys Do Not Exist. Proceed To Generate Keys Module.");
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
export async function mainChat() {
  try {
    displayHeading();
    const res = displayDirectories();
    if (res === 2) {
      console.log(chalk.red("Closing Program"));
      process.exit(1);
    } else if (res === 0) {
      const isValid = await validateKeys();
      //   console.log(isValid);
    }
    console.log(chalk.cyan("Redirecting To Main."));
    // setTimeout(() => {
    //   main();
    // }, 1000);
  } catch (err: any) {
    reportError(err.message ? err.message : err);
  }
}
