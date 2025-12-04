// utils/qris.js

export function crc16ccitt(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc = crc & 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function convertQris(payload, amount) {
    // 1. Validasi sederhana
    if (!payload || !amount) throw new Error("Payload dan Amount harus diisi");

    let p = payload.trim();
    
    // 2. Parse TLV
    const items = [];
    let pos = 0;
    while (pos < p.length) {
        const id = p.substr(pos, 2);
        const lenStr = p.substr(pos + 2, 2);
        const len = parseInt(lenStr, 10);
        if (isNaN(len)) break;
        const val = p.substr(pos + 4, len);
        items.push({ id, val });
        pos += 4 + len;
    }

    // 3. Modifikasi Data
    // Filter CRC lama (63)
    let newItems = items.filter(x => x.id !== '63');

    // Ubah Tag 01 (Point of Initiation) jadi 12 (Dynamic)
    const idx01 = newItems.findIndex(x => x.id === '01');
    if (idx01 >= 0) newItems[idx01].val = '12';

    // Tambah/Update Tag 54 (Amount)
    const amountStr = parseFloat(amount).toFixed(2);
    const tag54 = { id: '54', val: amountStr };
    
    // Cek posisi tag 53 (Currency) biar rapi, taruh 54 setelahnya
    const idx53 = newItems.findIndex(x => x.id === '53');
    const idx54 = newItems.findIndex(x => x.id === '54');

    if (idx54 >= 0) {
        newItems[idx54] = tag54;
    } else if (idx53 >= 0) {
        newItems.splice(idx53 + 1, 0, tag54);
    } else {
        newItems.push(tag54);
    }

    // Sort agar ID urut (Optional, tapi standard EMVCo menyarankan)
    newItems.sort((a, b) => a.id.localeCompare(b.id));

    // 4. Rebuild String
    let body = "";
    for(let item of newItems) {
        const len = item.val.length.toString().padStart(2, '0');
        body += item.id + len + item.val;
    }

    // 5. Hitung CRC Baru
    const crc = crc16ccitt(body + "6304");
    
    return body + "6304" + crc;
}
