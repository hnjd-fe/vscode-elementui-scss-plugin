const vscode = require('vscode');
const fs = require('fs');
const { getProjectRootPath } = require('./util')
let fileCache = {
  scss: null,
  js: null
}
function provideCompletionItems (document, position, token, context) {
  // console.log(document, position, token, context)
  // 获取匹配字符串的位置
  let matchJsOrScss = 'scss';
  const character = position.character
  const line = document.lineAt(position);
  const lineText = line.text.substring(0, character);
  if (context.triggerCharacter === '_') matchJsOrScss = 'js'
  if (character < 3 || lineText.slice(character - 3, character - 1) !== `$${context.triggerCharacter}`) return null

  // 读取文件
  if (!fileCache[matchJsOrScss]) {
    const fileContent = fs.readFileSync(`${getProjectRootPath(document)}/node_modules/@qax/qax-ui/lib/scss-variable.${matchJsOrScss}`, 'utf8')
    fileCache[matchJsOrScss] = fileContent
      .split(/\n/g)
      .map(s => s.trim())
      .filter(s => s && s[s.length - 1] === ';')

    if (matchJsOrScss === 'js') {
      fileCache[matchJsOrScss] = fileCache[matchJsOrScss].map(s => s.slice(s.indexOf('$')))
    }
  }

  // 定义提示补全列表
  const options = fileCache[matchJsOrScss].map(s => {
    const option = new vscode.CompletionItem(s, s.includes('#') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable)
    const range = new vscode.Range(line._line, lineText.indexOf('$'), line._line, lineText.length - 1)
    option.insertText = s.slice(s.indexOf('$'), matchJsOrScss === 'scss' ? s.indexOf(':') : s.indexOf('=')).trim()
    option.range = {
      replacing: range,
      inserting: range
    }
    return option
  })
  return options
}
function resolveCompletionItem () {
  return null
}

module.exports = function (context) {
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['vue', 'javascript', 'scss'], {
    provideCompletionItems,
    resolveCompletionItem
  }, '-', '_'));
};
