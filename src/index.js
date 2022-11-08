import SwTable from "./sw-table";
import SwTableColumn from "./components/table-column"

export default function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component(SwTable.name, SwTable);
  Vue.component(SwTableColumn.name, SwTableColumn);
}
