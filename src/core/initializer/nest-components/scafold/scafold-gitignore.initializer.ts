import * as path from "path"
import {
  writePlainFile
} from "../../../../core"

export class ScafoldGitIgnoreInitializer {

  static async loadGitIgnore() {

    const envFile = `
    /dist
    /node_modules

    logs
    *.log
    npm-debug.log*
    pnpm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    lerna-debug.log*

    .DS_Store

    /coverage
    /.nyc_output

    .env

    /.idea
    .project
    .classpath
    .c9/
    *.launch
    .settings/
    *.sublime-workspace

    .vscode/*
    !.vscode/settings.json
    !.vscode/tasks.json
    !.vscode/launch.json
    !.vscode/extensions.json
    `

    await writePlainFile(envFile.split(" ").join(""), path.resolve(process.cwd(), `./.gitignore`))
  }
}