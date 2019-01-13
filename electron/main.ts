import { app, BrowserWindow, ipcMain } from "electron";
import { Socket } from "net";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;

function  createWindow() {
    win = new BrowserWindow({ width: 1200, height: 900 });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `/../../dist/angra-client/index.html`),
            protocol: "file:",
            slashes: true
        })
    );

    win.on("closed", () => {
        win = null;
    });
}

app.on("ready", createWindow);

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on("angraRequest", (event, args) => {
    let count = 0;
    let response = "";
    let client = new Socket();
    client.connect(args.port, args.host, function() {
        if (args.commands.length > 0) {
            client.write(args.commands[count]);
            count++;
        } else {
            client.destroy();
        }
    });

    client.on('data', function(data) {
        response += data.toString();
        if (count < args.commands.length) {
            client.write(args.commands[count]);
            count++;
        } else {
            win.webContents.send("angraResponse", response);
            client.destroy();
        }
    });

    client.on('close', function() {
        win.webContents.send("angraResponse", "Connection closed...");
    })
});