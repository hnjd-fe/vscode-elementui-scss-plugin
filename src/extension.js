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
const VARIABLE_FILE_CACHE = require( './assets/scss-variable.json');

const CompletionObj = {
  /**
   * 获取@qax/qax-ui依赖npm包的文件路径
   * @param {*} document
   * @return
   * 返回安装@qax/qax-ui依赖npm包的文件路径
   */
  _getVariableFilePath(document) {
    let targetPath = TARGET_VARIABLE_DIR_STR;
    return targetPath;
  },
  _provideCompletionItems(document, position, token, context) {
    // 获取匹配字符串的位置

    const character = position.character;
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, character);

    if (character < 1) {
      return null;
    }

    const variableList = VARIABLE_FILE_CACHE;

    // 定义提示补全列表
    const options = variableList.map(s => {

      const offsetPosition = position.character - 1;
      const option = new vscode.CompletionItem(
        s,
        s.includes("#")
          ? vscode.CompletionItemKind.Color
          : vscode.CompletionItemKind.Variable
      );
      const range = new vscode.Range(
        line._line,
        lineText.indexOf("$", offsetPosition),
        line._line,
        lineText.length - 1
      );
      // console.clear();
      // console.log( line._line, lineText, position.line, position.character )
      option.insertText = s
        .slice(s.indexOf("$")).replace( /([:= ]).+/, '')
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
