import crypto from "crypto";
import fs from "fs";
import { keyGenHeading } from "../components/key-gen-heading";
import * as rl from "readline-sync";
import { exec } from "child_process";

const file: string = "../.rsa.json";

function reportErr(err: string) {
  console.error(`Error running script: ${err}, terminating process.`);
  process.exit(1);
}
function generateKey(): { PUB: string; PRIV: string } {
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
    return { PUB, PRIV };
  } catch (err) {
    reportErr(err + "generate key");
  }
  return { PUB: "", PRIV: "" };
}
async function readFile(): Promise<any | void> {
  try {
    return await new Promise((resolve, reject) => {
      fs.readFile(file, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  } catch (err) {
    reportErr(err + "read file");
  }
}
function writeToFile(jsonObject: any, pubKey: string, privKey: string) {
  try {
    jsonObject.LOCAL_RSA_PUBLIC = pubKey;
    jsonObject.LOCAL_RSA_PRIVATE = privKey;
    const moddedJson = JSON.stringify(jsonObject, null, 2);
    fs.writeFile(file, moddedJson, { encoding: "utf-8" }, (err) => {
      if (err) {
        throw new Error(err + "");
      }
    });
  } catch (err) {
    reportErr(err + "write to file");
  }
}

function displayHeading() {
  console.log(keyGenHeading());
}
export async function generateKeyMain() {
  displayHeading();
  const { PUB, PRIV } = generateKey();
  if (!PUB || !PRIV) {
    reportErr("Error Generating Keys.");
  }
  const jsonData = await readFile();
  writeToFile(jsonData, PUB, PRIV);
  console.log("Successfully Generated New Pub And Private Keys. Returning To Main Directory.");
  exec("npm run start", (stdout, stderr, error: any) => {
    if (error) {
      reportErr("Error Returning To Root, Restart Program.");
    }
  });
}
