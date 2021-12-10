import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Config from "../common/config";

export class ListOperations {
  private config = new Config();

  public getLatestListItem(url) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.LISTNAME)
        .items.top(1)
        .orderBy("Modified", false)
        .get()
        .then((item: any[]) => {
          resolve(item);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public getListItems(url) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.LISTNAME)
        .items.getAll()
        .then((allItems) => {
          resolve(allItems);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }
  public getConfigListNames(url) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.CONFIGLIST)
        .items.filter("Title eq '" + this.config.LISTNAMESKEY + "'")
        .get()
        .then((allItems) => {
          resolve(allItems);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }
  public getConfigListColumns(url, listname) {
    let web = Web(url);    
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.CONFIGLIST)
        .items.filter(this.config.KEYCOLUMNNAME + " eq '" + listname + "'")
        //items.filter(this.config.KEYCOLUMNNAME + " eq 'SalesRecords'")
        .get()
        .then((allItems) => {
          resolve(allItems);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }
  public getLatestItems(dateValue, url) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.LISTNAME)
        .items.filter("Modified ge datetime" + "'" + dateValue + "'")
        .getAll()
        .then((result) => {
          resolve(result);
          console.log(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public async getLastModifiedItemInfo(url) {
    var web = Web(url);
    return new Promise((resolve, reject) => {
      web.lists
        .getByTitle(this.config.LISTNAME)
        .items.top(1)
        .orderBy("Modified", false)
        .get()
        .then((items: any[]) => {
          resolve(items);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
}
