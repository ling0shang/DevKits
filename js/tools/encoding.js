
// 编码核心函数
function utf8EncodeToHex(str) {
    const bytes = new TextEncoder().encode(str);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
function utf8DecodeFromHex(hex) {
    const clean = hex.replace(/\s/g, '');
    if (clean.length % 2) throw new Error('Hex长度奇数');
    const bytes = new Uint8Array(clean.match(/.{2}/g).map(b => parseInt(b, 16)));
    return new TextDecoder('utf-8').decode(bytes);
}

// UTF-16 辅助
function stringToUtf16Bytes(str, littleEndian) {
    const buf = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF && i+1 < str.length) {
            const next = str.charCodeAt(i+1);
            if (next >= 0xDC00 && next <= 0xDFFF) {
                const sp = ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
                const high = (sp >> 16) & 0xFFFF;
                const low = sp & 0xFFFF;
                if (littleEndian) {
                    buf.push(high & 0xFF, (high>>8)&0xFF, low & 0xFF, (low>>8)&0xFF);
                } else {
                    buf.push((high>>8)&0xFF, high & 0xFF, (low>>8)&0xFF, low & 0xFF);
                }
                i++;
                continue;
            }
        }
        if (littleEndian) {
            buf.push(code & 0xFF, (code>>8)&0xFF);
        } else {
            buf.push((code>>8)&0xFF, code & 0xFF);
        }
    }
    return buf;
}
function utf16BytesToString(bytes, littleEndian) {
    if (bytes.length % 2) throw new Error('奇数长度');
    const codes = [];
    for (let i=0; i<bytes.length; i+=2) {
        let low = bytes[i], high = bytes[i+1];
        if (!littleEndian) { [low, high] = [high, low]; }
        codes.push((high << 8) | low);
    }
    let res = '';
    for (let i=0; i<codes.length; i++) {
        if (codes[i] >= 0xD800 && codes[i] <= 0xDBFF && i+1 < codes.length && codes[i+1] >= 0xDC00 && codes[i+1] <= 0xDFFF) {
            const full = ((codes[i] - 0xD800) * 0x400) + (codes[i+1] - 0xDC00) + 0x10000;
            res += String.fromCodePoint(full);
            i++;
        } else {
            res += String.fromCharCode(codes[i]);
        }
    }
    return res;
}
function utf16EncodeToHex(str, scheme) {
    const little = scheme === 'UTF-16LE';
    const bytes = stringToUtf16Bytes(str, little);
    return bytes.map(b => b.toString(16).padStart(2,'0')).join('');
}
function utf16DecodeFromHex(hex, scheme) {
    const clean = hex.replace(/\s/g, '');
    if (clean.length % 2) throw new Error('Hex奇数');
    const bytes = clean.match(/.{2}/g).map(b => parseInt(b,16));
    const little = scheme === 'UTF-16LE';
    return utf16BytesToString(bytes, little);
}

// 统一接口
// 编码：将 JS 字符串 (UTF-16) 转换为指定编码的十六进制字符串
function encodeText(text, scheme) {
    if (scheme === 'UTF-8' || scheme === 'UTF-16LE' || scheme === 'UTF-16BE') {
        // 对于这些标准编码，保留原生方法或由 iconv-lite 统一处理，这里举例统一处理
        const buffer = window.iconv.encode(text, scheme);
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // GBK, BIG5, etc. 使用 iconv-lite
        const buffer = window.iconv.encode(text, scheme);
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// 解码：将十六进制字符串转换为 JS 字符串
function decodeHex(hexStr, scheme) {
    const cleanHex = hexStr.replace(/\s/g, '');
    if (cleanHex.length % 2 !== 0) throw new Error('Hex 字符串长度必须为偶数');
    const bytes = new Uint8Array(cleanHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    if (scheme === 'UTF-8' || scheme === 'UTF-16LE' || scheme === 'UTF-16BE') {
        // 可以使用原生方式
        return new TextDecoder(scheme.toLowerCase()).decode(bytes);
    } else {
        // GBK, BIG5, etc. 使用 iconv-lite
        return window.iconv.decode(Buffer.from(bytes), scheme);
    }
}
// function encodeText(text, scheme) {
//     if (scheme === 'UTF-8') return utf8EncodeToHex(text);
//     if (scheme === 'UTF-16LE' || scheme === 'UTF-16BE') return utf16EncodeToHex(text, scheme);
//     throw new Error('未知方案');
// }
// function decodeHex(hex, scheme) {
//     if (scheme === 'UTF-8') return utf8DecodeFromHex(hex);
//     if (scheme === 'UTF-16LE' || scheme === 'UTF-16BE') return utf16DecodeFromHex(hex, scheme);
//     throw new Error('未知方案');
// }

// 渲染UI
window.renderEncodingTool = function(container) {
    container.innerHTML = `
        <div class="tool-card">
            <div class="card-header"><i class="fas fa-exchange-alt"></i>
                <h2>字符编码转换器</h2>
            </div>
            <div class="card-body">
                <div class="input-group"><label>📝 原始文本</label><textarea id="enc-text" rows="3" placeholder="输入文本，支持中文、emoji"></textarea></div>
                <div class="flex-row">
                    <div>
                        <label>编码方案</label>
                        <select id="enc-scheme">
                            <option value="UTF-8">UTF-8</option>
                            <option value="UTF-16LE">UTF-16LE</option>
                            <option value="UTF-16BE">UTF-16BE</option>
                            <option value="GBK">GBK</option> <!-- 新增 -->
                            <option value="BIG5">BIG5</option> <!-- 新增 -->
                            <!-- 未来可按需增加，如 'GB2312', 'ISO-8859-1' 等 -->
                        </select>
                    </div>
                    <button id="do-encode" class="btn btn-primary">🔐 编码 → Hex</button><button id="copy-hex" class="btn btn-outline">📋 复制Hex</button>
                </div>
                <!-- 已添加灰色不可修改样式 -->
                <div class="input-group"><label>🔢 Hex 结果</label><textarea id="enc-result" rows="2" readonly style="background:#e9ecef; color:#495057; cursor:not-allowed; opacity:0.9; border:1px solid #ced4da;"></textarea></div>
                <hr>
                <div class="input-group"><label>🔁 Hex 解码</label><textarea id="dec-hex" rows="2" placeholder="粘贴十六进制"></textarea>
                    <div class="flex-row">
                        <div><label>解码方案</label>
                        <select id="dec-scheme">
                                <option>UTF-8</option>
                                <option>UTF-16LE</option>
                                <option>UTF-16BE</option>
                                <option value="GBK">GBK</option> <!-- 新增 -->
                                <option value="BIG5">BIG5</option> <!-- 新增 -->
                                <!-- 未来可按需增加，如 'GB2312', 'ISO-8859-1' 等 -->
                        </select>
                        </div>
                        <button id="do-decode" class="btn btn-primary">🔓 解码 → 文本</button><button id="copy-text" class="btn btn-outline">📋 复制文本</button>
                    </div>
                </div>
                <!-- 已添加灰色不可修改样式 -->
                <div class="input-group"><label>📄 解码结果</label><textarea id="dec-result" rows="2" readonly style="background:#e9ecef; color:#495057; cursor:not-allowed; opacity:0.9; border:1px solid #ced4da;"></textarea></div>
                <div class="info-note">💡 支持 UTF-8 / UTF-16LE / UTF-16BE，编解码均在本地完成。</div>
            </div>
        </div>
    `;

    const textarea = document.getElementById('enc-text');
    const schemeSel = document.getElementById('enc-scheme');
    const hexOut = document.getElementById('enc-result');
    const decHex = document.getElementById('dec-hex');
    const decScheme = document.getElementById('dec-scheme');
    const decOut = document.getElementById('dec-result');

    document.getElementById('do-encode').onclick = () => {
        try {
            const hex = encodeText(textarea.value, schemeSel.value);
            hexOut.value = hex;
            decHex.value = hex;   // 自动填充解码区
        } catch(e) { hexOut.value = `错误: ${e.message}`; }
    };
    document.getElementById('do-decode').onclick = () => {
        try {
            const text = decodeHex(decHex.value, decScheme.value);
            decOut.value = text;
        } catch(e) { decOut.value = `解码失败: ${e.message}`; }
    };
    document.getElementById('copy-hex').onclick = () => ToolHelper.copyToClipboard(hexOut.value, 'Hex已复制');
    document.getElementById('copy-text').onclick = () => ToolHelper.copyToClipboard(decOut.value, '文本已复制');

    // 示例数据
    textarea.value = 'Hello 世界 🌍 你好';
    document.getElementById('do-encode').click();
};