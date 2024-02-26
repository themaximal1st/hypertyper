import HyperType from "@themaximalist/hypertype";
import Bridge from "./bridge.js";
import App from "./app.js";
import Analytics from "./Analytics.js";
import CrashReporter from "./CrashReporter.js";
import updater from "electron-updater";

(async function () {
    await CrashReporter.load();
    await Analytics.load();
    Analytics.track("app.init");

    updater.autoUpdater.checkForUpdatesAndNotify();

    const hypertype = new HyperType();
    await Bridge.load(hypertype);
    await App.launch(hypertype);
})();
