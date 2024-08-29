import { tableFromIPC } from "@apache-arrow/ts";
import { run_sql } from "proto-query-engine";
import { errorView, tables } from "$lib/storeUtils";

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
                        const idLength = 'CsvExec: file_groups={1 group: [['.length;
                        const startIndex = candidate.indexOf('CsvExec: ');
                        if (startIndex == 0) {
                            const endIndex = candidate.indexOf('.csv]]}, projection');
                            candidate = candidate.substring(idLength, endIndex);
                            tables.add(candidate.trim());
                        }
                    }
                }
            }
            // TODO this is a bit odd
            errorView.update((errV) => {
                errV.visibility = 'hidden';
                return errV;
            });
            return tables;
        })
        .catch((e) => {
            errorView.set({
                color: 'red',
                visibility: 'visible',
                msg: e.message
            });
            return new Set();
        });
}

export async function updateArrowTables(sqlStatement: string, id: string) {
    await run_sql(sqlStatement)
        .then((reslt) => {
            tables.update((tblMp) => {
                tblMp.set(id, tableFromIPC(reslt));
                return tblMp;
            });
            errorView.update((errV) => {
                errV.visibility = 'hidden';
                return errV;
            });
        })
        .catch((e) => {
            errorView.set({
                color: 'red',
                visibility: 'visible',
                msg: e.message
            });
        });
}