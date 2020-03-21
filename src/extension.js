const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve( __dirname, '..');

// 路径片段分隔符
const OS_SEP = path.sep;
// @qax/qax-ui变量相对node_modules路径
const TARGET_VARIABLE_DIR_STR = path.resolve( ROOT, 'src/assets')
  .split("/")
  .join(OS_SEP);
// @qax/qax-ui变量文件名
const TARGET_VARIABLE_FILE_STR = "scss-variable";
// 变量内容缓存map
const VARIABLE_FILE_CACHE = {};

const CompletionObj = {
  /**
   * 获取@qax/qax-ui依赖npm包的文件路径
   * @param {*} document
   * @return
   * 返回安装@qax/qax-ui依赖npm包的文件路径
   */
  _getVariableFilePath(document) {
    let targetPath = TARGET_VARIABLE_DIR_STR;
    if (targetPath && !VARIABLE_FILE_CACHE[targetPath]) {
      this._setVariableCache(targetPath);
    }
    return targetPath;
  },
  /**
   * 设置qax-ui主题变量缓存
   * @param {*} target_path @qax/qax-ui依赖npm包的文件路径
   */
  _setVariableCache(target_path) {
    const jsFilename = `${target_path}${OS_SEP}${TARGET_VARIABLE_FILE_STR}.js`;
    const scssFilename = `${target_path}${OS_SEP}${TARGET_VARIABLE_FILE_STR}.scss`;

    VARIABLE_FILE_CACHE[target_path] = [];
    if (fs.existsSync(jsFilename)) {
      const content = fs.readFileSync(jsFilename, "utf8");
      VARIABLE_FILE_CACHE[target_path].push(...content
        .replace(/(.*)\n/g, function(m, g) {
          const result = /export const ([^;]*;$)/.exec(g);
          return result ? result[1] : "";
        })
        .split(";"));
    }

    if (fs.existsSync(scssFilename)) {
      const content = fs.readFileSync(scssFilename, "utf8");
      VARIABLE_FILE_CACHE[target_path].push(...content
        .replace(/(.*)\n/g, function(m, g) {
          if (/\$--[^;]*;$/.test(g)) {
            return g;
          } else {
            return "";
          }
        })
        .split(";"));
    }
  },
  _provideCompletionItems(document, position, token, context) {
    // 获取匹配字符串的位置

    const character = position.character;
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, character);

    const editor = vscode.window.activeTextEditor;

    const positionx = editor.selection.active;
    if (
      character < 1
    ) {
      return null;
    }

    console.clear();
    console.log( position.line, position.character, lineText )
    console.log(  context.triggerCharacter, positionx )

    const targetPath = this._getVariableFilePath(document);

    const variableList = VARIABLE_FILE_CACHE[targetPath];

    console.log( position )

    // 定义提示补全列表
    const options = variableList.map(s => {
      const option = new vscode.CompletionItem(
        s,
        s.includes("#")
          ? vscode.CompletionItemKind.Color
          : vscode.CompletionItemKind.Variable
      );
      const range = new vscode.Range(
        line._line,
        lineText.lastIndexOf("$"),
        line._line,
        lineText.length - 1
      );
      console.clear();
      console.log( line._line, lineText )
      option.insertText = s
        .slice(s.lastIndexOf("$")).replace( /([:= ]).+/, '')
        .trim();
      option.range = {
        replacing: range,
        inserting: range
      };
      return option;
    });

    return options;
  }
};

function provideCompletionItems(document, position, token, context) {
  return CompletionObj._provideCompletionItems(
    document,
    position,
    token,
    context
  );
}
function resolveCompletionItem() {
  return null;
}

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function(context) {
  console.log("恭喜，vscode插件vscode-elementui-scss-plugin已被激活！");
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ["vue", "javascript", "scss"],
      {
        provideCompletionItems,
        resolveCompletionItem
      },
      "$"
    )
  );
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function() {
  console.log("您的扩展vscode-elementui-scss-plugin已被释放！");
};
