process.env.NODE_ENV = "production";

import {join} from "path";
import {say} from "cfonts";
import {deleteAsync} from "del";
import chalk from "chalk";
import {rollup, OutputOptions} from "rollup";
import {Listr} from "listr2";
import rollupOptions from "./rollup.config";
import {errorLog, doneLog} from "./log";
import {getArgv} from "./utils";

const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
// 默认的preload.js
const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload");
// todo 插入需要编译的preload.js
const preloadDouyinAuthorizationOpt = rollupOptions(process.env.NODE_ENV, "douyin_authorization");
const preloadXiaohongshuAuthorizationOpt = rollupOptions(process.env.NODE_ENV, "xiaohongshu_authorization");
const preloadWechatVideoAuthorizationOpt = rollupOptions(process.env.NODE_ENV, "wechat_video_authorization");
const preloadDouyinPushVideoOpt = rollupOptions(process.env.NODE_ENV, "douyin_push_video");
const preloadXiaohongshuPushVideoOpt = rollupOptions(process.env.NODE_ENV, "xiaohongshu_push_video");

const {clean = false, target = "client"} = getArgv();
const isCI = process.env.CI || false;

if (target === "web") web();
else unionBuild();

async function cleanBuild() {
  await deleteAsync([
    "dist/electron/main/*",
    "dist/electron/renderer/*",
    "dist/web/*",
    "build/*",
    "!build/icons",
    "!build/lib",
    "!build/lib/electron-build.*",
    "!build/icons/icon.*",
  ]);
  doneLog(`clear done`);
  if (clean) process.exit();
}

async function unionBuild() {
  greeting();
  await cleanBuild();

  const tasksLister = new Listr(
    [
      {
        title: "building main process",
        task: async () => {
          try {
            const build = await rollup(mainOpt);
            await build.write(mainOpt.output as OutputOptions);
          } catch (error) {
            errorLog(`failed to build main process\n`);
            return Promise.reject(error);
          }
        },
      },
      {
        title: "building preload process",
        task: async () => {
          try {
            let preloads = [
              preloadOpt,
              preloadDouyinAuthorizationOpt,
              preloadXiaohongshuAuthorizationOpt,
              preloadWechatVideoAuthorizationOpt,
              preloadDouyinPushVideoOpt,
              preloadXiaohongshuPushVideoOpt,
            ];
            preloads.map(async (item) => {
              const build = await rollup(item);
              await build.write(item.output as OutputOptions);
            })
          } catch (error) {
            errorLog(`failed to build main process\n`);
            return Promise.reject(error);
          }
        }
      },
      {
        title: "building renderer process",
        task: async (_, tasks) => {
          try {
            const {build} = await import("vite");
            await build({configFile: join(__dirname, "vite.config.mts")});
            tasks.output = `take it away ${chalk.yellow(
              "`electron-builder`"
            )}\n`;
          } catch (error) {
            errorLog(`failed to build renderer process\n`);
            return Promise.reject(error);
          }
        },
      },
    ],
    {
      concurrent: true,
      exitOnError: true,
    }
  );
  await tasksLister.run();
}

async function web() {
  await deleteAsync(["dist/web/*", "!.gitkeep"]);
  const {build} = await import("vite");
  build({configFile: join(__dirname, "vite.config.mts")}).then((res) => {
    doneLog(`web build success`);
    process.exit();
  });
}

function greeting() {
  const cols = process.stdout.columns;
  let text: boolean | string = "";

  if (cols > 85) text = `let's-build`;
  else if (cols > 60) text = `let's-|build`;
  else text = false;

  if (text && !isCI) {
    say(text, {
      colors: ["yellow"],
      font: "simple3d",
      space: false,
    });
  } else console.log(chalk.yellow.bold(`\n  let's-build`));
  console.log();
}
