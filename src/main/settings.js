import { app } from "electron";
import path from "path";
import fs from "fs";
import debug from "debug";
const log = debug("app:settings");

export const DIRECTORY = app.getPath("userData");

export function createDirectory() {
    if (!fs.existsSync(DIRECTORY)) {
        log(`Creating directory: ${DIRECTORY}`);
        fs.mkdirSync(DIRECTORY, { recursive: true });
    }
}

export function readFile(file) {
    const file_path = path.join(DIRECTORY, file);
    if (!fs.existsSync(file_path)) {
        return "";
    }
    return fs.readFileSync(file_path, "utf-8");
}

export function writeFile(file, data) {
    fs.writeFileSync(path.join(DIRECTORY, file), data, "utf-8");
}
