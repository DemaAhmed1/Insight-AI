<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>منصة تحليل البيانات الذكية</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- PapaParse CDN for CSV Parsing -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
    <!-- FontAwesome Font -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        body { font-family: 'Tajawal', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased min-h-screen flex flex-col">

    <!-- Header Navigation -->
    <header class="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div class="flex items-center space-x-3 space-x-reverse cursor-pointer" onclick="showPage('upload')">
                <i class="fa-solid me-2 fa-chart-pie text-2xl text-indigo-400"></i>
                <span class="font-bold text-xl">مُحلل البيانات الذكي</span>
            </div>
            <nav class="hidden md:flex space-x-1 space-x-reverse">
                <button onclick="showPage('upload')" id="nav-upload" class="nav-btn px-3 py-2 rounded-md text-sm font-medium bg-indigo-800 text-white">
                    <i class="fa-solid fa-file-csv ml-1"></i> رفع البيانات
                </button>
                <button onclick="showPage('dashboard')" id="nav-dashboard" class="nav-btn px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white">
                    <i class="fa-solid fa-gauge ml-1"></i> لوحة التحكم
                </button>
                <button onclick="showPage('analytics')" id="nav-analytics" class="nav-btn px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white">
                    <i class="fa-solid fa-chart-line ml-1"></i> التحليلات الإحصائية
                </button>
                <button onclick="showPage('reports')" id="nav-reports" class="nav-btn px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white">
                    <i class="fa-solid fa-file-invoice ml-1"></i> التقارير والتوصيات
                </button>
                <button onclick="showPage('chat')" id="nav-chat" class="nav-btn px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white">
                    <i class="fa-solid fa-robot ml-1"></i> اسأل بياناتك
                </button>
            </nav>
        </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Page 1: Upload CSV & Preview -->
        <section id="page-upload" class="page-content block space-y-6">
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 class="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <i class="fa-solid fa-upload text-indigo-600 ml-2"></i> رفع ملف البيانات (CSV)
                </h2>
                <div id="drop-zone" class="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50/50 transition cursor-pointer">
                    <input type="file" id="csv-file-input" accept=".csv" class="hidden">
                    <i class="fa-solid fa-cloud-arrow-up text-5xl text-indigo-500 mb-3"></i>
                    <p class="text-lg font-medium text-gray-700">اسحب وأفلت ملف CSV هنا أو اضغط للاختيار</p>
                    <p class="text-sm text-gray-500 mt-1">يُدعم ملفات CSV بحجم يصل إلى 10 ميجابايت</p>
                </div>
            </div>

            <!-- Preview Section -->
            <div id="upload-preview-container" class="hidden space-y-6">
                <!-- Data Info Badge -->
                <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-wrap justify-between items-center text-sm font-medium text-indigo-900">
                    <span id="file-name-badge"><i class="fa-solid fa-file-csv text-indigo-600 ml-1"></i> اسم الملف: -</span>
                    <span id="file-rows-badge"><i class="fa-solid fa-list-ol text-indigo-600 ml-1"></i> عدد الصفوف: 0</span>
                    <span id="file-cols-badge"><i class="fa-solid fa-columns text-indigo-600 ml-1"></i> عدد الأعمدة: 0</span>
                    <span id="file-nulls-badge"><i class="fa-solid fa-triangle-exclamation text-amber-600 ml-1"></i> القيم المفقودة: 0</span>
                </div>

                <!-- Column Types Detected -->
                <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 class="text-lg font-bold mb-3 text-gray-800"><i class="fa-solid fa-tags text-indigo-600 ml-2"></i> الأعمدة المكتشفة وأنواعها</h3>
                    <div id="column-types-list" class="flex flex-wrap gap-2"></div>
                </div>

                <!-- Preview Table -->
                <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden">
                    <h3 class="text-lg font-bold mb-3 text-gray-800"><i class="fa-solid fa-table text-indigo-600 ml-2"></i> معاينة أول 10 صفوف من البيانات</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-sm" id="preview-table">
                            <thead class="bg-gray-50" id="preview-thead"></thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="preview-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <!-- Page 2: Dashboard -->
        <section id="page-dashboard" class="page-content hidden space-y-6">
            <h2 class="text-2xl font-bold text-gray-800"><i class="fa-solid fa-gauge text-indigo-600 ml-2"></i> لوحة التحكم العامة</h2>
            
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-container">
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">إجمالي الصفوف</p>
                        <h4 id="kpi-rows" class="text-2xl font-bold text-gray-800 mt-1">0</h4>
                    </div>
                    <div class="bg-indigo-100 p-3 rounded-lg text-indigo-600"><i class="fa-solid fa-database text-xl"></i></div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">عدد الأعمدة</p>
                        <h4 id="kpi-cols" class="text-2xl font-bold text-gray-800 mt-1">0</h4>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-lg text-blue-600"><i class="fa-solid fa-table-columns text-xl"></i></div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">الأعمدة الرقمية</p>
                        <h4 id="kpi-num-cols" class="text-2xl font-bold text-gray-800 mt-1">0</h4>
                    </div>
                    <div class="bg-green-100 p-3 rounded-lg text-green-600"><i class="fa-solid fa-hashtag text-xl"></i></div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500">القيم الشاذة المكتشفة</p>
                        <h4 id="kpi-anomalies-count" class="text-2xl font-bold text-gray-800 mt-1">0</h4>
                    </div>
                    <div class="bg-amber-100 p-3 rounded-lg text-amber-600"><i class="fa-solid fa-triangle-exclamation text-xl"></i></div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="text-base font-bold text-gray-800 mb-4" id="chart-1-title">توزيع القيم الرقمية</h3>
                    <div class="relative h-64"><canvas id="dashboardChart1"></canvas></div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="text-base font-bold text-gray-800 mb-4" id="chart-2-title">توزيع البيانات النصية</h3>
                    <div class="relative h-64"><canvas id="dashboardChart2"></canvas></div>
                </div>
            </div>
        </section>

        <!-- Page 3: Analytics -->
        <section id="page-analytics" class="page-content hidden space-y-6">
            <h2 class="text-2xl font-bold text-gray-800"><i class="fa-solid fa-chart-line text-indigo-600 ml-2"></i> التحليلات الإحصائية المتقدمة</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Summary Table / Averages -->
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                    <h3 class="text-lg font-bold text-gray-800 mb-3"><i class="fa-solid fa-calculator text-indigo-600 ml-2"></i> الإحصاءات الوصفية للأعمدة الرقمية</h3>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-right font-semibold">العمود</th>
                                <th class="px-3 py-2 text-right font-semibold">المتوسط</th>
                                <th class="px-3 py-2 text-right font-semibold">أقل قيمة</th>
                                <th class="px-3 py-2 text-right font-semibold">أعلى قيمة</th>
                            </tr>
                        </thead>
                        <tbody id="analytics-stats-tbody" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>

                <!-- Anomalies Card -->
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="text-lg font-bold text-gray-800 mb-3"><i class="fa-solid fa-bug text-amber-500 ml-2"></i> كشف الحالات الشاذة (Outliers)</h3>
                    <div id="anomalies-container" class="space-y-2 text-sm max-h-60 overflow-y-auto"></div>
                </div>
            </div>
        </section>

        <!-- Page 4: Reports & Recommendations -->
        <section id="page-reports" class="page-content hidden space-y-6">
            <h2 class="text-2xl font-bold text-gray-800"><i class="fa-solid fa-file-invoice text-indigo-600 ml-2"></i> التقارير والتوصيات</h2>

            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 class="text-xl font-bold text-indigo-900 border-b pb-2"><i class="fa-solid fa-lightbulb text-amber-500 ml-2"></i> أهم التوصيات والملاحظات الأوتوماتيكية</h3>
                <ul id="recommendations-list" class="space-y-3 text-gray-700"></ul>
            </div>
        </section>

        <!-- Page 5: AI Chat -->
        <section id="page-chat" class="page-content hidden space-y-4">
            <div class="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col h-[600px]">
                <div class="p-4 border-b bg-indigo-50 rounded-t-xl flex justify-between items-center">
                    <h2 class="text-lg font-bold text-indigo-900 flex items-center">
                        <i class="fa-solid fa-robot text-indigo-600 ml-2"></i> المحادثة الذكية مع ملف البيانات
                    </h2>
                    <span id="chat-dataset-name" class="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">لم يتم تحميل ملف</span>
                </div>

                <!-- Chat Messages Container -->
                <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-4">
                    <div class="flex items-start gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">AI</div>
                        <div class="bg-gray-100 p-3 rounded-2xl rounded-tr-none text-sm text-gray-800 max-w-lg">
                            مرحباً! أنا جاهز للإجابة على جميع استفساراتك بناءً على البيانات التي قمت برفعها فقط. يمكنك سؤالي عن الإحصائيات، التوصيات، أو التحليلات.
                        </div>
                    </div>
                </div>

                <!-- Chat Input Form -->
                <form id="chat-form" class="p-4 border-t flex gap-2">
                    <input type="text" id="chat-input" placeholder="اسأل سؤالاً حول بياناتك المرفوعة..." class="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" required>
                    <button type="submit" id="chat-submit-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1">
                        <span>إرسال</span>
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </form>
            </div>
        </section>

    </main>

    <!-- Global Logic & State Management -->
    <script>
        // Global Dataset State
        let globalDatasetState = {
            fileName: '',
            rowsCount: 0,
            colsCount: 0,
            columnTypes: {}, // { colName: 'number' | 'string' }
            nullsCount: 0,
            headers: [],
            data: [], // all parsed rows
            first20Rows: [],
            stats: {}, // { colName: { avg, min, max, sum } }
            anomalies: [], // [{ column, value, reason }]
            recommendations: [],
            summary: ''
        };

        // Chart Instances for cleanup
        let chart1Instance = null;
        let chart2Instance = null;

        // Initialize App & Load from Session Storage if available
        document.addEventListener('DOMContentLoaded', () => {
            setupNavigation();
            setupFileUpload();
            setupChatForm();

            const savedState = sessionStorage.getItem('globalDatasetState');
            if (savedState) {
                try {
                    globalDatasetState = JSON.parse(savedState);
                    if (globalDatasetState.data && globalDatasetState.data.length > 0) {
                        updateAllUI();
                    }
                } catch(e) {
                    console.error("Failed to load state from sessionStorage", e);
                }
            }
        });

        // Navigation Management
        function setupNavigation() {
            window.showPage = function(pageId) {
                document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('bg-indigo-800', 'text-white');
                    btn.classList.add('text-indigo-200');
                });

                const targetPage = document.getElementById(`page-${pageId}`);
                if (targetPage) targetPage.classList.remove('hidden');

                const targetNav = document.getElementById(`nav-${pageId}`);
                if (targetNav) {
                    targetNav.classList.add('bg-indigo-800', 'text-white');
                    targetNav.classList.remove('text-indigo-200');
                }
            }
        }

        // File Upload & CSV Processing
        function setupFileUpload() {
            const dropZone = document.getElementById('drop-zone');
            const fileInput = document.getElementById('csv-file-input');

            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('bg-indigo-100/50');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('bg-indigo-100/50');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('bg-indigo-100/50');
                if (e.dataTransfer.files.length > 0) {
                    processCSVFile(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    processCSVFile(e.target.files[0]);
                }
            });
        }

        function processCSVFile(file) {
            if (!file.name.endsWith('.csv')) {
                alert('الرجاء اختيار ملف CSV صحيح.');
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const data = results.data;
                    const headers = results.meta.fields || [];

                    if (data.length === 0 || headers.length === 0) {
                        alert('الملف فارغ أو غير صالح.');
                        return;
                    }

                    // Process Data & Build Global State
                    buildGlobalDatasetState(file.name, headers, data);

                    // Save to Session Storage
                    sessionStorage.setItem('globalDatasetState', JSON.stringify(globalDatasetState));

                    // Update UI across all pages
                    updateAllUI();
                }
            });
        }

        function buildGlobalDatasetState(fileName, headers, data) {
            const rowsCount = data.length;
            const colsCount = headers.length;
            let nullsCount = 0;
            const columnTypes = {};
            const stats = {};
            const anomalies = [];
            const recommendations = [];

            // Detect Column Types & Count Nulls
            headers.forEach(header => {
                let numericCount = 0;
                let nonNullCount = 0;

                data.forEach(row => {
                    const val = row[header];
                    if (val === null || val === undefined || val === '') {
                        nullsCount++;
                    } else {
                        nonNullCount++;
                        if (!isNaN(Number(val))) {
                            numericCount++;
                        }
                    }
                });

                // If > 70% of non-null values are numeric, classify as numeric
                columnTypes[header] = (nonNullCount > 0 && (numericCount / nonNullCount) > 0.7) ? 'number' : 'string';
            });

            // Calculate Statistics for Numeric Columns
            headers.forEach(header => {
                if (columnTypes[header] === 'number') {
                    const values = data.map(r => Number(r[header])).filter(v => !isNaN(v));
                    if (values.length > 0) {
                        const sum = values.reduce((a, b) => a + b, 0);
                        const avg = sum / values.length;
                        const min = Math.min(...values);
                        const max = Math.max(...values);

                        stats[header] = { avg, min, max, sum, count: values.length };

                        // Detect Anomalies (Outliers > 2 standard deviations)
                        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
                        const stdDev = Math.sqrt(variance);

                        if (stdDev > 0) {
                            values.forEach(v => {
                                if (Math.abs(v - avg) > 2.5 * stdDev) {
                                    anomalies.push({
                                        column: header,
                                        value: v,
                                        reason: `قيمة بعيدة جدًا عن المتوسط الحسابي (${avg.toFixed(2)})`
                                    });
                                }
                            });
                        }
                    }
                }
            });

            // Auto-generate Recommendations
            if (nullsCount > 0) {
                recommendations.push(`تم اكتشاف ${nullsCount} قيمة مفقودة داخل البيانات، يُنصح بتنظيفها أو استبدالها لمزيد من الدقة.`);
            } else {
                recommendations.push(`البيانات مكتملة ولا تحتوي على أي قيم مفقودة.`);
            }

            if (anomalies.length > 0) {
                recommendations.push(`تم اكتشاف ${anomalies.length} حالة شاذة في الأعمدة الرقمية، يُرجى مراجعتها لتفادي تأثر نتائج التحليل.`);
            } else {
                recommendations.push(`القيم الرقمية متوازنة ولا توجد حالات شاذة حادة.`);
            }

            const numCols = Object.values(columnTypes).filter(t => t === 'number').length;
            recommendations.push(`تحتوي مجموعة البيانات على ${numCols} أعمدة رقمية و ${colsCount - numCols} أعمدة نصية مما يسمح بتحليلات متعددة الأبعاد.`);

            // Build Summary
            const summary = `الملف ${fileName} يحتوي على ${rowsCount} صفًا و ${colsCount} أعمدة. الأعمدة الرقمية: ${Object.keys(stats).join(', ') || 'لا يوجد'}. Total Nulls: ${nullsCount}.`;

            globalDatasetState = {
                fileName,
                rowsCount,
                colsCount,
                columnTypes,
                nullsCount,
                headers,
                data,
                first20Rows: data.slice(0, 20),
                stats,
                anomalies: anomalies.slice(0, 15), // Limit anomalies for clean UI
                recommendations,
                summary
            };
        }

        // Update UI across all pages
        function updateAllUI() {
            updateUploadPreview();
            updateDashboard();
            updateAnalytics();
            updateReports();
            updateChatHeader();
        }

        function updateUploadPreview() {
            document.getElementById('upload-preview-container').classList.remove('hidden');
            document.getElementById('file-name-badge').innerHTML = `<i class="fa-solid fa-file-csv text-indigo-600 ml-1"></i> اسم الملف: ${globalDatasetState.fileName}`;
            document.getElementById('file-rows-badge').innerHTML = `<i class="fa-solid fa-list-ol text-indigo-600 ml-1"></i> عدد الصفوف: ${globalDatasetState.rowsCount}`;
            document.getElementById('file-cols-badge').innerHTML = `<i class="fa-solid fa-columns text-indigo-600 ml-1"></i> عدد الأعمدة: ${globalDatasetState.colsCount}`;
            document.getElementById('file-nulls-badge').innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600 ml-1"></i> القيم المفقودة: ${globalDatasetState.nullsCount}`;

            // Column types badge list
            const typesList = document.getElementById('column-types-list');
            typesList.innerHTML = '';
            globalDatasetState.headers.forEach(h => {
                const type = globalDatasetState.columnTypes[h];
                const badge = document.createElement('span');
                badge.className = `px-3 py-1 rounded-full text-xs font-semibold ${type === 'number' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`;
                badge.innerText = `${h} (${type === 'number' ? 'رقمي' : 'نصي'})`;
                typesList.appendChild(badge);
            });

            // Preview Table (first 10 rows)
            const thead = document.getElementById('preview-thead');
            const tbody = document.getElementById('preview-tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            const headerRow = document.createElement('tr');
            globalDatasetState.headers.forEach(h => {
                const th = document.createElement('th');
                th.className = "px-4 py-2 text-right font-semibold text-gray-700 bg-gray-100 border-b";
                th.innerText = h;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            globalDatasetState.data.slice(0, 10).forEach(row => {
                const tr = document.createElement('tr');
                globalDatasetState.headers.forEach(h => {
                    const td = document.createElement('td');
                    td.className = "px-4 py-2 border-b text-gray-600";
                    td.innerText = row[h] !== undefined ? row[h] : '';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        function updateDashboard() {
            document.getElementById('kpi-rows').innerText = globalDatasetState.rowsCount;
            document.getElementById('kpi-cols').innerText = globalDatasetState.colsCount;
            
            const numColsCount = Object.values(globalDatasetState.columnTypes).filter(t => t === 'number').length;
            document.getElementById('kpi-num-cols').innerText = numColsCount;
            document.getElementById('kpi-anomalies-count').innerText = globalDatasetState.anomalies.length;

            updateCharts();
        }

        function updateCharts() {
            if (chart1Instance) chart1Instance.destroy();
            if (chart2Instance) chart2Instance.destroy();

            const numCols = Object.keys(globalDatasetState.stats);
            const strCols = globalDatasetState.headers.filter(h => globalDatasetState.columnTypes[h] === 'string');

            // Chart 1: Numeric Means
            if (numCols.length > 0) {
                document.getElementById('chart-1-title').innerText = "متوسط القراءات للأعمدة الرقمية";
                const ctx1 = document.getElementById('dashboardChart1').getContext('2d');
                chart1Instance = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: numCols,
                        datasets: [{
                            label: 'المتوسط الحسابي',
                            data: numCols.map(col => globalDatasetState.stats[col].avg),
                            backgroundColor: 'rgba(99, 102, 241, 0.6)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            // Chart 2: Categorical Distribution for first string column
            if (strCols.length > 0) {
                const targetCol = strCols[0];
                document.getElementById('chart-2-title').innerText = `توزيع التكرارات في العمود (${targetCol})`;

                const counts = {};
                globalDatasetState.data.forEach(r => {
                    const val = r[targetCol];
                    if (val) counts[val] = (counts[val] || 0) + 1;
                });

                const labels = Object.keys(counts).slice(0, 6);
                const dataValues = labels.map(l => counts[l]);

                const ctx2 = document.getElementById('dashboardChart2').getContext('2d');
                chart2Instance = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: dataValues,
                            backgroundColor: [
                                '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                            ]
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }

        function updateAnalytics() {
            const tbody = document.getElementById('analytics-stats-tbody');
            tbody.innerHTML = '';

            const numCols = Object.keys(globalDatasetState.stats);
            if (numCols.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-3 py-4 text-center text-gray-500">لا توجد أعمدة رقمية لحساب الإحصاءات الوصفية.</td></tr>`;
            } else {
                numCols.forEach(col => {
                    const stat = globalDatasetState.stats[col];
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-3 py-2 font-medium text-gray-800">${col}</td>
                        <td class="px-3 py-2 text-gray-600">${stat.avg.toFixed(2)}</td>
                        <td class="px-3 py-2 text-gray-600">${stat.min}</td>
                        <td class="px-3 py-2 text-gray-600">${stat.max}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Update Anomalies
            const anoContainer = document.getElementById('anomalies-container');
            anoContainer.innerHTML = '';

            if (globalDatasetState.anomalies.length === 0) {
                anoContainer.innerHTML = `<p class="text-green-600 font-medium"><i class="fa-solid fa-circle-check ml-1"></i> لم يتم كشف أي حالات شاذة في البيانات.</p>`;
            } else {
                globalDatasetState.anomalies.forEach(ano => {
                    const div = document.createElement('div');
                    div.className = "p-2 bg-amber-50 border-r-4 border-amber-500 rounded text-amber-900";
                    div.innerHTML = `<strong>العمود [${ano.column}]:</strong> القيمة (${ano.value}) - ${ano.reason}`;
                    anoContainer.appendChild(div);
                });
            }
        }

        function updateReports() {
            const list = document.getElementById('recommendations-list');
            list.innerHTML = '';

            globalDatasetState.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.className = "flex items-start gap-2";
                li.innerHTML = `<i class="fa-solid fa-circle-check text-indigo-600 mt-1"></i> <span>${rec}</span>`;
                list.appendChild(li);
            });
        }

        function updateChatHeader() {
            const badge = document.getElementById('chat-dataset-name');
            if (globalDatasetState.fileName) {
                badge.innerText = globalDatasetState.fileName;
                badge.className = "text-xs bg-indigo-600 text-white px-2 py-1 rounded";
            }
        }

        // AI Chat Form Handler
        function setupChatForm() {
            const form = document.getElementById('chat-form');
            const input = document.getElementById('chat-input');
            const messagesContainer = document.getElementById('chat-messages');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const question = input.value.trim();
                if (!question) return;

                if (!globalDatasetState.fileName) {
                    alert('الرجاء رفع ملف CSV أولاً للبدء في طرح الأسئلة.');
                    return;
                }

                // Append User Message
                appendChatMessage('user', question);
                input.value = '';

                // Loader Message
                const loadingId = appendChatMessage('ai', 'جاري تحليل سؤالك والبيانات...');

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName: globalDatasetState.fileName,
                            rowsCount: globalDatasetState.rowsCount,
                            colsCount: globalDatasetState.colsCount,
                            headers: globalDatasetState.headers,
                            summary: globalDatasetState.summary,
                            first20Rows: globalDatasetState.first20Rows,
                            question: question
                        })
                    });

                    const data = await response.json();
                    
                    // Replace loading message with response
                    const loadingEl = document.getElementById(loadingId);
                    if (loadingEl) {
                        loadingEl.innerText = data.reply || data.message || 'حدث خطأ أثناء معالجة السؤال.';
                    }
                } catch (error) {
                    console.error("Chat Error:", error);
                    const loadingEl = document.getElementById(loadingId);
                    if (loadingEl) {
                        loadingEl.innerText = 'حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.';
                    }
                }
            });
        }

        function appendChatMessage(sender, text) {
            const messagesContainer = document.getElementById('chat-messages');
            const msgId = 'msg-' + Date.now();

            const flex = document.createElement('div');
            flex.className = `flex items-start gap-2.5 ${sender === 'user' ? 'flex-row-reverse' : ''}`;

            const avatar = document.createElement('div');
            avatar.className = `w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${sender === 'user' ? 'bg-indigo-900 text-white' : 'bg-indigo-600 text-white'}`;
            avatar.innerText = sender === 'user' ? 'أنت' : 'AI';

            const bubble = document.createElement('div');
            bubble.id = msgId;
            bubble.className = `p-3 rounded-2xl text-sm max-w-lg ${
                sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tl-none' 
                : 'bg-gray-100 text-gray-800 rounded-tr-none'
            }`;
            bubble.innerText = text;

            flex.appendChild(avatar);
            flex.appendChild(bubble);
            messagesContainer.appendChild(flex);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgId;
        }
    </script>
</body>
</html>
