// @ts-nocheck
const vscode = require('vscode');
function getProjectRootPath (document) {
	if (!document) {
		document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
	}
	if (!document) {
		this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
		return '';
	}
	const currentFile = (document.uri ? document.uri : document).fsPath;
	let projectPath = null;

	let workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
	// 存在Multi-root工作区，识别当前项目根目录。vscode.workspace.rootPath已经过时废弃了
	workspaceFolders.forEach(folder => {
		// console.log(currentFile, folder)
		if (currentFile.toLowerCase().indexOf(folder.toLowerCase().slice(1).replace(/\//g, '\\')) >= 0) {
			projectPath = folder;
		}
	})

	if (!projectPath) {
		this.showError('获取工程根路径异常！');
		return '';
	}
	return projectPath[0] === '/' ? projectPath.slice(1) : projectPath;
}

module.exports = {
	getProjectRootPath
}