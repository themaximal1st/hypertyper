import * as settings from "./settings";
import debug from "debug";
import { v4 as uuidv4 } from "uuid";
const log = debug("app:uuid");

settings.createDirectory();

let uuid = settings.readFile("uuid");
if (!uuid || uuid.length === 0) {
    uuid = uuidv4();
    log(`Generated new UUID: ${uuid}`);

    settings.writeFile("uuid", uuid);
}

export default uuid;
