// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Chart.js
    window.Chart = Chart;
});

// Test Data Structure
const testData = {
    Biology: {
        'Chapter 1: Diversity in Living World': [
            {
                question: "Which taxonomic rank is the most specific?",
                options: ["Kingdom", "Species", "Phylum", "Class"],
                correct: 1,
                reason: "Species is the most specific taxonomic rank in biological classification."
            },
            {
                question: "Who is known as the father of taxonomy?",
                options: ["Charles Darwin", "Carl Linnaeus", "Gregor Mendel", "Louis Pasteur"],
                correct: 1,
                reason: "Carl Linnaeus established the binomial nomenclature system."
            }
        ],
        'Chapter 2: Plant Anatomy': [
            // Add more questions...
        ]
    },
    Physics: {
        'Chapter 1: Mechanics': [
            // Physics questions...
        ]
    },
    Chemistry: {
        'Chapter 1: Atomic Structure': [
            // Chemistry questions...
        ]
    }
};

// Test State Management
let currentTest = {
    subject: null,
    chapter: null,
    questions: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    startTime: null,
    timerInterval: null,
    timeTaken: 0
};

// DOM Elements
const homepage = document.getElementById('homepage');
const testPage = document.getElementById('testPage');
const resultsPage = document.getElementById('resultsPage');
const chaptersContainer = document.getElementById('chaptersContainer');
const questionsContainer = document.getElementById('questionsContainer');
const navigationGrid = document.getElementById('navigationGrid');

// Subject & Chapter Handling
function showChapters(subject) {
    currentTest.subject = subject;
    const chapters = Object.keys(testData[subject]);
    
    chaptersContainer.innerHTML = chapters.map(chapter => `
        <button class="chapter-btn" onclick="startTest('${subject}', '${chapter}')">
            ${chapter} - Start Test
        </button>
    `).join('');
}

function startTest(subject, chapter) {
    currentTest = {
        ...currentTest,
        subject,
        chapter,
        questions: testData[subject][chapter],
        userAnswers: testData[subject][chapter].map(() => ({
            selected: null,
            marked: false
        })),
        currentQuestionIndex: 0,
        startTime: Date.now(),
        timeTaken: 0
    };

    homepage.style.display = 'none';
    testPage.style.display = 'block';
    resultsPage.style.display = 'none';
    
    document.getElementById('testTitle').textContent = `${subject} - ${chapter}`;
    startTimer(4 * 60 * 60); // 4-hour timer
    renderQuestion();
}

// Timer Functionality
function startTimer(totalSeconds) {
    let remaining = totalSeconds;
    
    if (currentTest.timerInterval) clearInterval(currentTest.timerInterval);
    
    currentTest.timerInterval = setInterval(() => {
        remaining--;
        currentTest.timeTaken = totalSeconds - remaining;
        
        const hours = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        
        document.getElementById('time').textContent = 
            `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (remaining <= 0) submitTest();
    }, 1000);
}

// Question Rendering
function renderQuestion() {
    const { currentQuestionIndex, questions, userAnswers } = currentTest;
    const question = questions[currentQuestionIndex];
    
    questionsContainer.innerHTML = `
        <div class="question-card ${userAnswers[currentQuestionIndex].marked ? 'marked' : ''}">
            <div class="question-header">
                <span class="question-number">Question ${currentQuestionIndex + 1}</span>
                ${userAnswers[currentQuestionIndex].marked ? 
                    '<span class="mark-flag">📌 Marked</span>' : ''}
            </div>
            <p class="question-text">${question.question}</p>
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <div class="option-btn 
                        ${userAnswers[currentQuestionIndex].selected === index ? 'selected' : ''}"
                        onclick="selectAnswer(${index})">
                        <span class="option-letter">${String.fromCharCode(65 + index)})</span>
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    renderNavigationGrid();
}

// Answer Selection
function selectAnswer(optionIndex) {
    currentTest.userAnswers[currentTest.currentQuestionIndex].selected = optionIndex;
    renderQuestion();
}

// Navigation Controls
function navigateQuestion(direction) {
    const newIndex = currentTest.currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < currentTest.questions.length) {
        currentTest.currentQuestionIndex = newIndex;
        renderQuestion();
    }
}

function jumpToQuestion(index) {
    if (index >= 0 && index < currentTest.questions.length) {
        currentTest.currentQuestionIndex = index;
        renderQuestion();
    }
}

// Mark for Review
function toggleMark() {
    const currentIndex = currentTest.currentQuestionIndex;
    currentTest.userAnswers[currentIndex].marked = 
        !currentTest.userAnswers[currentIndex].marked;
    renderQuestion();
}

/// Enhanced Navigation Grid Rendering
function renderNavigationGrid() {
    navigationGrid.innerHTML = currentTest.questions.map((_, index) => {
        const answer = currentTest.userAnswers[index];
        const classes = ['question-number'];
        
        if (index === currentTest.currentQuestionIndex) classes.push('current');
        if (answer.selected !== null) classes.push('answered');
        if (answer.marked) classes.push('marked');
        if (answer.visited) classes.push('visited');

        return `
            <div class="${classes.join(' ')}" 
                 onclick="handleQuestionJump(${index})">
                ${index + 1}
            </div>
        `;
    }).join('');
}
// Enhanced Save & Next
function saveAndNext() {
    const currentIndex = currentTest.currentQuestionIndex;
    currentTest.userAnswers[currentIndex].visited = true;
    
    if (currentIndex < currentTest.questions.length - 1) {
        currentTest.currentQuestionIndex++;
        renderQuestion();
    } else {
        submitTest();
    }
}

// Test Submission
function submitTest() {
    clearInterval(currentTest.timerInterval);
    
    const score = calculateScore();
    showResults(score);
}

function calculateScore() {
    return currentTest.userAnswers.reduce((acc, answer, index) => {
        return acc + (answer.selected === currentTest.questions[index].correct ? 1 : 0);
    }, 0);
}


// Results Display
function showResults(score) {
    testPage.style.display = 'none';
    resultsPage.style.display = 'block';
    
    const totalQuestions = currentTest.questions.length;
    const accuracy = ((score / totalQuestions) * 100).toFixed(1);
    
    // Score Summary
    document.getElementById('finalScore').textContent = `${score}/${totalQuestions}`;
    document.getElementById('accuracy').textContent = `${accuracy}% Accuracy`;
    
    // Detailed Results
    document.getElementById('detailedResults').innerHTML = `
        <div class="results-breakdown">
            ${currentTest.questions.map((question, index) => {
                const userAnswer = currentTest.userAnswers[index];
                const isCorrect = userAnswer.selected === question.correct;
                
                return `
                    <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                        <div class="question-header">
                            <h4>Question ${index + 1}</h4>
                            ${userAnswer.marked ? '<span class="result-flag">📌 Marked</span>' : ''}
                        </div>
                        <p class="question-text">${question.question}</p>
                        <div class="answer-comparison">
                            <div class="user-answer">
                                <span>Your Answer:</span>
                                ${userAnswer.selected !== null ? 
                                    `${String.fromCharCode(65 + userAnswer.selected)}) ${question.options[userAnswer.selected]}` : 
                                    'Not answered'}
                            </div>
                            ${!isCorrect ? `
                                <div class="correct-answer">
                                    <span>Correct Answer:</span>
                                    ${String.fromCharCode(65 + question.correct)}) ${question.options[question.correct]}
                                </div>
                                <div class="explanation">${question.reason || ''}</div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Performance Chart
    renderPerformanceChart(score, totalQuestions - score);
}

function renderPerformanceChart(correct, incorrect) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Correct Answers', 'Incorrect Answers'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: ['#28a745', '#dc3545'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            }
        }
    });
}

// Enhanced Navigation Controls
function navigateQuestion(direction) {
    const currentIndex = currentTest.currentQuestionIndex;
    currentTest.userAnswers[currentIndex].visited = true;
    
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < currentTest.questions.length) {
        currentTest.currentQuestionIndex = newIndex;
        renderQuestion();
    }
}

function goHome() {
    homepage.style.display = 'block';
    testPage.style.display = 'none';
    resultsPage.style.display = 'none';
    clearInterval(currentTest.timerInterval);
}