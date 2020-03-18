const vscode = require('vscode');

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function (context) {
    console.log('恭喜，vscode插件vscode-elementui-scss-plugin已被激活！');
    require('./completion')(context);
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
    console.log('您的扩展vscode-elementui-scss-plugin已被释放！')
};