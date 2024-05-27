import ora from "ora";
import crypto from "crypto";
import fs from "fs";
import { keyGenHeading } from "../components/key-gen-heading";
import * as rl from "readline-sync";
import chalk from "chalk";
import { main } from "../main";

const spinner: ora.Ora = ora();
const file: string = "./.rsa.json";

function packageError(err: string) {
  throw new Error(err);
}

function reportErr(err: string) {
  spinner.fail(
    chalk.redBright(`Error running script: ${err}. Proceeding To Menu`)
  );
}
function createRsaFile() {
  fs.writeFile(
    ".rsa.json",
    JSON.stringify(
      {
        LOCAL_RSA_PUBLIC: "",
        LOCAL_RSA_PRIVATE: "",
        REMOTE_RSA_PRIV: "",
      },
      null,
      2
    ),
    () => {}
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
        reject(
          err + `Press ${chalk.blue("Reset RSA File")} Option To Reset File.`
        );
      } else {
        if (!data) {
          reject(
            `Unable To Parse Key File, Improper Format, Press ${chalk.blue(
              "Reset RSA File"
            )} Option To Reset File.`
          );
        } else {
          const parsed = JSON.parse(data);
          if (
            !("LOCAL_RSA_PUBLIC" in parsed) ||
            !("LOCAL_RSA_PRIVATE" in parsed)
          ) {
            reject(
              `Unable To Parse Key File, Improper Format, Press ${chalk.blue(
                "Reset RSA File"
              )} Option To Reset File.`
            );
          } else {
            resolve(JSON.parse(data));
          }
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
    "Generate New Key",
    "Reset RSA File",
    "Main Menu",
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
      spinner.start();
      const { PUB, PRIV } = generateKey();
      const jsonData = await readFile();
      writeToFile(jsonData, PUB, PRIV);
      spinner.succeed(
        chalk.blue("Successfully Generated New Pub And Private Keys")
      );
      setTimeout(() => {
        generateKeyMain();
      }, 1000);
    } else if (res === 1) {
      spinner.start();
      createRsaFile();
      spinner.succeed(chalk.blue("Successfully Reset RSA File."));
      setTimeout(() => {
        generateKeyMain();
      }, 1000);
    } else if (res === 3) {
      console.log(chalk.red("Exiting Program."));
      process.exit(1);
    } else if (res === 2) {
      spinner.start(chalk.blue("Returning To Main Menu."));
      setTimeout(() => {
        main();
        spinner.stop();
      }, 1000);
    }
  } catch (err: any) {
    reportErr(err.message ? err.message : err);
    setTimeout(() => {
      generateKeyMain();
    }, 4000);
  }
}
