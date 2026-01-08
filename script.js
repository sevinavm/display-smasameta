// Data Aplikasi Antrian
let queueData = {
    lastQueueNumber: 0,
    waitingQueues: [],
    servedQueues: [],
    currentQueue: null,
    operators: [
        { id: 1, name: "Operator 1", status: "available", currentQueue: null, servedCount: 0 },
        { id: 2, name: "Operator 2", status: "available", currentQueue: null, servedCount: 0 },
        { id: 3, name: "Operator 3", status: "available", currentQueue: null, servedCount: 0 },
        { id: 4, name: "Operator 4", status: "available", currentQueue: null, servedCount: 0 },
        { id: 5, name: "Operator 5", status: "available", currentQueue: null, servedCount: 0 },
        { id: 6, name: "Operator 6", status: "available", currentQueue: null, servedCount: 0 },
        { id: 7, name: "Operator 7", status: "available", currentQueue: null, servedCount: 0 },
        { id: 8, name: "Operator 8", status: "available", currentQueue: null, servedCount: 0 }
    ]
};

// Inisialisasi Speech Synthesis
let speechSynth = window.speechSynthesis;
let voices = [];
let femaleVoice = null;

// Elemen DOM
const currentQueueNumberEl = document.getElementById('current-queue-number');
const currentQueueOperatorEl = document.getElementById('current-queue-operator');
const totalQueueEl = document.getElementById('total-queue');
const servedQueueEl = document.getElementById('served-queue');
const waitingQueueEl = document.getElementById('waiting-queue');
const operatorsContainerEl = document.getElementById('operators-container');
const operatorSelectEl = document.getElementById('operator-select');
const queueNumberInputEl = document.getElementById('queue-number');
const addQueueBtn = document.getElementById('add-queue-btn');
const callQueueBtn = document.getElementById('call-queue-btn');
const resetBtn = document.getElementById('reset-btn');
const queueTableBodyEl = document.getElementById('queue-table-body');
const emptyQueueMessageEl = document.getElementById('empty-queue-message');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const voiceVolumeEl = document.getElementById('voice-volume');
const voiceRateEl = document.getElementById('voice-rate');
const volumeValueEl = document.getElementById('volume-value');
const rateValueEl = document.getElementById('rate-value');
const voiceTestBtn = document.getElementById('voice-test-btn');
const callSoundEl = document.getElementById('call-sound');
const connectionStatusEl = document.getElementById('connection-status');

// Format nomor antrian
function formatQueueNumber(number) {
    return `A${number.toString().padStart(3, '0')}`;
}

// Generate nomor antrian berikutnya
function generateNextQueueNumber() {
    queueData.lastQueueNumber++;
    return formatQueueNumber(queueData.lastQueueNumber);
}

// Update tampilan antrian
function updateQueueDisplay() {
    // Update antrian saat ini
    if (queueData.currentQueue) {
        currentQueueNumberEl.textContent = queueData.currentQueue.number;
        currentQueueOperatorEl.textContent = `Operator: ${queueData.currentQueue.operator}`;
    } else {
        currentQueueNumberEl.textContent = '--';
        currentQueueOperatorEl.textContent = 'Operator: --';
    }
    
    // Update statistik
    const totalQueues = queueData.waitingQueues.length + queueData.servedQueues.length;
    totalQueueEl.textContent = totalQueues;
    servedQueueEl.textContent = queueData.servedQueues.length;
    waitingQueueEl.textContent = queueData.waitingQueues.length;
    
    // Update tabel antrian
    updateQueueTable();
    
    // Update panel operator
    updateOperatorPanels();
    
    // Tampilkan pesan jika tidak ada antrian
    if (queueData.waitingQueues.length === 0) {
        emptyQueueMessageEl.style.display = 'block';
        queueTableBodyEl.innerHTML = '';
    } else {
        emptyQueueMessageEl.style.display = 'none';
    }
}

// Update tabel antrian
function updateQueueTable() {
    queueTableBodyEl.innerHTML = '';
    
    queueData.waitingQueues.forEach((queue, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${queue.number}</strong></td>
            <td>${queue.operator}</td>
            <td>${queue.time}</td>
            <td><span class="queue-status status-waiting">Menunggu</span></td>
            <td><button class="action-btn" onclick="callSpecificQueue(${index})">Panggil</button></td>
        `;
        
        queueTableBodyEl.appendChild(row);
    });
    
    // Tambahkan antrian yang sudah dilayani
    queueData.servedQueues.slice(-5).forEach(queue => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${queueData.waitingQueues.length + queueData.servedQueues.indexOf(queue) + 1}</td>
            <td><strong>${queue.number}</strong></td>
            <td>${queue.operator}</td>
            <td>${queue.time}</td>
            <td><span class="queue-status status-served">Selesai</span></td>
            <td><button class="action-btn" disabled>Selesai</button></td>
        `;
        
        queueTableBodyEl.appendChild(row);
    });
}

// Update panel operator
function updateOperatorPanels() {
    operatorsContainerEl.innerHTML = '';
    
    queueData.operators.forEach(operator => {
        const operatorPanel = document.createElement('div');
        operatorPanel.className = `operator-panel ${operator.status}`;
        
        // Tentukan status operator
        let statusClass = operator.status === 'available' ? 'status-available' : 'status-busy';
        let statusText = operator.status === 'available' ? 'Tersedia' : 'Sedang Melayani';
        
        operatorPanel.innerHTML = `
            <div class="operator-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="operator-name">${operator.name}</div>
            <div class="