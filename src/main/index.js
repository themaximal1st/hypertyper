import HyperType from "@themaximalist/hypertype";
import Bridge from "./bridge.js";
import App from "./app.js";
import Analytics from "./Analytics.js";
import CrashReporter from "./CrashReporter.js";
import updater from "electron-updater";
import colors from "./colors.js";

(async function () {
    await CrashReporter.load();
    await Analytics.load();
    Analytics.track("app.init");

    updater.autoUpdater.checkForUpdatesAndNotify();

    const hypertype = new HyperType({ colors });
    await Bridge.load(hypertype);
    await App.launch(hypertype);
})();
