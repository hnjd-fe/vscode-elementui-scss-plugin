const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// 路径片段分隔符
const OS_SEP = path.sep;
// @qax/qax-ui变量相对node_modules路径
const TARGET_VARIABLE_DIR_STR = 'node_modules/@qax/qax-ui/lib'.split('/').join(OS_SEP);
// @qax/qax-ui变量文件名
const TARGET_VARIABLE_FILE_STR = 'scss-variable';
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
    let currentDir = path.dirname(document.fileName);
    const dirArr = currentDir.split(OS_SEP);
    let len = dirArr.length;
    let targetPath = '';

    while (len--) {
      try {
        targetPath = `${currentDir}${OS_SEP}${TARGET_VARIABLE_DIR_STR}`;
        fs.accessSync(targetPath, fs.constants.R_OK);
        break;
      } catch (err) {
        dirArr.pop();
        currentDir = dirArr.join(OS_SEP);
      }
    }
    
    //TODO: 在yarn || npm 全局安装目录读取相关变量文件

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

    VARIABLE_FILE_CACHE[target_path] = {};
    if (fs.existsSync(jsFilename)) {
      const content = fs.readFileSync(jsFilename, 'utf8');
      VARIABLE_FILE_CACHE[target_path]['js'] = content
        .replace(/(.*)\n/g, function (m, g) {
          const result = /export const ([^;]*;$)/.exec(g)
          return result ? result[1] : '';
        })
        .split(';')
    }

    if (fs.existsSync(scssFilename)) {
      const content = fs.readFileSync(scssFilename, 'utf8');
      VARIABLE_FILE_CACHE[target_path]['scss'] = content
        .replace(/(.*)\n/g, function (m, g) {
          if (/\$--[^;]*;$/.test(g)) { return g; }
          else { return '' }
        })
        .split(';')
    }

  },
  _provideCompletionItems(document, position, token, context) {
    // 获取匹配字符串的位置
    const character = position.character
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, character);
    if (character < 3 || lineText.slice(character - 3, character - 1) !== `$${context.triggerCharacter}`) {
      return null
    }
    
    const targetPath = this._getVariableFilePath(document);
    if (!targetPath) {
      console.error('未安装 @qax/qax-ui');
      return null;
    }

    let targetType = 'scss';
    if (context.triggerCharacter === '_') {
      targetType = 'js';
    }
    const variableList = VARIABLE_FILE_CACHE[targetPath][targetType];

    // 定义提示补全列表
    const options = variableList.map(s => {
      const option = new vscode.CompletionItem(s, s.includes('#') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable);
      const range = new vscode.Range(line._line, lineText.indexOf('$'), line._line, lineText.length - 1);
      option.insertText = s.slice(s.indexOf('$'), targetType === 'scss' ? s.indexOf(':') : s.indexOf('=')).trim();
      option.range = {
        replacing: range,
        inserting: range
      }
      return option;
    });

    return options;
  }
}

function provideCompletionItems(document, position, token, context) {
  return CompletionObj._provideCompletionItems(document, position, token, context);
}
function resolveCompletionItem() {
  return null;
}

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function (context) {
    console.log('恭喜，vscode插件vscode-elementui-scss-plugin已被激活！');
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['vue', 'javascript', 'scss'], {
        provideCompletionItems,
        resolveCompletionItem
      }, '-', '_'));
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
    console.log('您的扩展vscode-elementui-scss-plugin已被释放！')
};