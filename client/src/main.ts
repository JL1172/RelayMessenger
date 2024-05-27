import { mainChat } from "./chat-module/chat";
import * as rl from "readline-sync";
import { heading } from "./components/heading";
import { generateKeyMain } from "./key-module/generate-key";
import chalk from "chalk";

function displayHeading() {
  console.log(chalk.green(heading()));
}
function displayDirectories() {
  const paths = ["RSA Module", "Chat Module", "Close Program"];
  const userChoice = rl.keyInSelect(paths, "", { cancel: false });
  return userChoice;
}
export function main() {
  console.clear();
  displayHeading();
  const result = displayDirectories();
  switch (result) {
    case 0:
      generateKeyMain();
      break;
    case 1:
      mainChat();
      break;
    case 2:
      console.log(chalk.red("Closing Program"));
      process.exit(1);
    default:
      process.exit(1);
  }
}

main();
