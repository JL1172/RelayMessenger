import ora from "ora";
import crypto from "crypto";
import fs, { read } from "fs";
import { keyGenHeading } from "../components/key-gen-heading";
import * as rl from "readline-sync";
import chalk from "chalk";
import { main } from "../main";

const spinner: ora.Ora = ora();
const files: string[] = [
  "./.local_public_key.pem",
  "./.local_private_key.pem",
  "./.remote_public_key.pem",
];

function packageError(err: string) {
  throw new Error(err);
}

function reportErr(err: string) {
  spinner.fail(
    chalk.redBright(`Error running script: ${err}. Proceeding To Menu`)
  );
}
function createRsaFile() {
  fs.writeFile(".local_public_key.pem", "", () => {});
  fs.writeFile(".local_private_key.pem", "", () => {});
  fs.writeFile(".remote_public_key.pem", "", () => {});
}
function generateKey() {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
    });
    const PUB = publicKey.export({ type: "pkcs1", format: "pem" });
    const PRIV = privateKey.export({ type: "pkcs1", format: "pem" });
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
//!deprecated keeping just in case for reference
async function readFile(file: string): Promise<any | void> {
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
          const parsed: any = data;
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
            resolve(parsed);
          }
        }
      }
    });
  });
}
async function writeToFile(pubKey: string | Buffer, privKey: string | Buffer) {
  fs.writeFile(files[0], pubKey, { encoding: "utf-8" }, (err) => {
    if (err) {
      packageError(err + "");
    } else {
      console.log("pub key file created successfully.");
    }
  });
  fs.writeFile(files[1], privKey, { encoding: "utf-8" }, (err) => {
    if (err) {
      packageError(err + "");
    } else {
      console.log("priv key file created succesfully.");
    }
  });
}

function displayHeading() {
  console.log(chalk.blue(keyGenHeading()));
}
function decidePath() {
  const choices = [
    "Generate New Key",
    // "Reset RSA File",
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
      await writeToFile(PUB, PRIV);
      spinner.succeed(
        chalk.blue("Successfully Generated New Pub And Private Keys")
      );
      setTimeout(() => {
        generateKeyMain();
      }, 1000);
      // }
      // else if (res === 1) {
      //   spinner.start();
      //   createRsaFile();
      //   spinner.succeed(chalk.blue("Successfully Reset RSA File."));
      //   setTimeout(() => {
      //     generateKeyMain();
      //   }, 1000);
    } else if (res === 2) {
      console.log(chalk.red("Exiting Program."));
      process.exit(1);
    } else if (res === 1) {
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
