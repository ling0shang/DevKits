window.renderTrimTool = function(container) {
    container.innerHTML = `
        <div class="tool-card">
            <div class="card-header"><i class="fas fa-eraser"></i><h2>字符串空白净化器</h2></div>
            <div class="card-body">
                <div class="input-group"><label>📌 原始文本</label><textarea id="trim-original" rows="5" placeholder="包含多余空格、换行、制表符..."></textarea></div>
                <div class="button-group">
                    <button id="trim-both" class="btn btn-primary">🎯 去除首尾空格</button>
                    <button id="trim-all" class="btn btn-outline">🌀 移除所有空白</button>
                    <button id="trim-extra" class="btn btn-outline">✨ 规范化空格(合并多个)</button>
                </div>
                <div class="input-group"><label>✨ 处理结果</label><textarea id="trim-result" rows="4" readonly></textarea></div>
                <div class="button-group"><button id="copy-result" class="btn btn-success">📋 复制结果</button></div>
                <div class="info-note">✔ 去除首尾: trim 掉前后空白<br>✔ 移除所有空白: 删除空格/换行/制表符等<br>✔ 规范化: 合并连续空白为单个空格并trim</div>
            </div>
        </div>
    `;
    const original = document.getElementById('trim-original');
    const resultArea = document.getElementById('trim-result');

    const update = (val) => { resultArea.value = val; };
    document.getElementById('trim-both').onclick = () => update(original.value.trim());
    document.getElementById('trim-all').onclick = () => update(original.value.replace(/\s+/g, ''));
    document.getElementById('trim-extra').onclick = () => update(original.value.trim().replace(/\s+/g, ' '));
    document.getElementById('copy-result').onclick = () => ToolHelper.copyToClipboard(resultArea.value, '净化结果已复制');

    original.value = "   多个  空格  和  换行  \n  测试  \n  字符串   ";
    document.getElementById('trim-both').click();
};