import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Config from "../common/config";

export class ListOperations {
  private config = new Config();

  // public getListItems(url) {
  //   let web = Web(url);
  //   return new Promise(async (resolve, reject) => {
  //     await web.lists
  //       .getByTitle(this.config.LISTNAME)
  //       .items.getAll()
  //       .then((allItems) => {
  //         resolve(allItems);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //         console.log(err);
  //       });
  //   });
  // }
  public getListData(url, listName, columns) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(listName)
        .items.select(columns)
        .getAll()
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
  public getConfigValue(url, key) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.CONFIGLIST)
        .items.filter(this.config.KEYCOLUMNNAME + " eq 'ListColumns-" + key + "'")
        .get()
        .then((item) => {
          resolve(item);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }
  public getConfigListColumns(url) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.config.CONFIGLIST)
        .items.filter(
          this.config.KEYCOLUMNNAME + " ne '" + this.config.LISTNAMESKEY + "'"
        )
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
  // public getLatestItems(dateValue, url) {
  //   let web = Web(url);
  //   return new Promise(async (resolve, reject) => {
  //     await web.lists
  //       .getByTitle(this.config.LISTNAME)
  //       .items.filter("Modified ge datetime" + "'" + dateValue + "'")
  //       .getAll()
  //       .then((result) => {
  //         resolve(result);
  //         console.log(result);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  // }

  public getLastModifiedItemInfo(url, listName) {
    var web = Web(url);
    return new Promise((resolve, reject) => {
      web.lists
        .getByTitle(listName)
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
