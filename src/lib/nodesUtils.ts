import { persistChart } from "$lib/crudUtils";
import { CHART_TYPE, previewTable, type ChartViewTable } from "$lib/storeUtils";

export function addChart(id: string, type: string) {
    let chartLocalData: ChartViewTable = {
        type: CHART_TYPE.Bar,
        tableId: id
    };
    persistChart(chartLocalData, type);
}
export function setPreviewData(id: string) {
    previewTable.update((prvT) => {
        prvT.tableId = id;
        prvT.view = true;
        return prvT;
    });
}