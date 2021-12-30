import { ListOperations } from "./services/list-services";
import DexieIndexedDB from "./services/dexie-services";
import Dexie from "dexie";
import Config from "./common/config";
export default function Load(url, siteName) {
  var swUrl = url + "/SiteAssets/JS/sw.js";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(swUrl)
      .then(
        (registration) => {
          console.log("worker registration is successfull", registration.scope);
          addListData(url, siteName);
        },
        (err) => {
          console.log(err);
        }
      )
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("Service worker is not supported");
  }
}

function addListData(url, siteName) {
  var listOps = new ListOperations();
  var ops = new DexieIndexedDB();
  var config = new Config();
  var db = new Dexie(siteName);
  var listNameSchema;
  var stores = {};
  var latestTableRecord: any;
  var latestListItem: any;
  listOps
    .getConfigListNames(url)
    .then(async (listNames) => {
      if (listNames[0] !== undefined) {
        var configListNames: string = listNames[0].ConfigValue;
        if (configListNames.length > 0) {
          listNameSchema = await listOps.getConfigListColumns(url);
          listNameSchema.forEach((listItem) => {
            const listTitle = listItem.Title.split("-");
            const listColumnNames = listItem.ConfigValue.replace(
              / *\([^)]*\) */g,
              ""
            );
            stores[listTitle[1]] = listColumnNames;
          });
          stores[config.LATESTRECORDTABLE] = config.LATESTRECORDTABLECOLUMNS;
          console.log(stores);
          ops.createDBTable(stores, db).then(async (d) => {
            console.log(d);
            if (configListNames.indexOf(",") !== -1) {
              var names = configListNames.split(",");
              names.forEach(async (name) => {
                latestTableRecord = await ops.getMasterInfo(
                  db,
                  config.LATESTRECORDTABLE,
                  name
                );
                if (latestTableRecord !== undefined) {
                  latestListItem = await listOps.getLastModifiedItemInfo(
                    url,
                    name
                  );
                  if (latestListItem !== undefined) {
                    if (
                      latestTableRecord.length > 0 &&
                      latestListItem[0].Modified !== undefined
                    ) {
                      if (
                        latestTableRecord[0].modified !==
                        latestListItem[0].Modified
                      ) {
                        addBulkData(url, name, db, listOps, ops);
                        updateLatestItemInfo(
                          name,
                          db,
                          ops,
                          latestTableRecord[0].ID,
                          latestListItem[0]
                        );
                      } else {
                        console.log("no changes in the list!");
                      }
                    } else {
                      addBulkData(url, name, db, listOps, ops);
                      addLatestItemInfo(name, db, ops, latestListItem[0]);
                    }
                  }
                }
              });
            } else {
              const listTitle = configListNames;
              latestTableRecord = await ops.getMasterInfo(
                db,
                config.LATESTRECORDTABLE,
                listTitle
              );
              if (latestTableRecord !== undefined) {
                latestListItem = await listOps.getLastModifiedItemInfo(
                  url,
                  listTitle
                );
                if (latestListItem !== undefined) {
                  if (
                    latestTableRecord.length > 0 &&
                    latestListItem[0].Modified !== undefined
                  ) {
                    if (
                      latestTableRecord[0].modified !==
                      latestListItem[0].Modified
                    ) {
                      await addBulkData(url, listTitle, db, listOps, ops);
                      await updateLatestItemInfo(
                        listTitle,
                        db,
                        ops,
                        latestTableRecord[0].ID,
                        latestListItem[0]
                      );
                    } else {
                      console.log("no changes in the list!");
                    }
                  } else {
                    await addBulkData(url, listTitle, db, listOps, ops);
                    await addLatestItemInfo(
                      listTitle,
                      db,
                      ops,
                      latestListItem[0]
                    );
                  }
                }
              } else {
                await addBulkData(url, listTitle, db, listOps, ops);
                listOps
                  .getLastModifiedItemInfo(url, listTitle)
                  .then((newItem) => {
                    addLatestItemInfo(listTitle, db, ops, newItem[0]);
                  });
              }
            }
          });
        } else {
          console.log("No list configured!");
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function addBulkData(url, name, db, listOps, ops) {
  return new Promise((resolve, reject) => {
    listOps
      .getConfigValue(url, name)
      .then((config) => {
        console.log(config);
        const listColumnNames = config[0].ConfigValue.replace(
          / *\([^)]*\) */g,
          ""
        );
        listOps
          .getListData(url, name.trim(), listColumnNames)
          .then((listData: any) => {
            console.log(listData.length);
            ops
              .addBulkDataToIndexedDBTable(listData, name, db)
              .then((success) => {
                resolve(success);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
function addLatestItemInfo(name, db, ops, newItem) {
  return new Promise((resolve, reject) => {
    ops
      .addListLastModifiedInfo(newItem, db, name)
      .then((success) => {
        resolve(success);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
function updateLatestItemInfo(name, db, ops, oldItemId, newItem) {
  ops
    .deleteListItem(db, oldItemId)
    .then((i) => {
      ops.addListLastModifiedInfo(newItem, db, name);
      console.log(i);
    })
    .catch((err) => {
      console.log(err);
    });
}
