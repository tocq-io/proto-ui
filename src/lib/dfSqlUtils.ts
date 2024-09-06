import { Table, tableFromIPC } from "@apache-arrow/ts";
import init, { load_csv_bytes, register_table, run_sql, init_panic_hook } from "proto-query-engine";
import { errorView } from "$lib/storeUtils";

export type CsvConfig = {
    delimiter: string,
    quote: string,
    comment: string,
    escape: string,
    null_regex: string,
    truncated: boolean,
}

function setErrorView(msg: string) {
    errorView.set({
        color: 'red',
        visibility: 'visible',
        msg: msg
    });
}

export async function initDfSql() {
    await init();
    init_panic_hook();
}

export async function getTables(sqlStatement: string): Promise<Set<string>> {
    let tables = new Set<string>();
    return run_sql('EXPLAIN ' + sqlStatement)
        .then((ipcResult) => {
            const table = tableFromIPC(ipcResult);
            for (const result of table.toArray()) {
                const row = result.toArray();
                // TODO this could probably be done in a more robust way on the rust side...
                if (row[0] === 'physical_plan') {
                    for (const analysis of row[1].split(/\n/)) {
                        let candidate: string = analysis.trim();
                        const idLength = 'ArrowExec: file_groups={1 group: [['.length;
                        const startIndex = candidate.indexOf('ArrowExec: ');
                        if (startIndex == 0) {
                            const endIndex = candidate.indexOf('.arrow');
                            candidate = candidate.substring(idLength, endIndex);
                            tables.add(candidate.trim());
                        }
                    }
                }
            }
            return tables;
        })
        .catch((e) => {
            setErrorView(e.message);
            return new Set();
        });
}

export async function getArrowTable(sqlStatement: string, id: string): Promise<Table | undefined> {
    return run_sql(sqlStatement)
        .then((reslt) => {
            return tableFromIPC(reslt);
        })
        .catch((e) => {
            setErrorView(e.message);
            return undefined
        });
}

export async function registerArrowTable(dataId: string, tableName: string) {
    return register_table(dataId, tableName)
        .catch((e) => {
            setErrorView(e.message);
        });
}

export async function importCsvData(digest: string, fileUint8: ArrayBuffer, csvConfig: CsvConfig) {
    return load_csv_bytes(new Uint8Array(fileUint8), digest, csvConfig)
        .catch((e) => {
            setErrorView(e.message);
        });

}