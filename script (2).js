// Data state aplikasi
let appState = {
    currentQueue: {
        prefix: "A",
        number: "001",
        operator: "1"
    },
    selectedOperator: null,
    voiceEnabled: true,
    queueHistory: [
        {prefix: "A", number: "001", operator: "1"},
        {prefix: "B", number: "005", operator: "3"},
        {prefix: "C", number: "002", operator: "5"}
    ]
};

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Setup waktu real-time
    updateTime();
    setInterval(updateTime, 1000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Inisialisasi operator yang dipilih
    selectOperator(appState.currentQueue.operator);
    
    // Update tampilan antrian saat ini
    updateQueueDisplay();
    
    // Setup Web Speech API
    if ('speechSynthesis' in window) {
        console.log("Web Speech API tersedia");
    } else {
        alert("Browser tidak mendukung fitur suara. Mohon gunakan browser yang lebih baru.");
        document.getElementById('voice-status').textContent = "Tidak Didukung";
        document.getElementById('voice-status').style.color = "#dc3545";
        appState.voiceEnabled = false;
    }
});

// Update waktu real-time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('time-display').textContent = timeString;
}

// Setup semua event listeners
function setupEventListeners() {
    // Tombol set nomor antrian
    document.getElementById('set-queue-btn').addEventListener('click', setQueueNumber);
    
    // Tombol panggil antrian
    document.getElementById('call-queue-btn').addEventListener('click', callQueue);
    
    // Tombol tes suara
    document.getElementById('test-voice-btn').addEventListener('click', testVoice);
    
    // Pilih operator
    document.querySelectorAll('.operator-card').forEach(card => {
        card.addEventListener('click', function() {
            const operator = this.getAttribute('data-operator');
            selectOperator(operator);
        });
    });
    
    // Input nomor antrian hanya menerima angka
    document.getElementById('queue-number').addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 999) this.value = 999;
    });
}

// Set nomor antrian berdasarkan input
function setQueueNumber() {
    const prefix = document.getElementById('queue-prefix').value;
    const number = document.getElementById('queue-number').value;
    
    // Format nomor dengan leading zeros
    const formattedNumber = number.padStart(3, '0');
    
    appState.currentQueue.prefix = prefix;
    appState.currentQueue.number = formattedNumber;
    
    updateQueueDisplay();
    showNotification(`Nomor antrian diatur ke ${prefix}-${formattedNumber}`);
}

// Pilih operator
function selectOperator(operatorNumber) {
    // Reset semua operator
    document.querySelectorAll('.operator-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Tandai operator yang dipilih
    const selectedCard = document.querySelector(`.operator-card[data-operator="${operatorNumber}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        appState.selectedOperator = operatorNumber;
        appState.currentQueue.operator = operatorNumber;
        
        // Update tampilan operator saat ini
        document.getElementById('current-operator').textContent = `Operator: ${operatorNumber}`;
    }
}

// Update tampilan antrian
function updateQueueDisplay() {
    const queueString = `${appState.currentQueue.prefix}-${appState.currentQueue.number}`;
    document.getElementById('current-number').textContent = queueString;
}

// Panggil antrian dengan suara
function callQueue() {
    if (!appState.selectedOperator) {
        showNotification("Pilih operator terlebih dahulu!", "error");
        return;
    }
    
    // Update tampilan antrian saat ini
    updateQueueDisplay();
    document.getElementById('current-operator').textContent = `Operator: ${appState.selectedOperator}`;
    
    // Tambahkan ke riwayat
    addToHistory();
    
    // Panggil dengan suara
    if (appState.voiceEnabled) {
        speakQueue();
    }
    
    // Animasi tombol panggil
    const callBtn = document.getElementById('call-queue-btn');
    callBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        callBtn.style.transform = 'scale(1)';
    }, 150);
    
    showNotification(`Memanggil antrian ${appState.currentQueue.prefix}-${appState.currentQueue.number} ke Operator ${appState.selectedOperator}`);
}

// Fungsi untuk membacakan antrian dengan suara
function speakQueue() {
    // Hapus semua antrian suara yang sedang berlangsung
    speechSynthesis.cancel();
    
    // Buat teks yang akan diucapkan
    const queueText = `${appState.currentQueue.prefix} ${appState.currentQueue.number}`;
    const operatorText = `Operator ${appState.selectedOperator}`;
    const fullText = `Nomor antrian ${queueText}, silakan menuju ke ${operatorText}`;
    
    // Buat utterance
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Pilih suara wanita jika tersedia
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.lang.includes('id') || voice.lang.includes('ID')
    );
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    // Event ketika suara selesai
    utterance.onend = function() {
        console.log("Panggilan suara selesai");
    };
    
    // Mulai berbicara
    speechSynthesis.speak(utterance);
}

// Tambahkan antrian ke riwayat
function addToHistory() {
    // Tambahkan ke array riwayat
    appState.queueHistory.unshift({
        prefix: appState.currentQueue.prefix,
        number: appState.currentQueue.number,
        operator: appState.selectedOperator
    });
    
    // Batasi riwayat hanya 3 item terbaru
    if (appState.queueHistory.length > 3) {
        appState.queueHistory = appState.queueHistory.slice(0, 3);
    }
    
    // Update tampilan riwayat
    updateHistoryDisplay();
}

// Update tampilan riwayat
function updateHistoryDisplay() {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';
    
    appState.queueHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${item.prefix}-${item.number} → Operator ${item.operator}`;
        historyList.appendChild(historyItem);
    });
}

// Tes suara
function testVoice() {
    if (!appState.voiceEnabled) {
        showNotification("Fitur suara tidak didukung di browser ini", "error");
        return;
    }
    
    // Hapus semua antrian suara
    speechSynthesis.cancel();
    
    // Buat tes suara
    const testText = "Ini adalah tes suara dari sistem antrian SPMB SMA Negeri 1 Magetan. Suara berfungsi dengan baik.";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    
    // Pilih suara wanita jika tersedia
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.lang.includes('id') || voice.lang.includes('ID')
    );
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    // Mulai berbicara
    speechSynthesis.speak(utterance);
    
    showNotification("Sedang memutar suara tes...");
}

// Tampilkan notifikasi
function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    // Set pesan dan warna notifikasi
    notificationText.textContent = message;
    
    if (type === "error") {
        notification.style.backgroundColor = "#dc3545";
    } else {
        notification.style.backgroundColor = "#28a745";
    }
    
    // Tampilkan notifikasi
    notification.classList.add('show');
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Handle perubahan suara jika browser memuat suara asinkron
let voicesChanged = false;
speechSynthesis.onvoiceschanged = function() {
    if (!voicesChanged) {
        voicesChanged = true;
        console.log("Daftar suara telah dimuat:", speechSynthesis.getVoices().length, "suara tersedia");
    }
};