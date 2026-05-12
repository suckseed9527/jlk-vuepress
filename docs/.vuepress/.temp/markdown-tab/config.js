import { CodeTabs } from "F:/JavaProgram/jlk-vuepress/node_modules/.pnpm/@vuepress+plugin-markdown-t_ba06c92ece566329db230c822e515dec/node_modules/@vuepress/plugin-markdown-tab/dist/client/components/CodeTabs.js";
import { Tabs } from "F:/JavaProgram/jlk-vuepress/node_modules/.pnpm/@vuepress+plugin-markdown-t_ba06c92ece566329db230c822e515dec/node_modules/@vuepress/plugin-markdown-tab/dist/client/components/Tabs.js";

export default {
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    app.component("Tabs", Tabs);
  },
};
