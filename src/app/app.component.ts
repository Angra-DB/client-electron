import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RequestService } from './request.service';

export enum ValidCommands {
  CreateDb = "create_db",
  Connect = "connect",
  Save = "save",
  SaveKey = "save_key",
  Lookup = "lookup",
  Update = "update",
  Delete = "delete",
  Query = "query",
  QueryTerm = "query_term",
  BulkLookup = "bulk_lookup"
}

export class RequestModel {
  host: string;
  port: string;
  operation: string;
  database: string;
  key: string;
  keyRange: string;
  document: string;
  commands: string[];
  times: number;

  public setCommands() {
    let cmds = [];
    
    switch(this.operation) {
      case ValidCommands.CreateDb:
        cmds.push(`${this.operation} ${this.database}`);
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        break;

      case ValidCommands.Connect:
        cmds.push(`${this.operation} ${this.database}`);
        break;

      case ValidCommands.Save:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        if (this.key) {
          cmds.push(`${ValidCommands.SaveKey} ${this.key} ${this.document.length} ${this.document}`);
        } else {
          for (let i = 0; i < this.times; i++) {
            cmds.push(`${this.operation} ${this.document.length} ${this.document}`);
          }
        }
        break;
        
      case ValidCommands.Lookup:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.key}`);
        break;

      case ValidCommands.Update:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.key} ${this.document.length} ${this.document}`);
        break;

      case ValidCommands.Delete:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.key}`);
        break;

      case ValidCommands.Query:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.key}`);
        break;

      case ValidCommands.QueryTerm:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.key}`);
        break;

      case ValidCommands.BulkLookup:
        cmds.push(`${ValidCommands.Connect} ${this.database}`);
        cmds.push(`${this.operation} ${this.keyRange}`);
        break;
    }

    this.commands = cmds;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'angra-client';

  @Input('ngModel')
  model = new RequestModel();

  public response = "";

  constructor(private requestService: RequestService) { }

  async onSubmit() { 
    this.model.setCommands();
    let response = await this.requestService.sendRequest(this.model);
    this.response += "\n";
    this.response += response;
  }

  onResetRes() {
    this.response = "";
  }

  onTabPress(event) {
    const tab = "   ";
    event.preventDefault();

    let element = event.target;

    let val = element.value,
        start = element.selectionStart,
        end = element.selectionEnd;

    var delimiter = /[\r\n]/i;
    let deltaStart = null;
    if (start === end) {
      deltaStart = start;
    } else {
      for (var i = (start-1); i >= 0; i--) {
        if (delimiter.test(val.charAt(i))) {
          deltaStart = i + 1;
        }
      }
      if (!deltaStart) {
        deltaStart = 0;
      }
    }
    let deltaEnd = end;
    let deltaValue = val.slice(deltaStart, deltaEnd);

    let preDelta = val.slice(0, deltaStart);
    let postDelta = val.slice(deltaEnd);

    let replacement = deltaValue.replace(new RegExp(("(^|" + "\n" + ")"), "g"), ("$1" + tab));

    // Update values.
    element.value = (preDelta + replacement + postDelta);
    element.selectionStart = (start + tab.length);
    element.selectionEnd = (end + (replacement.length - deltaValue.length));
  }

  onShiftTabPress(event) {
    const tab = "   ";
    event.preventDefault();

    let element = event.target;

    let val = element.value,
        start = element.selectionStart,
        end = element.selectionEnd;

    var delimiter = /[\r\n]/i;
    let deltaStart = null;
    if (start === end) {
      deltaStart = start;
    } else {
      for (var i = (start-1); i >= 0; i--) {
        if (delimiter.test(val.charAt(i))) {
          deltaStart = i + 1;
        }
      }
      if (!deltaStart) {
        deltaStart = 0;
      }
    }
    let deltaEnd = end;
    let deltaValue = val.slice(deltaStart, deltaEnd);
    let deltaHasLeadingTab = (deltaValue.indexOf(tab) === 0);

    let preDelta = val.slice(0, deltaStart);
    let postDelta = val.slice(deltaEnd);

    let replacement = deltaValue.replace(new RegExp(("^" + tab), "gm"), "");

    element.value = (preDelta + replacement + postDelta);
    element.selectionStart = deltaHasLeadingTab ? (start - tab.length) : start;
    element.selectionEnd = (end - (deltaValue.length - replacement.length));
  }

  showKeyField() {
    return this.model.operation === ValidCommands.Save ||
      this.model.operation === ValidCommands.Lookup ||
      this.model.operation === ValidCommands.Update ||
      this.model.operation === ValidCommands.Delete;
  }

  showDocumentField() {
    return this.model.operation === ValidCommands.Save ||
      this.model.operation === ValidCommands.Update;
  }

  showTimes() {
    return this.model.operation === ValidCommands.Save;
  }

  showOptional() {
    return this.model.operation === ValidCommands.Save;
  }
}
