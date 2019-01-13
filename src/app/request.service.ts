import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private ipc: IpcRenderer;

  constructor() {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require("electron").ipcRenderer;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn("Could not load electron's ipc");
    }
  }

  async sendRequest(model) {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once("angraResponse", (event, arg) => {
        resolve(arg);
      });

      this.ipc.send("angraRequest", model);
    });
  }
}
