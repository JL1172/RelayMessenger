import crypto from "crypto";
import fs from "fs";
import { keyGenHeading } from "../components/key-gen-heading";
import * as rl from "readline-sync";
import { exec } from "child_process";
import chalk from "chalk";
import { main } from "../main";

const file: string = "../.rsa.json";

function packageError(err: string) {
  throw new Error(err);
}

function reportErr(err: string) {
  console.error(
    chalk.redBright(
      `Error running script: ${err}, terminating process. Proceeding To Main Menu`
    )
  );
}
function generateKey() {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    const PUB = JSON.stringify(
      publicKey.export({ type: "pkcs1", format: "pem" })
    );
    const PRIV = JSON.stringify(
      privateKey.export({ type: "pkcs1", format: "pem" })
    );
    if (!PUB || !PRIV) {
      packageError("Error Generating Keys.");
    }
    return { PUB, PRIV };
  } catch (err: any) {
    packageError(
      err.message ? err.message : "Error Generating Keys. Internal Issue."
    );
  }
  return { PUB: "", PRIV: "" };
}
async function readFile(): Promise<any | void> {
  return await new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!data) {
          reject("Unable To Parse Key File.");
        } else {
          resolve(JSON.parse(data));
        }
      }
    });
  });
}
async function writeToFile(jsonObject: any, pubKey: string, privKey: string) {
  try {
    jsonObject.LOCAL_RSA_PUBLIC = pubKey;
    jsonObject.LOCAL_RSA_PRIVATE = privKey;
    const moddedJson = JSON.stringify(jsonObject, null, 2);
    fs.writeFile(file, moddedJson, { encoding: "utf-8" }, (err) => {
      if (err) {
        packageError(err + "");
      }
    });
  } catch (err) {
    packageError(err + "write to file");
  }
}

function displayHeading() {
  console.log(chalk.blue(keyGenHeading()));
}
function decidePath() {
  const choices = [
    "Generate New Key Pair",
    "Clear Keys",
    "Return To Main Menu",
    "Close Program",
  ];
  const result = rl.keyInSelect(choices, "", { cancel: false });
  return result;
}
export async function generateKeyMain() {
  try {
    console.clear();
    displayHeading();
    const res = decidePath();
    if (res === 0) {
      const { PUB, PRIV } = generateKey();
      const jsonData = await readFile();
      writeToFile(jsonData, PUB, PRIV);
      console.log(
        chalk.blue(
          "Successfully Generated New Pub And Private Keys. Returning To Main Directory."
        )
      );
    } else if (res === 1) {
      const jsonData = await readFile();
      writeToFile(jsonData, "", "");
      console.log(
        chalk.blue("Successfully Cleared Keys. Returning To Main Directory.")
      );
    } else if (res === 3) {
      console.log(chalk.red("Exiting Program."));
      process.exit(1);
    }
    setTimeout(() => {
      main();
    }, 2000);
  } catch (err: any) {
    reportErr(err.message ? err.message : err);
    setTimeout(() => {
      main();
    }, 4000);
  }
}
