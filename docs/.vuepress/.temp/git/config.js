import { GitContributors } from "F:/JavaProgram/jlk-vuepress/node_modules/.pnpm/@vuepress+plugin-git@2.0.0-_a203cb5b1362c35cb1a86b4535fe5aa2/node_modules/@vuepress/plugin-git/dist/client/components/GitContributors.js";
import { GitChangelog } from "F:/JavaProgram/jlk-vuepress/node_modules/.pnpm/@vuepress+plugin-git@2.0.0-_a203cb5b1362c35cb1a86b4535fe5aa2/node_modules/@vuepress/plugin-git/dist/client/components/GitChangelog.js";

export default {
  enhance: ({ app }) => {
    app.component("GitContributors", GitContributors);
    app.component("GitChangelog", GitChangelog);
  },
};
