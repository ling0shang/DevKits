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
    // 高亮子菜单项
    document.querySelectorAll('.submenu li').forEach(li => {
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
// 处理一级菜单折叠/展开
function toggleParentMenu(parentLi) {
    parentLi.classList.toggle('open');
}

// 事件委托绑定（避免刷新后失效）
document.querySelector('.tool-nav').addEventListener('click', (e) => {
    // 处理子菜单项点击（工具切换）
    const submenuItem = e.target.closest('.submenu li');
    if (submenuItem && submenuItem.dataset.tool) {
        const toolId = submenuItem.dataset.tool;
        loadTool(toolId);
        e.stopPropagation();
        return;
    }

    // 处理一级菜单折叠/展开
    const menuItemDiv = e.target.closest('.menu-item');
    if (menuItemDiv) {
        const parentLi = menuItemDiv.closest('.menu-parent');
        if (parentLi) {
            toggleParentMenu(parentLi);
            e.stopPropagation();
        }
    }
});

// 初始化：默认展开第一个分组，并加载默认工具（如 encoding）
document.addEventListener('DOMContentLoaded', () => {
    const firstParent = document.querySelector('.menu-parent');
    if (firstParent) firstParent.classList.add('open');
    loadTool('encoding'); // 默认加载字符编码转换
});

// 监听菜单点击
document.querySelectorAll('.tool-nav li').forEach(li => {
    li.addEventListener('click', () => {
        const toolId = li.dataset.tool;
        if (toolId) loadTool(toolId);
    });
});

// 初始化默认工具（encoding）
loadTool('encoding');