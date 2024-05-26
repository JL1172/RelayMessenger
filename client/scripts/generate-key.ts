import crypto from "crypto";
import fs from "fs";

const file: string = "../.RSA.json";

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
          resolve(data);
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
    jsonObject.LOCAL_RSA_PRIVATE = privKey + "";
    const moddedJson = JSON.stringify(jsonObject, null, 2);
    fs.writeFile(file, moddedJson, { encoding: "utf-8" }, (err) => {
      throw new Error(err + "");
    });
  } catch (err) {
    reportErr(err + "write to file");
  }
}

async function main() {
  const { PUB, PRIV } = generateKey();
  if (!PUB || !PRIV) {
    reportErr("Error Generating Keys.");
  }
  const jsonData = await readFile();
  console.log(jsonData);
  process.exit(1);
  writeToFile(JSON.parse(jsonData), PUB, PRIV);
}

main();
