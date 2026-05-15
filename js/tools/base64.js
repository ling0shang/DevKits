function b64Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}
function b64Decode(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
}

window.renderBase64Tool = function(container) {
    container.innerHTML = `
        <div class="tool-card">
            <div class="card-header"><i class="fas fa-lock"></i><h2>Base64 编解码器</h2></div>
            <div class="card-body">
                <div class="input-group"><label>📥 原始文本</label><textarea id="b64-plain" rows="3" placeholder="要编码的文本"></textarea></div>
                <div class="button-group"><button id="b64-encode" class="btn btn-primary">➡️ 编码为Base64</button><button id="copy-encoded" class="btn btn-outline">📋 复制Base64</button></div>
                <div class="input-group"><label>🔑 Base64 字符串</label><textarea id="b64-cipher" rows="3" placeholder="粘贴Base64"></textarea></div>
                <div class="button-group"><button id="b64-decode" class="btn btn-primary">⬅️ 解码为文本</button><button id="copy-decoded" class="btn btn-outline">📋 复制原文</button></div>
                <div class="input-group"><label>📋 结果预览</label><textarea id="b64-result" rows="3" readonly></textarea></div>
                <div class="info-note">🔐 使用 UTF-8 字符集，支持所有 Unicode（含 emoji）。</div>
            </div>
        </div>
    `;
    const plain = document.getElementById('b64-plain');
    const cipher = document.getElementById('b64-cipher');
    const result = document.getElementById('b64-result');

    document.getElementById('b64-encode').onclick = () => {
        try { 
            const encoded = b64Encode(plain.value);
            result.value = encoded;
            cipher.value = encoded;
        } catch(e) { result.value = `编码错误: ${e.message}`; }
    };
    document.getElementById('b64-decode').onclick = () => {
        try { 
            const decoded = b64Decode(cipher.value);
            result.value = decoded;
            plain.value = decoded;
        } catch(e) { result.value = `解码失败: ${e.message}`; }
    };
    document.getElementById('copy-encoded').onclick = () => ToolHelper.copyToClipboard(result.value, 'Base64已复制');
    document.getElementById('copy-decoded').onclick = () => ToolHelper.copyToClipboard(result.value, '原文已复制');

    plain.value = 'Hello 开发者 🌟 欢迎使用！';
    document.getElementById('b64-encode').click();
};