// Global variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentUnit = 'metric';

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Initialize section-specific data
    if (sectionId === 'todo-manager') {
        renderTodos();
        updateStats();
    }
}
// Format number to Vietnamese currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
}
// Tax Calculator Functions
function calculateTax() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;

    if (monthlyIncome <= 0) {
        alert('Vui lòng nhập thu nhập hợp lệ!');
        return;
    }

    const personalDeduction = 11000000;
    const dependentDeduction = 4400000;

    const totalDeductions = personalDeduction + (dependents * dependentDeduction) + insurance;
    const taxableIncome = Math.max(0, monthlyIncome - totalDeductions);

    let tax = 0;
    const brackets = [
        { min: 0, max: 5000000, rate: 0.05 },
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000000, max: 18000000, rate: 0.15 },
        { min: 18000000, max: 32000000, rate: 0.20 },
        { min: 32000000, max: 52000000, rate: 0.25 },
        { min: 52000000, max: 80000000, rate: 0.30 },
        { min: 80000000, max: Infinity, rate: 0.35 }
    ];

    for (let bracket of brackets) {
        if (taxableIncome > bracket.min) {
            const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
            tax += taxableAtBracket * bracket.rate;
        }
    }

    const netIncome = monthlyIncome - tax;

    document.getElementById('taxableIncome').textContent = formatCurrency(taxableIncome);
    document.getElementById('taxAmount').textContent = formatCurrency(tax);
    document.getElementById('netIncome').textContent = formatCurrency(netIncome);
    document.getElementById('taxResult').classList.add('show');
}

// Loan Calculator Functions
function calculateLoan() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const termMonths = parseInt(document.getElementById('loanTerm').value) || 0;
    const paymentType = document.getElementById('paymentType').value;

    if (loanAmount <= 0 || annualRate <= 0 || termMonths <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    let monthlyPayment, totalInterest, totalPayment;

    if (paymentType === 'equal') {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1);
        totalPayment = monthlyPayment * termMonths;
        totalInterest = totalPayment - loanAmount;
    } else {
        const principalPayment = loanAmount / termMonths;
        totalInterest = 0;
        for (let i = 0; i < termMonths; i++) {
            const remainingPrincipal = loanAmount - (principalPayment * i);
            totalInterest += remainingPrincipal * monthlyRate;
        }
        monthlyPayment = principalPayment + (loanAmount * monthlyRate);
        totalPayment = loanAmount + totalInterest;
    }

    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('loanResult').classList.add('show');
}

// Savings Calculator Functions
function calculateSavings() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const annualRate = parseFloat(document.getElementById('savingsRate').value) || 0;
    const termMonths = parseInt(document.getElementById('savingsTerm').value) || 0;
    const compoundType = document.getElementById('compoundType').value;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
        return;
    }

    let totalAmount, interestEarned;

    if (compoundType === 'simple') {
        interestEarned = principal * (annualRate / 100) * (termMonths / 12);
        totalAmount = principal + interestEarned;
    } else {
        const monthlyRate = annualRate / 100 / 12;
        totalAmount = principal * Math.pow(1 + monthlyRate, termMonths);
        interestEarned = totalAmount - principal;
    }

    const monthlyInterest = interestEarned / termMonths;

    document.getElementById('interestEarned').textContent = formatCurrency(interestEarned);
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('monthlyInterest').textContent = formatCurrency(monthlyInterest);
    document.getElementById('savingsResult').classList.add('show');
}

// BMI Calculator Functions
function switchUnit(unit) {
    currentUnit = unit;

    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (unit === 'metric') {
        document.getElementById('metricInputs').style.display = 'block';
        document.getElementById('imperialInputs').style.display = 'none';
    } else {
        document.getElementById('metricInputs').style.display = 'none';
        document.getElementById('imperialInputs').style.display = 'block';
    }

    document.getElementById('bmiResult').classList.remove('show');
}

function calculateBMI() {
    let height, weight;

    if (currentUnit === 'metric') {
        height = parseFloat(document.getElementById('height').value);
        weight = parseFloat(document.getElementById('weight').value);

        if (!height || !weight || height <= 0 || weight <= 0) {
            alert('Vui lòng nhập chiều cao và cân nặng hợp lệ!');
            return;
        }

        height = height / 100;
    } else {
        const feet = parseFloat(document.getElementById('feet').value) || 0;
        const inches = parseFloat(document.getElementById('inches').value) || 0;
        const weightLbs = parseFloat(document.getElementById('weightLbs').value);

        if (feet <= 0 || !weightLbs || weightLbs <= 0) {
            alert('Vui lòng nhập chiều cao và cân nặng hợp lệ!');
            return;
        }

        height = ((feet * 12) + inches) * 0.0254;
        weight = weightLbs * 0.453592;
    }

    const bmi = weight / (height * height);
    displayBMIResults(bmi, height, weight);
}

function displayBMIResults(bmi, height, weight) {
    document.getElementById('bmiValue').textContent = bmi.toFixed(1);

    let category, categoryClass, advice;

    if (bmi < 18.5) {
        category = 'Thiếu cân';
        categoryClass = 'underweight';
        advice = 'Bạn cần tăng cân một cách lành mạnh. Hãy ăn nhiều protein, carbohydrate phức hợp và tập thể dục để xây dựng cơ bắp.';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Bình thường';
        categoryClass = 'normal';
        advice = 'Chúc mừng! Cân nặng của bạn đang ở mức lý tưởng. Hãy duy trì lối sống lành mạnh.';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Thừa cân';
        categoryClass = 'overweight';
        advice = 'Bạn đang thừa cân nhẹ. Hãy giảm 5-10% cân nặng hiện tại thông qua chế độ ăn ít calo hơn.';
    } else {
        category = 'Béo phì';
        categoryClass = 'obese';
        advice = 'Cân nặng của bạn đang ở mức béo phì. Hãy tham khảo ý kiến bác sĩ để có kế hoạch giảm cân an toàn.';
    }

    const categoryElement = document.getElementById('bmiCategory');
    categoryElement.textContent = category;
    categoryElement.className = `bmi-category ${categoryClass}`;

    // Set category colors
    const colors = {
        underweight: { bg: '#bee3f8', color: '#2b6cb0' },
        normal: { bg: '#c6f6d5', color: '#276749' },
        overweight: { bg: '#fbb6ce', color: '#b83280' },
        obese: { bg: '#fed7d7', color: '#c53030' }
    };

    categoryElement.style.background = colors[categoryClass].bg;
    categoryElement.style.color = colors[categoryClass].color;

    document.getElementById('adviceText').textContent = advice;

    const heightM = height;
    const minIdealWeight = 18.5 * heightM * heightM;
    const maxIdealWeight = 24.9 * heightM * heightM;
    document.getElementById('idealWeight').textContent =
        `${minIdealWeight.toFixed(1)} - ${maxIdealWeight.toFixed(1)} kg`;

    const bmr = 88.362 + (13.397 * weight) + (4.799 * (height * 100)) - (5.677 * 25);
    const dailyCalories = Math.round(bmr * 1.4);
    document.getElementById('dailyCalories').textContent = `${dailyCalories} cal`;

    document.getElementById('bmiResult').classList.add('show');
}

// Todo Manager Functions
const categoryNames = {
    work: 'Công việc',
    personal: 'Cá nhân',
    study: 'Học tập',
    health: 'Sức khỏe',
    other: 'Khác'
};

const priorityNames = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
};

function addTodo() {
    const text = document.getElementById('todoText').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const category = document.getElementById('todoCategory').value;

    if (!text) {
        alert('Vui lòng nhập nội dung công việc!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        priority: priority,
        category: category,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    updateStats();

    document.getElementById('todoText').value = '';
    document.getElementById('todoPriority').value = 'medium';
    document.getElementById('todoCategory').value = 'work';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        alert('Không có công việc đã hoàn thành nào để xóa!');
        return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${completedCount} công việc đã hoàn thành?`)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function renderTodos() {
    const todoList = document.getElementById('todoList');

    if (todos.length === 0) {
        todoList.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #718096;">
                        <h3>🎯 Chưa có công việc nào</h3>
                        <p>Hãy thêm công việc đầu tiên của bạn!</p>
                    </div>
                `;
        return;
    }

    todoList.innerHTML = todos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-header">
                        <div class="todo-text">${todo.text}</div>
                        <div class="todo-actions">
                            <button class="todo-btn complete-btn" onclick="toggleTodo(${todo.id})">
                                ${todo.completed ? '↩️ Hoàn tác' : '✅ Hoàn thành'}
                            </button>
                            <button class="todo-btn delete-btn" onclick="deleteTodo(${todo.id})">
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; background: ${getPriorityColor(todo.priority).bg}; color: ${getPriorityColor(todo.priority).color};">
                            ${priorityNames[todo.priority]}
                        </span>
                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #e2e8f0; color: #4a5568;">
                            ${categoryNames[todo.category]}
                        </span>
                        <span style="font-size: 0.8rem; color: #718096;">
                            ${new Date(todo.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            `).join('');
}

function getPriorityColor(priority) {
    const colors = {
        high: { bg: '#fed7d7', color: '#c53030' },
        medium: { bg: '#fbb6ce', color: '#b83280' },
        low: { bg: '#c6f6d5', color: '#276749' }
    };
    return colors[priority];
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalTodos').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent = pending;

    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${completionRate}%`;
    progressFill.textContent = `${completionRate}%`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Enter key support
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeSection = document.querySelector('.tool-section.active');
        if (activeSection) {
            const sectionId = activeSection.id;
            if (sectionId === 'todo-manager' && e.target.id === 'todoText') {
                addTodo();
            } else if (sectionId === 'tax-calculator') {
                calculateTax();
            } else if (sectionId === 'bmi-calculator') {
                calculateBMI();
            }
        }
    }
});

// Password Generator Functions
function updateLengthValue() {
    const length = document.getElementById('passwordLength').value;
    document.getElementById('lengthValue').textContent = length;
}

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;

    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        alert('Vui lòng chọn ít nhất một loại ký tự!');
        return;
    }

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    document.getElementById('generatedPassword').textContent = password;
    calculatePasswordStrength(password);
    document.getElementById('passwordResult').classList.add('show');
}

function calculatePasswordStrength(password) {
    let score = 0;
    let crackTime = '';

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Remove extra points if length is too short
    if (password.length < 8) score = Math.min(score, 2);

    // Calculate crack time (simplified estimation)
    const charset = getCharsetSize(password);
    const combinations = Math.pow(charset, password.length);
    const secondsToCrack = combinations / (1000000000 * 2); // Assuming 1 billion guesses per second

    if (secondsToCrack < 1) crackTime = '< 1 giây';
    else if (secondsToCrack < 60) crackTime = Math.round(secondsToCrack) + ' giây';
    else if (secondsToCrack < 3600) crackTime = Math.round(secondsToCrack / 60) + ' phút';
    else if (secondsToCrack < 86400) crackTime = Math.round(secondsToCrack / 3600) + ' giờ';
    else if (secondsToCrack < 31536000) crackTime = Math.round(secondsToCrack / 86400) + ' ngày';
    else if (secondsToCrack < 31536000000) crackTime = Math.round(secondsToCrack / 31536000) + ' năm';
    else crackTime = '> 1000 năm';

    document.getElementById('strengthScore').textContent = score + '/6';
    document.getElementById('crackTime').textContent = crackTime;

    // Color coding for strength
    const strengthElement = document.getElementById('strengthScore');
    if (score <= 2) {
        strengthElement.style.color = '#f56565';
    } else if (score <= 4) {
        strengthElement.style.color = '#ed8936';
    } else {
        strengthElement.style.color = '#48bb78';
    }
}

function getCharsetSize(password) {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^A-Za-z0-9]/.test(password)) size += 32;
    return size;
}

function copyPassword() {
    const password = document.getElementById('generatedPassword').textContent;
    navigator.clipboard.writeText(password).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Đã sao chép!';
        btn.style.background = '#48bb78';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#48bb78';
        }, 2000);
    });
}

// Unit Converter Functions
const lengthUnits = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    inch: 0.0254,
    ft: 0.3048,
    yard: 0.9144,
    mile: 1609.34
};

const weightUnits = {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    ton: 1000,
    oz: 0.0283495,
    lb: 0.453592
};

function convertLength() {
    const value = parseFloat(document.getElementById('lengthValue').value);
    const fromUnit = document.getElementById('lengthFrom').value;
    const toUnit = document.getElementById('lengthTo').value;

    if (isNaN(value)) {
        alert('Vui lòng nhập giá trị hợp lệ!');
        return;
    }

    const meters = value * lengthUnits[fromUnit];
    const result = meters / lengthUnits[toUnit];

    document.getElementById('lengthOutput').textContent =
        result.toLocaleString('vi-VN', { maximumFractionDigits: 6 }) + ' ' +
        document.getElementById('lengthTo').options[document.getElementById('lengthTo').selectedIndex].text.split(' ')[1];

    document.getElementById('lengthResult').classList.add('show');
}

function convertWeight() {
    const value = parseFloat(document.getElementById('weightValue').value);
    const fromUnit = document.getElementById('weightFrom').value;
    const toUnit = document.getElementById('weightTo').value;

    if (isNaN(value)) {
        alert('Vui lòng nhập giá trị hợp lệ!');
        return;
    }

    const kg = value * weightUnits[fromUnit];
    const result = kg / weightUnits[toUnit];

    document.getElementById('weightOutput').textContent =
        result.toLocaleString('vi-VN', { maximumFractionDigits: 6 }) + ' ' +
        document.getElementById('weightTo').options[document.getElementById('weightTo').selectedIndex].text.split(' ')[1];

    document.getElementById('weightResult').classList.add('show');
}

function convertTemperature() {
    const value = parseFloat(document.getElementById('tempValue').value);
    const fromUnit = document.getElementById('tempFrom').value;
    const toUnit = document.getElementById('tempTo').value;

    if (isNaN(value)) {
        alert('Vui lòng nhập giá trị hợp lệ!');
        return;
    }

    let celsius = value;

    // Convert to Celsius first
    if (fromUnit === 'fahrenheit') {
        celsius = (value - 32) * 5 / 9;
    } else if (fromUnit === 'kelvin') {
        celsius = value - 273.15;
    }

    // Convert from Celsius to target unit
    let result = celsius;
    let unit = '°C';

    if (toUnit === 'fahrenheit') {
        result = celsius * 9 / 5 + 32;
        unit = '°F';
    } else if (toUnit === 'kelvin') {
        result = celsius + 273.15;
        unit = 'K';
    }

    document.getElementById('tempOutput').textContent =
        result.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' ' + unit;

    document.getElementById('tempResult').classList.add('show');
}

// QR Code Functions
function updateQRInputs() {
    const type = document.getElementById('qrType').value;
    const inputsContainer = document.getElementById('qrInputs');

    let inputsHTML = '';

    switch (type) {
        case 'text':
            inputsHTML = `
                        <div class="input-group">
                            <label for="qrText">Nội dung:</label>
                            <textarea id="qrText" placeholder="Nhập văn bản cần tạo QR code..." style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
                        </div>
                    `;
            break;
        case 'url':
            inputsHTML = `
                        <div class="input-group">
                            <label for="qrText">Website URL:</label>
                            <input type="url" id="qrText" placeholder="https://example.com" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                        </div>
                    `;
            break;
        case 'phone':
            inputsHTML = `
                        <div class="input-group">
                            <label for="qrText">Số điện thoại:</label>
                            <input type="tel" id="qrText" placeholder="+84 123 456 789" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                        </div>
                    `;
            break;
        case 'email':
            inputsHTML = `
                        <div class="input-group">
                            <label for="qrText">Email:</label>
                            <input type="email" id="qrText" placeholder="example@email.com" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                        </div>
                    `;
            break;
        case 'wifi':
            inputsHTML = `
                        <div class="input-group">
                            <label for="wifiSSID">Tên WiFi (SSID):</label>
                            <input type="text" id="wifiSSID" placeholder="Tên mạng WiFi" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; margin-bottom: 15px;">
                        </div>
                        <div class="input-group">
                            <label for="wifiPassword">Mật khẩu:</label>
                            <input type="text" id="wifiPassword" placeholder="Mật khẩu WiFi" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; margin-bottom: 15px;">
                        </div>
                        <div class="input-group">
                            <label for="wifiSecurity">Bảo mật:</label>
                            <select id="wifiSecurity" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">Không mật khẩu</option>
                            </select>
                        </div>
                    `;
            break;
    }

    inputsContainer.innerHTML = inputsHTML;
}

function generateQR() {
    const type = document.getElementById('qrType').value;
    const size = document.getElementById('qrSize').value;
    const color = document.getElementById('qrColor').value;

    let qrData = '';

    if (type === 'wifi') {
        const ssid = document.getElementById('wifiSSID').value;
        const password = document.getElementById('wifiPassword').value;
        const security = document.getElementById('wifiSecurity').value;

        if (!ssid) {
            alert('Vui lòng nhập tên WiFi!');
            return;
        }

        qrData = `WIFI:T:${security};S:${ssid};P:${password};;`;
    } else {
        qrData = document.getElementById('qrText').value;

        if (!qrData.trim()) {
            alert('Vui lòng nhập nội dung!');
            return;
        }

        // Format data based on type
        if (type === 'phone') {
            qrData = 'tel:' + qrData;
        } else if (type === 'email') {
            qrData = 'mailto:' + qrData;
        }
    }

    // Create QR code using a simple pattern (demo version)
    createQRCode(qrData, size, color);
    document.getElementById('qrResult').classList.add('show');
}

function createQRCode(data, size, color) {
    const container = document.getElementById('qrCodeContainer');

    // Use QR.js library via CDN
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=${color}&bgcolor=ffffff&format=png&ecc=M`;

    const img = document.createElement('img');
    img.src = qrApiUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #e2e8f0';
    img.style.borderRadius = '8px';
    img.alt = 'QR Code';

    // Add error handling
    img.onerror = function () {
        // Fallback: create a simple QR-like pattern
        createFallbackQR(data, size, color, container);
    };

    container.innerHTML = '';
    container.appendChild(img);
}

function createFallbackQR(data, size, color, container) {
    // Fallback QR code using canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Create QR-like pattern
    ctx.fillStyle = '#' + color;
    const moduleSize = Math.floor(size / 25);

    // Create finder patterns (corners)
    const drawFinderPattern = (x, y) => {
        // Outer border
        ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = '#' + color;
        ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    // Draw finder patterns
    drawFinderPattern(0, 0);    // Top-left
    drawFinderPattern(18, 0);   // Top-right
    drawFinderPattern(0, 18);   // Bottom-left

    // Create data pattern based on input
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }

    // Fill data area
    for (let i = 8; i < 17; i++) {
        for (let j = 8; j < 17; j++) {
            if ((hash & (1 << ((i - 8) * 9 + (j - 8)))) !== 0) {
                ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
            }
        }
    }

    container.innerHTML = '';
    container.appendChild(canvas);
}

function downloadQR() {
    const img = document.querySelector('#qrCodeContainer img');
    const canvas = document.querySelector('#qrCodeContainer canvas');

    if (img) {
        // Download from API-generated QR code
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = img.src;
        link.click();
    } else if (canvas) {
        // Download from canvas fallback
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
    }
}

function printQR() {
    const img = document.querySelector('#qrCodeContainer img');
    const canvas = document.querySelector('#qrCodeContainer canvas');

    let imageSrc = '';
    if (img) {
        imageSrc = img.src;
    } else if (canvas) {
        imageSrc = canvas.toDataURL();
    }

    if (imageSrc) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
                    <html>
                        <head><title>In QR Code</title></head>
                        <body style="text-align: center; padding: 50px;">
                            <img src="${imageSrc}" style="max-width: 100%;">
                        </body>
                    </html>
                `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Random Picker Functions
let randomHistory = JSON.parse(localStorage.getItem('randomHistory')) || [];
let randomCounter = parseInt(localStorage.getItem('randomCounter')) || 0;

function updatePickerInputs() {
    const type = document.getElementById('pickerType').value;
    const inputsContainer = document.getElementById('pickerInputs');

    let inputsHTML = '';

    switch (type) {
        case 'names':
            inputsHTML = `
                        <div class="input-group">
                            <label for="namesList">Danh sách tên (mỗi tên một dòng):</label>
                            <textarea id="namesList" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C&#10;Phạm Thị D&#10;Hoàng Văn E" style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; min-height: 120px; resize: vertical; font-family: inherit;"></textarea>
                        </div>
                    `;
            break;
        case 'numbers':
            inputsHTML = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="input-group">
                                <label for="minNumber">Số nhỏ nhất:</label>
                                <input type="number" id="minNumber" placeholder="1" value="1" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                            </div>
                            <div class="input-group">
                                <label for="maxNumber">Số lớn nhất:</label>
                                <input type="number" id="maxNumber" placeholder="100" value="100" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                            </div>
                        </div>
                    `;
            break;
        case 'items':
            inputsHTML = `
                        <div class="input-group">
                            <label for="itemsList">Danh sách lựa chọn (mỗi mục một dòng):</label>
                            <textarea id="itemsList" placeholder="Pizza&#10;Hamburger&#10;Phở&#10;Bún bò&#10;Cơm tấm" style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; min-height: 120px; resize: vertical; font-family: inherit;"></textarea>
                        </div>
                    `;
            break;
        case 'yesno':
            inputsHTML = `
                        <div style="text-align: center; padding: 30px; background: rgba(255, 255, 255, 0.8); border-radius: 15px; border: 2px solid #e2e8f0;">
                            <h3 style="color: #2d3748; margin-bottom: 15px;">🤔 Đặt câu hỏi của bạn</h3>
                            <p style="color: #4a5568; font-size: 1.1rem;">Hệ thống sẽ trả lời "Có" hoặc "Không" một cách ngẫu nhiên</p>
                        </div>
                    `;
            break;
        case 'dice':
            inputsHTML = `
                        <div class="input-group">
                            <label for="diceCount">Số lượng xúc xắc:</label>
                            <select id="diceCount" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem;">
                                <option value="1" selected>1 xúc xắc</option>
                                <option value="2">2 xúc xắc</option>
                                <option value="3">3 xúc xắc</option>
                                <option value="4">4 xúc xắc</option>
                                <option value="5">5 xúc xắc</option>
                            </select>
                        </div>
                    `;
            break;
    }

    inputsContainer.innerHTML = inputsHTML;
}

function startRandomPicker() {
    const type = document.getElementById('pickerType').value;
    const speed = document.getElementById('animationSpeed').value;

    let items = [];
    let resultText = '';
    let resultIcon = '🎉';
    let description = '';

    // Get items based on type
    switch (type) {
        case 'names':
            const namesText = document.getElementById('namesList').value.trim();
            if (!namesText) {
                alert('Vui lòng nhập danh sách tên!');
                return;
            }
            items = namesText.split('\n').filter(name => name.trim() !== '');
            break;

        case 'numbers':
            const min = parseInt(document.getElementById('minNumber').value) || 1;
            const max = parseInt(document.getElementById('maxNumber').value) || 100;
            if (min >= max) {
                alert('Số lớn nhất phải lớn hơn số nhỏ nhất!');
                return;
            }
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            resultText = randomNum.toString();
            resultIcon = '🔢';
            description = `Số ngẫu nhiên từ ${min} đến ${max}`;
            break;

        case 'items':
            const itemsText = document.getElementById('itemsList').value.trim();
            if (!itemsText) {
                alert('Vui lòng nhập danh sách lựa chọn!');
                return;
            }
            items = itemsText.split('\n').filter(item => item.trim() !== '');
            break;

        case 'yesno':
            items = ['Có ✅', 'Không ❌'];
            resultIcon = '🤔';
            description = 'Câu trả lời cho câu hỏi của bạn';
            break;

        case 'dice':
            const diceCount = parseInt(document.getElementById('diceCount').value) || 1;
            const diceResults = [];
            let total = 0;
            for (let i = 0; i < diceCount; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                diceResults.push(roll);
                total += roll;
            }
            resultText = diceCount === 1 ? diceResults[0].toString() : `${diceResults.join(' + ')} = ${total}`;
            resultIcon = '🎲';
            description = `Kết quả ${diceCount} xúc xắc`;
            break;
    }

    // For list-based types, pick random item
    if (items.length > 0) {
        if (items.length === 1) {
            alert('Cần ít nhất 2 lựa chọn để random!');
            return;
        }
        const randomIndex = Math.floor(Math.random() * items.length);
        resultText = items[randomIndex];
        description = `Được chọn từ ${items.length} lựa chọn`;
    }

    // Show spinning animation
    showSpinningAnimation(speed, resultText, resultIcon, description, items.length || (type === 'numbers' ? (parseInt(document.getElementById('maxNumber').value) - parseInt(document.getElementById('minNumber').value) + 1) : (type === 'dice' ? 6 : 2)));
}

function showSpinningAnimation(speed, finalResult, icon, description, totalItems) {
    const spinningWheel = document.getElementById('spinningWheel');
    const randomBtn = document.getElementById('randomBtn');
    const resultDiv = document.getElementById('randomResult');

    // Hide result and show spinning wheel
    resultDiv.classList.remove('show');
    spinningWheel.style.display = 'block';
    randomBtn.disabled = true;
    randomBtn.textContent = '🌀 Đang Random...';

    // Set animation duration based on speed
    const durations = { fast: 1500, medium: 2500, slow: 4000 };
    const duration = durations[speed];

    // Stop animation and show result
    setTimeout(() => {
        spinningWheel.style.display = 'none';
        showResult(finalResult, icon, description, totalItems);
        randomBtn.disabled = false;
        randomBtn.textContent = '🎯 Bắt Đầu Random';
    }, duration);
}

function showResult(result, icon, description, totalItems) {
    // Update counter
    randomCounter++;
    localStorage.setItem('randomCounter', randomCounter.toString());

    // Add to history
    const historyItem = {
        result: result,
        type: document.getElementById('pickerType').options[document.getElementById('pickerType').selectedIndex].text,
        timestamp: new Date().toLocaleString('vi-VN')
    };
    randomHistory.unshift(historyItem);
    if (randomHistory.length > 20) randomHistory.pop(); // Keep only last 20
    localStorage.setItem('randomHistory', JSON.stringify(randomHistory));

    // Update display
    const resultOutput = document.getElementById('randomOutput');
    const resultIcon = document.getElementById('resultIcon');
    const resultDescription = document.getElementById('resultDescription');

    resultOutput.textContent = result;
    resultOutput.className = 'result-animation rainbow-text';
    resultIcon.textContent = icon;
    resultDescription.textContent = description;

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('randomCount').textContent = randomCounter;

    // Show result with animation
    document.getElementById('randomResult').classList.add('show');

    // Update history display
    updateHistoryDisplay();

    // Remove animation classes after animation completes
    setTimeout(() => {
        resultOutput.className = '';
    }, 3000);
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('randomHistory');

    if (randomHistory.length === 0) {
        historyContainer.innerHTML = '<p style="color: #718096; text-align: center; padding: 20px;">Chưa có lịch sử random nào</p>';
        return;
    }

    historyContainer.innerHTML = randomHistory.map((item, index) => `
                <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: #2d3748; font-size: 1.1rem;">${item.result}</span>
                        <span style="font-size: 0.8rem; color: #718096;">#${randomCounter - index}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.9rem; color: #4a5568; background: #f7fafc; padding: 3px 8px; border-radius: 4px;">${item.type}</span>
                        <span style="font-size: 0.8rem; color: #718096;">${item.timestamp}</span>
                    </div>
                </div>
            `).join('');
}
function clearHistory() {
    if (randomHistory.length === 0) {
        alert('Không có lịch sử để xóa!');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử random?')) {
        randomHistory = [];
        localStorage.removeItem('randomHistory');
        updateHistoryDisplay();
    }
}
//-----------------------------------------------------------------------------------
// Thêm biến để quản lý worker - Read Text
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultContainer = document.getElementById('resultContainer');
        const resultText = document.getElementById('resultText');
        const copyBtn = document.getElementById('copyBtn');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const languageSelect = document.getElementById('language');

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => {
            fileInput.value = null; // Cho phép chọn lại cùng 1 file
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            // Kiểm tra loại file
            if (!file.type.startsWith('image/')) {
                showError('Vui lòng chọn file hình ảnh hợp lệ!');
                resetPreviewAndResult();
                return;
            }
            // Kiểm tra dung lượng file
            if (file.size > 10 * 1024 * 1024) {
                showError('Kích thước file không được vượt quá 10MB!');
                resetPreviewAndResult();
                return;
            }

            hideMessages();
            resetProgress();
            resetResult();
            showPreview(file);
            processImage(file);
        }

        function showPreview(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                `;
            };
            reader.readAsDataURL(file);
        }

        function resetPreviewAndResult() {
            previewContainer.innerHTML = '';
            resetResult();
        }

        function resetResult() {
            resultText.textContent = '';
            resultContainer.style.display = 'none';
        }

        function resetProgress() {
            progressFill.style.width = '0%';
            progressText.textContent = 'Đang xử lý...';
            progressContainer.style.display = 'none';
        }

        async function processImage(file) {
            try {
                progressContainer.style.display = 'block';
                progressFill.style.width = '0%';
                progressText.textContent = 'Đang nhận diện văn bản... 0%';
                resultContainer.style.display = 'none';
                
                const selectedLanguage = languageSelect.value;
                
                const { data: { text } } = await Tesseract.recognize(
                    file,
                    selectedLanguage,
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                const progress = Math.round(m.progress * 100);
                                progressFill.style.width = progress + '%';
                                progressText.textContent = `Đang nhận diện văn bản... ${progress}%`;
                            }
                        }
                    }
                );

                progressContainer.style.display = 'none';
                
                if (text && text.trim()) {
                    resultText.textContent = text.trim();
                    resultContainer.style.display = 'block';
                    showSuccess('Trích xuất văn bản thành công!');
                } else {
                    showError('Không tìm thấy văn bản trong hình ảnh. Vui lòng thử với hình ảnh khác.');
                    resetResult();
                }
                
            } catch (error) {
                progressContainer.style.display = 'none';
                showError('Có lỗi xảy ra khi xử lý hình ảnh. Vui lòng thử lại!');
                resetResult();
                console.error('OCR Error:', error);
            }
        }

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(resultText.textContent);
                copyBtn.textContent = '✅ Đã sao chép!';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Sao chép';
                }, 2000);
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = resultText.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyBtn.textContent = '✅ Đã sao chép!';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Sao chép';
                }, 2000);
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }

        function showSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        }

        function hideMessages() {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
// Thêm event listener để cleanup khi trang đóng
window.addEventListener('beforeunload', cleanupTesseract);
//-----------------------------------------------------------------------------------
// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    renderTodos();
    updateStats();
    updateHistoryDisplay();
    document.getElementById('randomCount').textContent = randomCounter;

    const extractedTextArea = document.getElementById('extractedText');
    if (extractedTextArea) {
        extractedTextArea.addEventListener('input', function () {
            updateTextStats(this.value);
        });
    }

    // Handle initial active button based on active section
    const activeSection = document.querySelector('.tool-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        const activeButton = document.querySelector(`.nav-btn[onclick="showSection('${sectionId}')"]`);
        if (activeButton) {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }
    }
});