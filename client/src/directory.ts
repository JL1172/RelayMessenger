import * as rl from "readline-sync";
import { heading } from "./components/heading";
import { generateKeyMain } from "./key-module/generate-key";

function displayHeading() {
  console.log(heading());
}
function displayDirectories() {
  const paths = ["Key Generation", "Secure Chat Module"];
  const userChoice = rl.keyInSelect(paths);
  return userChoice;
}
function main() {
  displayHeading();
  const result = displayDirectories();
  switch (result) {
    case 0:
      generateKeyMain();
      break;
    case 1:
      break;
  }
}

main();
