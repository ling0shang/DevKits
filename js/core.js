// 全局工具函数
window.ToolHelper = (function() {
    // 显示漂浮提示
    function showToast(msg, duration = 1500) {
        let toast = document.querySelector('.global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'global-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, duration);
    }

    // 复制文本到剪贴板
    async function copyToClipboard(text, successMsg = '已复制') {
        if (!text && text !== '') {
            showToast('没有内容可复制', 1000);
            return false;
        }
        try {
            await navigator.clipboard.writeText(text);
            showToast(`✓ ${successMsg}`, 1200);
            return true;
        } catch (err) {
            showToast('复制失败，请手动复制', 1500);
            return false;
        }
    }

    // 动态加载脚本 (返回Promise)
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`加载失败: ${src}`));
            document.body.appendChild(script);
        });
    }

    return {
        showToast,
        copyToClipboard,
        loadScript
    };
})();

// 在 core.js 中定义
window.ToolHelper.supportedEncodings = [
    'UTF-8', 'UTF-16LE', 'UTF-16BE', 'GBK', 'BIG5', 'GB2312', 'ISO-8859-1'
];