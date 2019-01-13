"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var net_1 = require("net");
var path = require("path");
var url = require("url");
var win;
function createWindow() {
    win = new electron_1.BrowserWindow({ width: 1200, height: 900 });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/../../dist/angra-client/index.html"),
        protocol: "file:",
        slashes: true
    }));
    win.on("closed", function () {
        win = null;
    });
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
electron_1.ipcMain.on("angraRequest", function (event, args) {
    var count = 0;
    var response = "";
    var client = new net_1.Socket();
    client.connect(args.port, args.host, function () {
        if (args.commands.length > 0) {
            client.write(args.commands[count]);
            count++;
        }
        else {
            client.destroy();
        }
    });
    client.on('data', function (data) {
        response += data.toString();
        if (count < args.commands.length) {
            client.write(args.commands[count]);
            count++;
        }
        else {
            win.webContents.send("angraResponse", response);
            client.destroy();
        }
    });
    client.on('close', function () {
        win.webContents.send("angraResponse", "Connection closed...");
    });
});
//# sourceMappingURL=main.js.map