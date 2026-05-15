// 路由表：工具名 -> 模块文件路径 & 渲染函数名
const toolModules = {
    encoding: {
        js: 'js/tools/encoding.js',
        init: 'renderEncodingTool'
    },
    trim: {
        js: 'js/tools/trim.js',
        init: 'renderTrimTool'
    },
    base64: {
        js: 'js/tools/base64.js',
        init: 'renderBase64Tool'
    }
};

let currentTool = null;
const contentEl = document.getElementById('dynamic-content');

// 加载并渲染指定工具
async function loadTool(toolId) {
    if (!toolModules[toolId]) return;

    // 高亮菜单
    document.querySelectorAll('.tool-nav li').forEach(li => {
        li.classList.remove('active');
        if (li.dataset.tool === toolId) li.classList.add('active');
    });

    // 显示加载中
    contentEl.innerHTML = `<div class="loading-placeholder"><i class="fas fa-spinner fa-pulse"></i> 加载 ${toolId} 工具...</div>`;

    try {
        const mod = toolModules[toolId];
        // 如果模块还未加载，动态导入
        if (!window[toolId + 'Module']) {
            await ToolHelper.loadScript(mod.js);
        }
        // 调用对应工具的渲染函数（全局挂载）
        const renderFn = window[mod.init];
        if (typeof renderFn === 'function') {
            renderFn(contentEl);
            currentTool = toolId;
        } else {
            throw new Error(`渲染函数 ${mod.init} 未找到`);
        }
    } catch (err) {
        console.error(err);
        contentEl.innerHTML = `<div class="loading-placeholder" style="color:red;">加载失败: ${err.message}</div>`;
        ToolHelper.showToast('工具加载失败', 2000);
    }
}

// 监听菜单点击
document.querySelectorAll('.tool-nav li').forEach(li => {
    li.addEventListener('click', () => {
        const toolId = li.dataset.tool;
        if (toolId) loadTool(toolId);
    });
});

// 初始化默认工具（encoding）
loadTool('encoding');