import masterdb from "./masterinfo";
import empdb from "./empdatabase";
import Dexie from "dexie";
import Config from "../common/config";
import { ListOperations } from "./list-services";
const DATAINFO = "DataInfo";
const SALESTABLE = "SalesRecords";
//const MASTERINFO = "DataInfo";
export default class DexieServices {
  private dbInstance = new Config();
  private listOps = new ListOperations();

  public addLastModifiedInfo(item) {
    return new Promise((resolve, reject) => {
      if (
        masterdb.table(DATAINFO) !== null ||
        masterdb.table(DATAINFO) !== undefined
      ) {
        masterdb.table(DATAINFO).clear();
      }
      masterdb
        .table(DATAINFO)
        .add({
          ID: item[0].ID,
          LastModified: item[0].Modified,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public addBulkDataToIndexedDB(data) {
    return new Promise((resolve, reject) => {
      if (
        empdb.table(SALESTABLE) !== null ||
        empdb.table(SALESTABLE) !== undefined
      ) {
        empdb.table(SALESTABLE).clear();
      }
      empdb
        .table(SALESTABLE)
        .bulkAdd(data)
        .then((data) => {
          resolve(data);
          console.log("Data added.");
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public getMasterInfo() {
    return new Promise((resolve, reject) => {
      masterdb
        .table(DATAINFO)
        .orderBy("ID")
        .toArray()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
  public getItemByID(itemID: number) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SALESTABLE)
        .where("ID")
        .equals(itemID)
        .toArray()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  public addListItem(id, salesdata) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SALESTABLE)
        .add({
          ID: id,
          Title: salesdata.Title,
          field_1: salesdata.field_1,
          field_2: salesdata.field_2,
          field_3: salesdata.field_3,
        })
        .then((updated) => {
          if (updated) resolve(updated);
          else reject("error");
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  public udpdatesListItem(id, salesdata) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SALESTABLE)
        .update(id, {
          Title: salesdata.Title,
          field_1: salesdata.field_1,
          field_2: salesdata.field_2,
          field_3: salesdata.field_3,
        })
        .then((updated) => {
          if (updated) {
            resolve(updated);
          } else {
            console.log("error");
            reject("error");
          }
        })
        .catch((error) => {
          console.error("error : " + error);
        });
    });
  }
  public addupdateItems(items) {
    items.map(async (item) => {
      var itemExists: any = await this.getItemByID(item.ID);
      if (itemExists.length > 0) {
        this.udpdatesListItem(item.ID, item);
      } else {
        this.addListItem(item.ID, item);
      }
    });
  }

  public checkDBTable(tableNames, url: string) {
    tableNames.map((table: any) => {
      Dexie.exists(this.dbInstance.INDEXEDDBNAME)
        .then((success) => {
          if (success) {
            this.listOps
              .getConfigListColumns(url, table)
              .then(async (data: any) => {
                if (data.length > 0) {
                  this.createDBTable(table, data[0].ConfigValue);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            console.log("database doesnt exists");

            this.listOps
              .getConfigListColumns(url, table)
              .then((data: any) => {
                if (data.length > 0) {
                  this.createDBTable(table, data[0].ConfigValue);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.error(
            "Oops, an error occurred when trying to check database existance" +
              error
          );
        });
    });
  }

  public async createDBTable(tableName, columns) {
    try {
      var db = new Dexie(this.dbInstance.INDEXEDDBNAME);
      var dbVersion = db.verno;
      var quote = '"';
      dbVersion++;
      // db.version(dbVersion).stores({
      //   [tableName]: quote + "++id," + columns + quote,
      // });
      db.version(dbVersion).stores({
        "tableNew": "++id,Name"
      });
      db.open();
    } catch (error) {
      console.log(error);
      db.close();
    }
  }
}
