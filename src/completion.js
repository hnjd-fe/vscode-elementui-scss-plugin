const vscode = require('vscode');
const fs = require('fs');
const { getProjectRootPath } = require('./util')

function provideCompletionItems (document, position, token, context) {
  // console.log(document, position, token, context)
  // 获取匹配字符串的位置
  const line = document.lineAt(position);
  const lineText = line.text.substring(0, position.character);

  // 读取scss文件，暂时只获取根目录的index.scss，后续更新
  const scssPath = `${getProjectRootPath(document)}/index.scss`
  const scss = fs.readFileSync(scssPath, 'utf8')
  const scssArr = scss.split(/\n/g).map(s => s.trim()).filter(s => !!s && s.includes('$'))

  // 定义提示补全列表
  const options = scssArr.map(s => {
    const option = new vscode.CompletionItem(s, vscode.CompletionItemKind.Color)
    const range = new vscode.Range(line._line, lineText.indexOf('$'), line._line, lineText.length - 1)
    option.insertText = s.split(':')[0]
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
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['vue', 'scss'], {
    provideCompletionItems,
    resolveCompletionItem
  }, '$'));
};