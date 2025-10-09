// Global variables
let currentQuiz = null;
let currentQuestion = 0;
let quizTimer = null;
let timeRemaining = 0;
let userAnswers = [];
let quizStartTime = null;

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Initialize contact form if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        initializeContactForm();
    }
});

// Contact Form Functionality
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateContactForm()) {
            submitContactForm();
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateContactForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');

    let isValid = true;

    // Reset previous errors
    clearErrors();

    // Validate name
    if (!name.value.trim()) {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Validate email
    if (!email.value.trim()) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate subject
    if (!subject.value) {
        showError('subjectError', 'Please select a subject');
        isValid = false;
    }

    // Validate message
    if (!message.value.trim()) {
        showError('messageError', 'Message is required');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showError('messageError', 'Message must be at least 10 characters');
        isValid = false;
    }

    return isValid;
}

function validateField(field) {
    const errorId = field.id + 'Error';
    const errorElement = document.getElementById(errorId);
    
    if (!errorElement) return;

    let isValid = true;
    let errorMessage = '';

    switch(field.id) {
        case 'name':
            if (!field.value.trim()) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (field.value.trim().length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
            break;
        case 'email':
            if (!field.value.trim()) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(field.value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
        case 'subject':
            if (!field.value) {
                errorMessage = 'Please select a subject';
                isValid = false;
            }
            break;
        case 'message':
            if (!field.value.trim()) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (field.value.trim().length < 10) {
                errorMessage = 'Message must be at least 10 characters';
                isValid = false;
            }
            break;
    }

    if (isValid) {
        errorElement.classList.remove('show');
    } else {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
}

function submitContactForm() {
    const submitButton = document.querySelector('.submit-button');
    const successMessage = document.getElementById('successMessage');
    
    // Simulate form submission
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        
        // Show success message
        successMessage.classList.add('show');
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }, 2000);
}

// Chapter Management
function showChapter(chapterId) {
    const chaptersNav = document.querySelector('.chapters-nav');
    const chapterContent = document.getElementById('chapterContent');
    const chapterTitle = document.getElementById('chapterTitle');
    
    // Hide chapters navigation
    chaptersNav.style.display = 'none';
    
    // Show chapter content
    chapterContent.style.display = 'block';
    
    // Load chapter data
    const chapterData = getChapterData(chapterId);
    chapterTitle.textContent = chapterData.title;
    
    // Load notes
    loadChapterNotes(chapterData.notes);
    
    // Store current chapter for quiz
    currentQuiz = {
        chapterId: chapterId,
        questions: chapterData.questions,
        timeLimit: chapterData.timeLimit || 20 // minutes
    };
    
    // Reset tabs
    showTab('notes');
}

function hideChapter() {
    const chaptersNav = document.querySelector('.chapters-nav');
    const chapterContent = document.getElementById('chapterContent');
    
    // Show chapters navigation
    chaptersNav.style.display = 'block';
    
    // Hide chapter content
    chapterContent.style.display = 'none';
    
    // Stop any running quiz
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
}

function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    const activeContent = document.getElementById(tabName + 'Tab');
    if (activeContent) {
        activeContent.style.display = 'block';
    }
    
    // Load quiz if quiz tab is selected
    if (tabName === 'quiz' && currentQuiz) {
        loadQuiz();
    }
}

function loadChapterNotes(notes) {
    const notesContent = document.getElementById('notesContent');
    if (notesContent) {
        notesContent.innerHTML = notes;
    }
}

// Quiz Functionality
function loadQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    if (!quizContainer || !currentQuiz) return;
    
    // Reset quiz state
    currentQuestion = 0;
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    timeRemaining = currentQuiz.timeLimit * 60; // convert to seconds
    quizStartTime = new Date();
    
    // Create quiz HTML
    quizContainer.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-info">
                <h3>Chapter Quiz</h3>
                <p>${currentQuiz.questions.length} Questions • ${currentQuiz.timeLimit} Minutes</p>
            </div>
            <div class="quiz-timer" id="quizTimer">${formatTime(timeRemaining)}</div>
        </div>
        <div id="quizQuestions"></div>
        <div class="quiz-controls">
            <div class="quiz-progress">
                Question <span id="currentQuestionNum">1</span> of ${currentQuiz.questions.length}
            </div>
            <div class="quiz-nav">
                <button class="nav-btn" id="prevBtn" onclick="previousQuestion()" disabled>Previous</button>
                <button class="nav-btn" id="nextBtn" onclick="nextQuestion()">Next</button>
                <button class="submit-btn" id="submitBtn" onclick="submitQuiz()" style="display: none;">Submit Quiz</button>
            </div>
        </div>
    `;
    
    // Load first question
    loadQuestion(0);
    
    // Start timer
    startQuizTimer();
}

function loadQuestion(questionIndex) {
    const questionsContainer = document.getElementById('quizQuestions');
    const question = currentQuiz.questions[questionIndex];
    
    questionsContainer.innerHTML = `
        <div class="question-container">
            <div class="question-number">Question ${questionIndex + 1}</div>
            <div class="question-text">${question.question}</div>
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <label class="option" onclick="selectOption(${index})">
                        <input type="radio" name="question" value="${index}" ${userAnswers[questionIndex] === index ? 'checked' : ''}>
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update navigation
    updateQuizNavigation();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestion] = optionIndex;
    
    // Update visual selection
    document.querySelectorAll('.option').forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
    
    // Update navigation
    updateQuizNavigation();
}

function updateQuizNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const currentQuestionNum = document.getElementById('currentQuestionNum');
    
    // Update question number
    currentQuestionNum.textContent = currentQuestion + 1;
    
    // Update previous button
    prevBtn.disabled = currentQuestion === 0;
    
    // Update next/submit buttons
    if (currentQuestion === currentQuiz.questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}

function nextQuestion() {
    if (currentQuestion < currentQuiz.questions.length - 1) {
        currentQuestion++;
        loadQuestion(currentQuestion);
    }
}

function startQuizTimer() {
    quizTimer = setInterval(() => {
        timeRemaining--;
        
        const timerElement = document.getElementById('quizTimer');
        if (timerElement) {
            timerElement.textContent = formatTime(timeRemaining);
            
            // Change color when time is running low
            if (timeRemaining <= 300) { // 5 minutes
                timerElement.style.color = '#e74c3c';
            } else if (timeRemaining <= 600) { // 10 minutes
                timerElement.style.color = '#f39c12';
            }
        }
        
        // Auto-submit when time runs out
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function submitQuiz() {
    // Stop timer
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
    
    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = currentQuiz.questions.length;
    
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = Math.floor((new Date() - quizStartTime) / 1000);
    
    // Show results
    showQuizResults(score, correctAnswers, totalQuestions, timeTaken);
}

function showQuizResults(score, correct, total, timeTaken) {
    const quizContainer = document.getElementById('quizContainer');
    
    let message = '';
    let messageClass = '';
    
    if (score >= 80) {
        message = 'Excellent! You have a strong understanding of this chapter.';
        messageClass = 'success';
    } else if (score >= 60) {
        message = 'Good work! Consider reviewing the topics you missed.';
        messageClass = 'warning';
    } else {
        message = 'Keep studying! Review the chapter notes and try again.';
        messageClass = 'danger';
    }
    
    quizContainer.innerHTML = `
        <div class="quiz-result">
            <div class="result-score">${score}%</div>
            <div class="result-message ${messageClass}">${message}</div>
            <div class="result-details">
                <div class="result-item">
                    <h4>Correct Answers</h4>
                    <span>${correct} / ${total}</span>
                </div>
                <div class="result-item">
                    <h4>Time Taken</h4>
                    <span>${formatTime(timeTaken)}</span>
                </div>
                <div class="result-item">
                    <h4>Accuracy</h4>
                    <span>${score}%</span>
                </div>
                <div class="result-item">
                    <h4>Grade</h4>
                    <span>${getGrade(score)}</span>
                </div>
            </div>
            <button class="restart-btn" onclick="loadQuiz()">
                <i class="fas fa-redo"></i> Retake Quiz
            </button>
        </div>
    `;
}

function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

// Chapter Data
function getChapterData(chapterId) {
    const chapterDatabase = {
        // Physics chapters
        // chapter 1
        mechanics: {
            title: 'Basic and Foundations',
            timeLimit: 60,
            notes: `
                <h3>Physical Quantities</h3>

                <p>Scalar quantities → only magnitude (e.g., mass, speed, temperature).

Vector quantities → magnitude + direction (e.g., displacement, velocity, force).

Dimension → power to which fundamental units are raised to represent a physical quantity.</p>
                
                <h3>Systems of Units</h3>

                 <ul class="list">
            <li><b>CGS</b> → length in cm, mass in g, time in s</li>
            <li><b>MKS</b> → length in m, mass in kg, time in s</li>
            <li><b>SI Units</b> → globally accepted; <b>7 fundamental quantities</b>:</li>
          </ul>
                
                <h3>Dimensional Analysis.</h3>

                <p><strong>First Law (Law of Inertia):</strong> An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force.</p>
                <p><strong>Second Law:</strong> The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma</p>
                <p><strong>Third Law:</strong> For every action, there is an equal and opposite reaction.</p>
                
                <h3>Errors in Measuremnt </h3>

                <p>Work is done when a force causes displacement. The work-energy theorem states that the work done on an object equals the change in its kinetic energy.</p>
                <ul>
                    <li>Kinetic Energy: KE = ½mv²</li>
                    <li>Potential Energy: PE = mgh (gravitational)</li>
                    <li>Work: W = F·d·cos(θ)</li>
                </ul>

                <h3>Significant Figures</h3>
                <p>Significant figures are the digits in a number that carry meaningful information about its precision. Rules for determining significant figures include:</p>
                <ul>
                    <li>All non-zero digits are significant.</li>
                    <li>Zeros between non-zero digits are significant.</li>
                    <li>Leading zeros are not significant.</li>
                    <li>Trailing zeros in a decimal number are significant.</li>
                    <li>Trailing zeros in a whole number without a decimal point are ambiguous.</li>
                </ul>

                <h3>Scalar and Vectors</h3>
                <p>Scalar quantities have only magnitude (e.g., mass, temperature), while vector quantities have both magnitude and direction (e.g., displacement, velocity).</p>
                <ul>
                    <li>Scalar: Speed, Mass, Temperature</li>
                    <li>Vector: Velocity, Force, Displacement</li>
                </ul>
                <p>Vectors Addition (Triangle Law): To add two vectors, place them head to tail and draw the resultant vector from the tail of the first vector to the head of the second vector.</p>
                <p>Vectors Subtraction: To subtract a vector, reverse its direction and then add it to the other vector.</p>
                <ul>
                    <li>Vector Addition: A + B = C</li>
                    <li>Vector Subtraction: A - B = C (where B is reversed)</li>
                </ul>
                <ul>
                <li>R = √(A² + B² + 2ABcosθ) (Magnitude of Resultant Vector)</li>
                <li>θ = tan⁻¹(B/A) (Direction of Resultant Vector)</li>
                </ul>
                <p>Special Cases:</p>
                <ul>
                    <li>Perpendicular Vectors: R = √(A² + B²)</li>
                    <li>Parallel Vectors: R = A + B (if in the same direction) or R = A - B (if in opposite directions)</li>
                </ul>

                <h3>Resolution of Vectors</h3>
                <p>Resolution of vectors involves breaking a vector into its components along specified axes (usually x and y axes).</p>
                <ul>
                    <li>For a vector A at angle θ: Ax = A cos(θ), Ay = A sin(θ)</li>
                    <li>Resultant vector R can be found using: R = √(Ax² + Ay²)</li>
                </ul>

                <h3>Unit Conversion</h3>
                <p>Unit conversion is the process of converting a quantity from one unit to another. Common conversions include:</p>
                <ul>
                    <li>Length: 1 m = 100 cm, 1 km = 1000 m</li>
                    <li>Mass: 1 kg = 100 g, 1 g = 1000 mg</li>
                    <li>Time: 1 hour = 60 minutes, 1 minute = 60 seconds</li>
                    <li>Speed: 1 m/s = 3.6 km/h, 1 km/h = 0.27778 m/s</li>
                </ul>

                <h3>Entrance Exam Tips</h3>
                <p>When preparing for entrance exams, focus on understanding the fundamental concepts, practicing problem-solving, and familiarizing yourself with the exam format. Here are some tips:</p>
                <ul>
                    <li>Review key formulas and their applications.</li>
                    <li>Practice solving problems from previous exams.</li>
                    <li>Dimensional analysis is a fast way to eliminate wrong MCQ options.</li>
                    <li>Always check your units and conversions.</li>
                    <li>Remember Vector formulas - many physics MBBS QUestions hide them in motion/force problems.</li>
                </ul>
                
            `,
            questions: [
                {
                    question: "What is Newton's Second Law of Motion?",
                    options: ["F = ma", "For every action there is an equal and opposite reaction", "An object at rest stays at rest", "Energy cannot be created or destroyed"],
                    correct: 0
                },
                {
                    question: "If a 5 kg object accelerates at 2 m/s², what is the net force acting on it?",
                    options: ["7 N", "3 N", "10 N", "2.5 N"],
                    correct: 2
                },
                {
                    question: "What is the formula for kinetic energy?",
                    options: ["mgh", "½mv²", "F·d", "ma"],
                    correct: 1
                },
                {
                    question: "Which quantity is a vector?",
                    options: ["Speed", "Mass", "Time", "Velocity"],
                    correct: 3
                },
                {
                    question: "What happens to an object's motion according to Newton's First Law if no external force acts on it?",
                    options: ["It accelerates", "It decelerates", "It maintains constant velocity", "It stops immediately"],
                    correct: 2
                },
                {
                    question: "Work is measured in which units?",
                    options: ["Watts", "Joules", "Newtons", "Meters per second"],
                    correct: 1
                },
                {
                    question: "What is the relationship between work and energy?",
                    options: ["Work equals kinetic energy", "Work equals the change in kinetic energy", "Work is independent of energy", "Work is always greater than energy"],
                    correct: 1
                },
                {
                    question: "If an object moves at constant velocity, what can we say about the net force?",
                    options: ["Net force is maximum", "Net force is minimum", "Net force is zero", "Net force equals weight"],
                    correct: 2
                },
                {
                    question: "What type of energy does a ball have at the highest point of its trajectory?",
                    options: ["Only kinetic energy", "Only potential energy", "Both kinetic and potential energy", "No energy"],
                    correct: 2
                },
                {
                    question: "Which of Newton's laws explains why you feel pushed back in your seat when a car accelerates?",
                    options: ["First Law", "Second Law", "Third Law", "Law of Universal Gravitation"],
                    correct: 0
                }
            ]
        },
        // chapter 2
        kinematics: {
            title: 'Kinematics',
            timeLimit: 60,
            notes: `
                <h3>Introduction to Kinematics</h3>
                <p>Kinematics is the study of motion without considering the forces that cause the motion.</p>
                
                <h3>Position and Displacement</h3>
                <ul>
                    <li><strong>Position:</strong> Location of an object at a particular time</li>
                    <li><strong>Displacement:</strong> Change in position (vector quantity)</li>
                    <li><strong>Distance:</strong> Total path traveled (scalar quantity)</li>
                </ul>
                
                <h3>Velocity and Speed</h3>
                <ul>
                    <li><strong>Speed:</strong> Rate of change of distance (scalar)</li>
                    <li><strong>Velocity:</strong> Rate of change of displacement (vector)</li>
                    <li>Average velocity = Displacement/Time</li>
                    <li>Instantaneous velocity = dx/dt</li>
                </ul>
                
                <h3>Acceleration</h3>
                <ul>
                    <li>Rate of change of velocity</li>
                    <li>Average acceleration = Δv/Δt</li>
                    <li>Instantaneous acceleration = dv/dt</li>
                </ul>
                
                <h3>Equations of Motion</h3>
                <p>For uniform acceleration:</p>
                <ul>
                    <li>v = u + at</li>
                    <li>s = ut + ½at²</li>
                    <li>v² = u² + 2as</li>
                </ul>
                
                <h3>Graphical Analysis</h3>
                <ul>
                    <li><strong>Position-time graph:</strong> Slope gives velocity</li>
                    <li><strong>Velocity-time graph:</strong> Slope gives acceleration, area gives displacement</li>
                    <li><strong>Acceleration-time graph:</strong> Area gives change in velocity</li>
                </ul>
            `,
            questions: [
                {
                    question: "What is the difference between speed and velocity?",
                    options: ["Speed is vector, velocity is scalar", "Speed is scalar, velocity is vector", "They are the same", "Speed is always greater"],
                    correct: 1
                },
                {
                    question: "Which equation relates velocity, acceleration, and displacement?",
                    options: ["v = u + at", "s = ut + ½at²", "v² = u² + 2as", "All of the above"],
                    correct: 2
                },
                {
                    question: "The slope of a position-time graph represents:",
                    options: ["Acceleration", "Velocity", "Displacement", "Distance"],
                    correct: 1
                },
                {
                    question: "For an object in uniform motion, acceleration is:",
                    options: ["Positive", "Negative", "Zero", "Variable"],
                    correct: 2
                },
                {
                    question: "The area under a velocity-time graph gives:",
                    options: ["Acceleration", "Distance", "Displacement", "Speed"],
                    correct: 2
                },
                {
                    question: "If an object starts from rest and accelerates at 2 m/s² for 5 seconds, what is its final velocity?",
                    options: ["7 m/s", "10 m/s", "12 m/s", "25 m/s"],
                    correct: 1
                },
                {
                    question: "Which quantity has both magnitude and direction?",
                    options: ["Distance", "Speed", "Displacement", "Time"],
                    correct: 2
                },
                {
                    question: "In free fall, the acceleration due to gravity is approximately:",
                    options: ["9.8 m/s", "9.8 m/s²", "10 m/s", "10 m/s²"],
                    correct: 1
                },
                {
                    question: "The slope of a velocity-time graph represents:",
                    options: ["Distance", "Displacement", "Acceleration", "Speed"],
                    correct: 2
                },
                {
                    question: "If a car travels 100 m in 10 s, its average speed is:",
                    options: ["10 m/s", "100 m/s", "1000 m/s", "1 m/s"],
                    correct: 0
                }
            ]
        },
        
        // chapter 3
        dynamics: {
            title: 'Dynamics',
            timeLimit: 60,
            notes: `
                <h3>Introduction to Dynamics</h3>
                <p>Dynamics is the study of motion considering the forces that cause the motion.</p>
                
                <h3>Force</h3>
                <ul>
                    <li>A push or pull acting on an object</li>
                    <li>Vector quantity (has magnitude and direction)</li>
                    <li>Unit: Newton (N)</li>
                    <li>Net force = Sum of all forces</li>
                </ul>
                
                <h3>Newton's Laws of Motion</h3>
                <p><strong>First Law:</strong> An object at rest stays at rest, and an object in uniform motion stays in uniform motion, unless acted upon by an unbalanced force.</p>
                <p><strong>Second Law:</strong> F = ma (Force equals mass times acceleration)</p>
                <p><strong>Third Law:</strong> For every action, there is an equal and opposite reaction.</p>
                
                <h3>Types of Forces</h3>
                <ul>
                    <li><strong>Weight:</strong> W = mg</li>
                    <li><strong>Normal force:</strong> Perpendicular to surface</li>
                    <li><strong>Friction:</strong> Opposes motion</li>
                    <li><strong>Tension:</strong> Force in strings/ropes</li>
                </ul>
                
                <h3>Friction</h3>
                <ul>
                    <li><strong>Static friction:</strong> Prevents motion (fs ≤ μsN)</li>
                    <li><strong>Kinetic friction:</strong> Opposes motion (fk = μkN)</li>
                    <li>μs > μk (static coefficient > kinetic coefficient)</li>
                </ul>
                
                <h3>Applications</h3>
                <ul>
                    <li>Inclined planes</li>
                    <li>Pulley systems</li>
                    <li>Connected objects</li>
                    <li>Circular motion dynamics</li>
                </ul>
            `,
            questions: [
                {
                    question: "Newton's Second Law is expressed as:",
                    options: ["F = mv", "F = ma", "F = mg", "F = mv²"],
                    correct: 1
                },
                {
                    question: "If the net force on an object is zero, the object will:",
                    options: ["Accelerate", "Decelerate", "Move at constant velocity", "Stop immediately"],
                    correct: 2
                },
                {
                    question: "The force that opposes motion between surfaces is:",
                    options: ["Normal force", "Weight", "Friction", "Tension"],
                    correct: 2
                },
                {
                    question: "According to Newton's Third Law:",
                    options: ["Force equals mass times acceleration", "Every action has an equal and opposite reaction", "Objects at rest stay at rest", "Force is proportional to acceleration"],
                    correct: 1
                },
                {
                    question: "The weight of an object is:",
                    options: ["mg", "ma", "mv", "mv²"],
                    correct: 0
                },
                {
                    question: "Static friction is generally:",
                    options: ["Less than kinetic friction", "Equal to kinetic friction", "Greater than kinetic friction", "Independent of the surface"],
                    correct: 2
                },
                {
                    question: "The normal force is always:",
                    options: ["Equal to weight", "Perpendicular to the surface", "In the direction of motion", "Greater than applied force"],
                    correct: 1
                },
                {
                    question: "If a 10 kg object experiences a net force of 20 N, its acceleration is:",
                    options: ["2 m/s²", "10 m/s²", "20 m/s²", "200 m/s²"],
                    correct: 0
                },
                {
                    question: "Inertia is the tendency of an object to:",
                    options: ["Accelerate", "Change direction", "Resist changes in motion", "Move in circles"],
                    correct: 2
                },
                {
                    question: "The unit of force in SI system is:",
                    options: ["Dyne", "Pound", "Newton", "Kilogram"],
                    correct: 2
                }
            ]
        },
        
        // chapter 4
        workenergypower: {
            title: 'Work, Energy and Power',
            timeLimit: 60,
            notes: `
                <h3>Work</h3>
                <ul>
                    <li>Work = Force × Displacement × cos(θ)</li>
                    <li>W = F·s·cos(θ)</li>
                    <li>Unit: Joule (J)</li>
                    <li>Scalar quantity</li>
                </ul>
                
                <h3>Energy</h3>
                <p><strong>Kinetic Energy:</strong> Energy due to motion</p>
                <ul>
                    <li>KE = ½mv²</li>
                    <li>Depends on mass and velocity</li>
                </ul>
                
                <p><strong>Potential Energy:</strong> Energy due to position</p>
                <ul>
                    <li>Gravitational PE = mgh</li>
                    <li>Elastic PE = ½kx²</li>
                </ul>
                
                <h3>Conservation of Energy</h3>
                <ul>
                    <li>Energy cannot be created or destroyed</li>
                    <li>Total mechanical energy = KE + PE</li>
                    <li>In absence of friction: E = constant</li>
                </ul>
                
                <h3>Work-Energy Theorem</h3>
                <ul>
                    <li>Work done = Change in kinetic energy</li>
                    <li>W = ΔKE = KEf - KEi</li>
                </ul>
                
                <h3>Power</h3>
                <ul>
                    <li>Rate of doing work</li>
                    <li>P = W/t = F·v</li>
                    <li>Unit: Watt (W) = J/s</li>
                </ul>
                
                <h3>Efficiency</h3>
                <ul>
                    <li>η = (Useful output/Total input) × 100%</li>
                    <li>Always less than 100% due to losses</li>
                </ul>
            `,
            questions: [
                {
                    question: "The formula for work done is:",
                    options: ["F × d", "F × d × sin(θ)", "F × d × cos(θ)", "F × d × tan(θ)"],
                    correct: 2
                },
                {
                    question: "The unit of work and energy is:",
                    options: ["Newton", "Watt", "Joule", "Pascal"],
                    correct: 2
                },
                {
                    question: "Kinetic energy depends on:",
                    options: ["Mass only", "Velocity only", "Both mass and velocity", "Neither mass nor velocity"],
                    correct: 2
                },
                {
                    question: "According to conservation of energy:",
                    options: ["Energy increases with time", "Energy decreases with time", "Energy remains constant", "Energy becomes zero"],
                    correct: 2
                },
                {
                    question: "Power is defined as:",
                    options: ["Force per unit time", "Work per unit time", "Energy per unit mass", "Work per unit distance"],
                    correct: 1
                },
                {
                    question: "The potential energy of an object at height h is:",
                    options: ["mgh", "½mv²", "F·d", "½kx²"],
                    correct: 0
                },
                {
                    question: "When a force is perpendicular to displacement, work done is:",
                    options: ["Maximum", "Minimum", "Zero", "Negative"],
                    correct: 2
                },
                {
                    question: "The unit of power is:",
                    options: ["Joule", "Newton", "Watt", "Pascal"],
                    correct: 2
                },
                {
                    question: "If a 2 kg object moves at 10 m/s, its kinetic energy is:",
                    options: ["20 J", "100 J", "200 J", "400 J"],
                    correct: 1
                },
                {
                    question: "Work-energy theorem relates work done to:",
                    options: ["Change in potential energy", "Change in kinetic energy", "Total energy", "Power"],
                    correct: 1
                }
            ]
        },
        
        // chapter 5
        rotationalmotion: {
            title: 'Rotational Motion',
            timeLimit: 60,
            notes: `
                <h3>Angular Quantities</h3>
                <ul>
                    <li><strong>Angular displacement:</strong> θ (radians)</li>
                    <li><strong>Angular velocity:</strong> ω = dθ/dt (rad/s)</li>
                    <li><strong>Angular acceleration:</strong> α = dω/dt (rad/s²)</li>
                </ul>
                
                <h3>Rotational Kinematics</h3>
                <ul>
                    <li>ω = ω₀ + αt</li>
                    <li>θ = ω₀t + ½αt²</li>
                    <li>ω² = ω₀² + 2αθ</li>
                </ul>
                
                <h3>Relationship with Linear Motion</h3>
                <ul>
                    <li>v = rω (linear velocity)</li>
                    <li>a = rα (tangential acceleration)</li>
                    <li>ac = v²/r = rω² (centripetal acceleration)</li>
                </ul>
                
                <h3>Moment of Inertia</h3>
                <ul>
                    <li>I = Σmr² (rotational inertia)</li>
                    <li>Analogous to mass in linear motion</li>
                    <li>Depends on mass distribution</li>
                </ul>
                
                <h3>Torque</h3>
                <ul>
                    <li>τ = r × F = rF sin(θ)</li>
                    <li>Rotational equivalent of force</li>
                    <li>τ = Iα (rotational Newton's second law)</li>
                </ul>
                
                <h3>Rotational Energy</h3>
                <ul>
                    <li>Rotational KE = ½Iω²</li>
                    <li>Total KE = ½mv² + ½Iω² (rolling motion)</li>
                </ul>
                
                <h3>Angular Momentum</h3>
                <ul>
                    <li>L = Iω (analogous to p = mv)</li>
                    <li>Conservation of angular momentum</li>
                </ul>
            `,
            questions: [
                {
                    question: "Angular velocity is measured in:",
                    options: ["rad", "rad/s", "rad/s²", "m/s"],
                    correct: 1
                },
                {
                    question: "The relationship between linear and angular velocity is:",
                    options: ["v = rω", "v = r/ω", "v = ω/r", "v = rω²"],
                    correct: 0
                },
                {
                    question: "Moment of inertia depends on:",
                    options: ["Mass only", "Distance only", "Both mass and distance", "Neither mass nor distance"],
                    correct: 2
                },
                {
                    question: "Torque is the rotational equivalent of:",
                    options: ["Mass", "Velocity", "Force", "Acceleration"],
                    correct: 2
                },
                {
                    question: "The rotational kinetic energy is:",
                    options: ["½mv²", "½Iω²", "Iω", "mgh"],
                    correct: 1
                },
                {
                    question: "Angular momentum is conserved when:",
                    options: ["Net torque is zero", "Net force is zero", "Angular velocity is constant", "Angular acceleration is zero"],
                    correct: 0
                },
                {
                    question: "Centripetal acceleration is directed:",
                    options: ["Tangentially", "Toward the center", "Away from center", "Perpendicular to plane"],
                    correct: 1
                },
                {
                    question: "The unit of torque is:",
                    options: ["N·m", "N·s", "kg·m²", "rad/s"],
                    correct: 0
                },
                {
                    question: "For rolling without slipping:",
                    options: ["v = rω", "v > rω", "v < rω", "v = 2rω"],
                    correct: 0
                },
                {
                    question: "Angular momentum is:",
                    options: ["Iω", "Iα", "mω", "mv"],
                    correct: 0
                }
            ]
        },
        
        // Chemistry chapters
        // chapter 1
        atomicstructure: {
            title: 'Atomic Structure',
            timeLimit: 60,
            notes: `
                <h3>Atomic Models</h3>
                <ul>
                    <li><strong>Dalton's Model:</strong> Atom as indivisible sphere</li>
                    <li><strong>Thomson's Model:</strong> Plum pudding model</li>
                    <li><strong>Rutherford's Model:</strong> Nuclear model</li>
                    <li><strong>Bohr's Model:</strong> Planetary model with quantized orbits</li>
                </ul>
                
                <h3>Subatomic Particles</h3>
                <ul>
                    <li><strong>Protons:</strong> +1 charge, mass ≈ 1 amu, in nucleus</li>
                    <li><strong>Neutrons:</strong> 0 charge, mass ≈ 1 amu, in nucleus</li>
                    <li><strong>Electrons:</strong> -1 charge, mass ≈ 0 amu, in orbitals</li>
                </ul>
                
                <h3>Atomic Number and Mass</h3>
                <ul>
                    <li><strong>Atomic number (Z):</strong> Number of protons</li>
                    <li><strong>Mass number (A):</strong> Protons + neutrons</li>
                    <li><strong>Isotopes:</strong> Same Z, different A</li>
                </ul>
                
                <h3>Electronic Configuration</h3>
                <ul>
                    <li>1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰...</li>
                    <li><strong>Aufbau principle:</strong> Fill lower energy orbitals first</li>
                    <li><strong>Pauli exclusion:</strong> Max 2 electrons per orbital</li>
                    <li><strong>Hund's rule:</strong> Fill singly before pairing</li>
                </ul>
                
                <h3>Quantum Numbers</h3>
                <ul>
                    <li><strong>n:</strong> Principal (energy level)</li>
                    <li><strong>l:</strong> Azimuthal (subshell)</li>
                    <li><strong>ml:</strong> Magnetic (orbital orientation)</li>
                    <li><strong>ms:</strong> Spin (electron spin)</li>
                </ul>
            `,
            questions: [
                {
                    question: "The atomic number represents:",
                    options: ["Number of neutrons", "Number of protons", "Number of electrons", "Total mass"],
                    correct: 1
                },
                {
                    question: "Isotopes have the same:",
                    options: ["Mass number", "Number of neutrons", "Atomic number", "Both mass and atomic number"],
                    correct: 2
                },
                {
                    question: "The maximum number of electrons in s orbital is:",
                    options: ["2", "6", "10", "14"],
                    correct: 0
                },
                {
                    question: "Which principle states that electrons fill lower energy orbitals first?",
                    options: ["Pauli exclusion", "Hund's rule", "Aufbau principle", "Heisenberg uncertainty"],
                    correct: 2
                },
                {
                    question: "The electronic configuration of carbon (Z=6) is:",
                    options: ["1s² 2s² 2p²", "1s² 2s³ 2p¹", "1s² 2s¹ 2p³", "1s¹ 2s² 2p³"],
                    correct: 0
                },
                {
                    question: "Rutherford's alpha particle scattering experiment led to the discovery of:",
                    options: ["Electrons", "Neutrons", "Nucleus", "Protons"],
                    correct: 2
                },
                {
                    question: "The charge of an electron is:",
                    options: ["+1", "-1", "0", "+2"],
                    correct: 1
                },
                {
                    question: "Mass number is the sum of:",
                    options: ["Protons and electrons", "Neutrons and electrons", "Protons and neutrons", "All particles"],
                    correct: 2
                },
                {
                    question: "The p subshell can hold maximum:",
                    options: ["2 electrons", "6 electrons", "10 electrons", "14 electrons"],
                    correct: 1
                },
                {
                    question: "In Bohr's model, electrons move in:",
                    options: ["Random paths", "Fixed orbits", "Straight lines", "Zigzag patterns"],
                    correct: 1
                }
            ]
        },
        
        // chapter 2
        chemicalbonding: {
            title: 'Chemical Bonding',
            timeLimit: 60,
            notes: `
                <h3>Types of Chemical Bonds</h3>
                <ul>
                    <li><strong>Ionic bonds:</strong> Metal + non-metal, electron transfer</li>
                    <li><strong>Covalent bonds:</strong> Non-metal + non-metal, electron sharing</li>
                    <li><strong>Metallic bonds:</strong> Metal atoms, sea of electrons</li>
                </ul>
                
                <h3>Ionic Bonding</h3>
                <ul>
                    <li>Complete transfer of electrons</li>
                    <li>Forms cations (+) and anions (-)</li>
                    <li>High melting/boiling points</li>
                    <li>Conduct electricity when dissolved</li>
                </ul>
                
                <h3>Covalent Bonding</h3>
                <ul>
                    <li><strong>Single bond:</strong> Share 1 electron pair (A-B)</li>
                    <li><strong>Double bond:</strong> Share 2 electron pairs (A=B)</li>
                    <li><strong>Triple bond:</strong> Share 3 electron pairs (A≡B)</li>
                </ul>
                
                <h3>Lewis Structures</h3>
                <ul>
                    <li>Represent valence electrons as dots</li>
                    <li>Show bonding and lone pairs</li>
                    <li>Follow octet rule (8 electrons around each atom)</li>
                </ul>
                
                <h3>Molecular Geometry</h3>
                <ul>
                    <li><strong>Linear:</strong> 180° (CO₂)</li>
                    <li><strong>Trigonal planar:</strong> 120° (BF₃)</li>
                    <li><strong>Tetrahedral:</strong> 109.5° (CH₄)</li>
                    <li><strong>Bent:</strong> <109.5° (H₂O)</li>
                </ul>
                
                <h3>Intermolecular Forces</h3>
                <ul>
                    <li><strong>Van der Waals:</strong> Weak attractive forces</li>
                    <li><strong>Hydrogen bonds:</strong> H attached to N, O, or F</li>
                    <li><strong>Dipole-dipole:</strong> Between polar molecules</li>
                </ul>
            `,
            questions: [
                {
                    question: "Ionic bonds are formed between:",
                    options: ["Metal and metal", "Non-metal and non-metal", "Metal and non-metal", "Noble gases"],
                    correct: 2
                },
                {
                    question: "In covalent bonding, electrons are:",
                    options: ["Transferred", "Shared", "Lost", "Gained"],
                    correct: 1
                },
                {
                    question: "The octet rule states that atoms tend to have:",
                    options: ["2 electrons", "4 electrons", "6 electrons", "8 electrons"],
                    correct: 3
                },
                {
                    question: "Water molecule has a bent shape because:",
                    options: ["It has 2 lone pairs", "It has 1 lone pair", "It follows octet rule", "It has hydrogen bonds"],
                    correct: 0
                },
                {
                    question: "A double bond consists of:",
                    options: ["1 electron pair", "2 electron pairs", "3 electron pairs", "4 electron pairs"],
                    correct: 1
                },
                {
                    question: "Hydrogen bonding occurs when hydrogen is bonded to:",
                    options: ["Carbon", "Nitrogen, oxygen, or fluorine", "Any halogen", "Any metal"],
                    correct: 1
                },
                {
                    question: "The bond angle in methane (CH₄) is:",
                    options: ["90°", "109.5°", "120°", "180°"],
                    correct: 1
                },
                {
                    question: "Ionic compounds typically have:",
                    options: ["Low melting points", "High melting points", "No melting points", "Variable melting points"],
                    correct: 1
                },
                {
                    question: "The strongest intermolecular force is:",
                    options: ["Van der Waals", "Dipole-dipole", "Hydrogen bonding", "London forces"],
                    correct: 2
                },
                {
                    question: "In Lewis structures, valence electrons are represented by:",
                    options: ["Lines", "Dots", "Circles", "Squares"],
                    correct: 1
                }
            ]
        },
        
        // Mathematics chapters
        // chapter 1
        algebra: {
            title: 'Algebra',
            timeLimit: 60,
            notes: `
                <h3>Basic Operations</h3>
                <ul>
                    <li><strong>Addition/Subtraction:</strong> Combine like terms</li>
                    <li><strong>Multiplication:</strong> Distribute and combine</li>
                    <li><strong>Division:</strong> Factor and cancel</li>
                </ul>
                
                <h3>Linear Equations</h3>
                <ul>
                    <li><strong>Standard form:</strong> ax + b = 0</li>
                    <li><strong>Slope-intercept:</strong> y = mx + b</li>
                    <li><strong>Point-slope:</strong> y - y₁ = m(x - x₁)</li>
                </ul>
                
                <h3>Quadratic Equations</h3>
                <ul>
                    <li><strong>Standard form:</strong> ax² + bx + c = 0</li>
                    <li><strong>Quadratic formula:</strong> x = (-b ± √(b² - 4ac))/2a</li>
                    <li><strong>Factoring:</strong> (x - r)(x - s) = 0</li>
                    <li><strong>Completing square:</strong> a(x - h)² + k = 0</li>
                </ul>
                
                <h3>Systems of Equations</h3>
                <ul>
                    <li><strong>Substitution method</strong></li>
                    <li><strong>Elimination method</strong></li>
                    <li><strong>Graphical method</strong></li>
                    <li><strong>Matrix method</strong></li>
                </ul>
                
                <h3>Inequalities</h3>
                <ul>
                    <li><strong>Linear inequalities:</strong> ax + b < 0</li>
                    <li><strong>Quadratic inequalities:</strong> ax² + bx + c ≥ 0</li>
                    <li><strong>Absolute value inequalities</strong></li>
                </ul>
                
                <h3>Functions</h3>
                <ul>
                    <li><strong>Domain and range</strong></li>
                    <li><strong>Composite functions</strong></li>
                    <li><strong>Inverse functions</strong></li>
                    <li><strong>Transformations</strong></li>
                </ul>
            `,
            questions: [
                {
                    question: "The quadratic formula is:",
                    options: ["x = -b ± √(b² - 4ac)/2a", "x = (-b ± √(b² - 4ac))/2a", "x = -b ± √(b² + 4ac)/2a", "x = b ± √(b² - 4ac)/2a"],
                    correct: 1
                },
                {
                    question: "The slope-intercept form of a line is:",
                    options: ["ax + by = c", "y = mx + b", "x = my + b", "y - y₁ = m(x - x₁)"],
                    correct: 1
                },
                {
                    question: "To solve x² - 5x + 6 = 0, we factor as:",
                    options: ["(x - 2)(x - 3) = 0", "(x + 2)(x + 3) = 0", "(x - 1)(x - 6) = 0", "(x + 1)(x + 6) = 0"],
                    correct: 0
                },
                {
                    question: "The discriminant b² - 4ac determines:",
                    options: ["The y-intercept", "The number of solutions", "The vertex", "The axis of symmetry"],
                    correct: 1
                },
                {
                    question: "If f(x) = 2x + 3, then f(5) equals:",
                    options: ["10", "11", "13", "15"],
                    correct: 2
                },
                {
                    question: "The solution to |x - 3| = 5 is:",
                    options: ["x = 8", "x = -2", "x = 8 or x = -2", "x = 2 or x = 8"],
                    correct: 2
                },
                {
                    question: "In the equation y = ax² + bx + c, if a > 0, the parabola opens:",
                    options: ["Upward", "Downward", "Left", "Right"],
                    correct: 0
                },
                {
                    question: "The vertex of y = x² - 4x + 3 is at:",
                    options: ["(2, -1)", "(-2, 1)", "(2, 1)", "(-2, -1)"],
                    correct: 0
                },
                {
                    question: "To solve the system x + y = 5, x - y = 1 by elimination:",
                    options: ["Add the equations", "Subtract the equations", "Multiply first by 2", "Divide second by 2"],
                    correct: 0
                },
                {
                    question: "The domain of f(x) = √(x - 2) is:",
                    options: ["x ≥ 2", "x ≤ 2", "x > 2", "x < 2"],
                    correct: 0
                }
            ]
        },
        
        // chapter 2
        trigonometry: {
            title: 'Trigonometry',
            timeLimit: 60,
            notes: `
                <h3>Trigonometric Ratios</h3>
                <ul>
                    <li><strong>sin θ = opposite/hypotenuse</strong></li>
                    <li><strong>cos θ = adjacent/hypotenuse</strong></li>
                    <li><strong>tan θ = opposite/adjacent</strong></li>
                    <li><strong>csc θ = 1/sin θ</strong></li>
                    <li><strong>sec θ = 1/cos θ</strong></li>
                    <li><strong>cot θ = 1/tan θ</strong></li>
                </ul>
                
                <h3>Special Angles</h3>
                <ul>
                    <li><strong>30°:</strong> sin = 1/2, cos = √3/2, tan = 1/√3</li>
                    <li><strong>45°:</strong> sin = √2/2, cos = √2/2, tan = 1</li>
                    <li><strong>60°:</strong> sin = √3/2, cos = 1/2, tan = √3</li>
                </ul>
                
                <h3>Trigonometric Identities</h3>
                <ul>
                    <li><strong>Pythagorean:</strong> sin²θ + cos²θ = 1</li>
                    <li><strong>Double angle:</strong> sin(2θ) = 2sinθcosθ</li>
                    <li><strong>Sum formulas:</strong> sin(A + B) = sinAcosB + cosAsinB</li>
                </ul>
                
                <h3>Unit Circle</h3>
                <ul>
                    <li>Circle with radius 1 centered at origin</li>
                    <li>Coordinates (cosθ, sinθ)</li>
                    <li>Relates angles to trigonometric values</li>
                </ul>
                
                <h3>Trigonometric Equations</h3>
                <ul>
                    <li>Solve for angles that satisfy trig equations</li>
                    <li>Consider periodic nature of trig functions</li>
                    <li>Use inverse trig functions</li>
                </ul>
            `,
            questions: [
                {
                    question: "sin(30°) equals:",
                    options: ["1/2", "√2/2", "√3/2", "1"],
                    correct: 0
                },
                {
                    question: "The Pythagorean identity is:",
                    options: ["sin²θ + cos²θ = 1", "sin²θ - cos²θ = 1", "sinθ + cosθ = 1", "sinθ × cosθ = 1"],
                    correct: 0
                },
                {
                    question: "tan(45°) equals:",
                    options: ["0", "1/2", "1", "√3"],
                    correct: 2
                },
                {
                    question: "cos(60°) equals:",
                    options: ["1/2", "√2/2", "√3/2", "1"],
                    correct: 0
                },
                {
                    question: "The reciprocal of sine is:",
                    options: ["Cosine", "Tangent", "Cosecant", "Secant"],
                    correct: 2
                },
                {
                    question: "In a right triangle, if the opposite side is 3 and hypotenuse is 5, then sin θ is:",
                    options: ["3/4", "3/5", "4/5", "5/3"],
                    correct: 1
                },
                {
                    question: "The period of sin(x) is:",
                    options: ["π", "2π", "π/2", "4π"],
                    correct: 1
                },
                {
                    question: "sin(90°) equals:",
                    options: ["0", "1/2", "√2/2", "1"],
                    correct: 3
                },
                {
                    question: "The double angle formula for sine is:",
                    options: ["sin(2θ) = 2sinθ", "sin(2θ) = 2cosθ", "sin(2θ) = 2sinθcosθ", "sin(2θ) = sin²θ"],
                    correct: 2
                },
                {
                    question: "tan θ can also be written as:",
                    options: ["sinθ/cosθ", "cosθ/sinθ", "sinθ × cosθ", "sinθ + cosθ"],
                    correct: 0
                }
            ]
        },
        
        // Biology chapters
        // chapter 1
        cellbiology: {
            title: 'Cell Biology',
            timeLimit: 60,
            notes: `
                <h3>Cell Theory</h3>
                <ul>
                    <li>All living things are made of cells</li>
                    <li>Cell is the basic unit of life</li>
                    <li>All cells come from pre-existing cells</li>
                </ul>
                
                <h3>Types of Cells</h3>
                <p><strong>Prokaryotic cells:</strong></p>
                <ul>
                    <li>No nucleus (DNA in cytoplasm)</li>
                    <li>No membrane-bound organelles</li>
                    <li>Examples: bacteria, archaea</li>
                </ul>
                
                <p><strong>Eukaryotic cells:</strong></p>
                <ul>
                    <li>Nucleus present (DNA in nucleus)</li>
                    <li>Membrane-bound organelles present</li>
                    <li>Examples: plant, animal, fungal cells</li>
                </ul>
                
                <h3>Cell Organelles</h3>
                <ul>
                    <li><strong>Nucleus:</strong> Controls cell activities, contains DNA</li>
                    <li><strong>Mitochondria:</strong> Powerhouse of cell, produces ATP</li>
                    <li><strong>Ribosomes:</strong> Protein synthesis</li>
                    <li><strong>ER:</strong> Transport system (rough and smooth)</li>
                    <li><strong>Golgi apparatus:</strong> Packaging and shipping</li>
                    <li><strong>Lysosomes:</strong> Digestive system of cell</li>
                    <li><strong>Chloroplasts:</strong> Photosynthesis (plants only)</li>
                </ul>
                
                <h3>Cell Membrane</h3>
                <ul>
                    <li>Phospholipid bilayer</li>
                    <li>Selectively permeable</li>
                    <li>Controls what enters/exits cell</li>
                    <li>Contains proteins and cholesterol</li>
                </ul>
                
                <h3>Transport Mechanisms</h3>
                <ul>
                    <li><strong>Diffusion:</strong> High to low concentration</li>
                    <li><strong>Osmosis:</strong> Water movement across membrane</li>
                    <li><strong>Active transport:</strong> Requires energy, against gradient</li>
                    <li><strong>Endocytosis/Exocytosis:</strong> Bulk transport</li>
                </ul>
            `,
            questions: [
                {
                    question: "The powerhouse of the cell is:",
                    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
                    correct: 1
                },
                {
                    question: "Which cells lack a nucleus?",
                    options: ["Eukaryotic cells", "Prokaryotic cells", "Plant cells", "Animal cells"],
                    correct: 1
                },
                {
                    question: "Photosynthesis occurs in:",
                    options: ["Mitochondria", "Nucleus", "Chloroplasts", "Ribosomes"],
                    correct: 2
                },
                {
                    question: "The cell membrane is composed mainly of:",
                    options: ["Proteins", "Carbohydrates", "Phospholipids", "Nucleic acids"],
                    correct: 2
                },
                {
                    question: "Ribosomes are responsible for:",
                    options: ["Energy production", "Protein synthesis", "Waste removal", "DNA storage"],
                    correct: 1
                },
                {
                    question: "Osmosis is the movement of:",
                    options: ["Solutes", "Water", "Proteins", "Gases"],
                    correct: 1
                },
                {
                    question: "The control center of the cell is:",
                    options: ["Mitochondria", "Nucleus", "ER", "Golgi"],
                    correct: 1
                },
                {
                    question: "Lysosomes are known as:",
                    options: ["Powerhouse", "Control center", "Digestive system", "Transport system"],
                    correct: 2
                },
                {
                    question: "Active transport requires:",
                    options: ["No energy", "Energy", "Only water", "Only gases"],
                    correct: 1
                },
                {
                    question: "The rough ER is studded with:",
                    options: ["Mitochondria", "Ribosomes", "Lysosomes", "Vacuoles"],
                    correct: 1
                }
            ]
        },
        
        // chapter 2 
        humanbodysystems: {
            title: 'Human Body Systems',
            timeLimit: 60,
            notes: `
                <h3>Body Systems</h3>
                <p>The human body consists of interconnected systems working together to maintain life.</p>
                
                <h3>Circulatory System</h3>
                <ul>
                    <li><strong>Heart:</strong> Pumps blood through body</li>
                    <li><strong>Blood vessels:</strong> Arteries, veins, capillaries</li>
                    <li><strong>Blood:</strong> Transports oxygen, nutrients, waste</li>
                </ul>
                
                <h3>Respiratory System</h3>
                <ul>
                    <li><strong>Lungs:</strong> Gas exchange</li>
                    <li><strong>Diaphragm:</strong> Breathing muscle</li>
                    <li><strong>Alveoli:</strong> Tiny air sacs for gas exchange</li>
                </ul>
                
                <h3>Nervous System</h3>
                <ul>
                    <li><strong>Brain:</strong> Control center</li>
                    <li><strong>Spinal cord:</strong> Main nerve pathway</li>
                    <li><strong>Neurons:</strong> Nerve cells that transmit signals</li>
                </ul>
                
                <h3>Digestive System</h3>
                <p>Breaks down food into nutrients that can be absorbed and used by the body.</p>
                
                <h3>Homeostasis</h3>
                <p>The body's ability to maintain stable internal conditions despite external changes.</p>
            `,
            questions: [
                {
                    question: "What is the main function of the heart?",
                    options: ["Digest food", "Pump blood", "Filter air", "Produce hormones"],
                    correct: 1
                },
                {
                    question: "Gas exchange in the lungs occurs in:",
                    options: ["Bronchi", "Trachea", "Alveoli", "Diaphragm"],
                    correct: 2
                },
                {
                    question: "The control center of the nervous system is:",
                    options: ["Spinal cord", "Brain", "Neurons", "Nerves"],
                    correct: 1
                },
                {
                    question: "Homeostasis refers to:",
                    options: ["Body growth", "Maintaining stable internal conditions", "Digesting food", "Breathing"],
                    correct: 1
                },
                {
                    question: "Which blood vessels carry blood away from the heart?",
                    options: ["Veins", "Arteries", "Capillaries", "All vessels"],
                    correct: 1
                },
                {
                    question: "The main breathing muscle is:",
                    options: ["Heart", "Lungs", "Diaphragm", "Ribs"],
                    correct: 2
                },
                {
                    question: "Neurons are:",
                    options: ["Blood cells", "Nerve cells", "Muscle cells", "Bone cells"],
                    correct: 1
                },
                {
                    question: "The digestive system's main function is to:",
                    options: ["Pump blood", "Break down food", "Filter air", "Transmit signals"],
                    correct: 1
                },
                {
                    question: "Capillaries are important for:",
                    options: ["Pumping blood", "Exchanging materials between blood and tissues", "Storing blood", "Making blood"],
                    correct: 1
                },
                {
                    question: "Which system is responsible for gas exchange?",
                    options: ["Circulatory", "Digestive", "Respiratory", "Nervous"],
                    correct: 2
                }
            ]
        }
    };

    return chapterDatabase[chapterId] || {
        title: 'Chapter Not Found',
        notes: '<p>Chapter content is not available.</p>',
        questions: []
    };
}