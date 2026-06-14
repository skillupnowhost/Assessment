// ==========================================
// Mock Data Generation
// ==========================================

const itCoursesNames = [
    'Programming Fundamentals', 'C', 'C++', 'Java', 'Python', 'Data Structures', 
    'Algorithms', 'DBMS', 'SQL', 'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 
    'Software Engineering', 'Operating Systems', 'Computer Networks', 'Cyber Security', 
    'Ethical Hacking', 'Cloud Computing', 'AI', 'Machine Learning', 'Data Science', 
    'Mobile App Development', 'DevOps'
];

const businessCourseNames = [
    'Management', 'Business Communication', 'HRM', 'Marketing', 'Digital Marketing', 
    'Accounting', 'Cost Accounting', 'Business Analytics', 'Entrepreneurship', 
    'Business Law', 'Organizational Behavior', 'Strategic Management', 'Project Management', 
    'Supply Chain Management', 'E-Commerce', 'International Business', 'Investment Management', 
    'Banking', 'Retail Management', 'CRM', 'Sales Management', 'Business Intelligence', 
    'Leadership', 'Startup Management', 'Innovation Management'
];

const instructors = ['Dr. Alan Turing', 'Sarah Connor', 'John Doe', 'Emily Chen', 'Michael Scott', 'Ada Lovelace', 'Grace Hopper', 'Elon Musk', 'Steve Jobs', 'Bill Gates'];

const allCourses = [];
let courseIdCounter = 1;

// Generate IT Courses
itCoursesNames.forEach(name => {
    allCourses.push(createCourseObj(name, 'IT'));
});

// Generate Business Courses
businessCourseNames.forEach(name => {
    allCourses.push(createCourseObj(name, 'Business'));
});

function createCourseObj(title, category) {
    const id = courseIdCounter++;
    const instructor = instructors[Math.floor(Math.random() * instructors.length)];
    const enrollments = Math.floor(Math.random() * 5000) + 500;
    
    // Abstract image based on ID
    const imgId = (id % 20) + 1;
    const thumbnail = `https://picsum.photos/seed/${title.replace(/\s/g, '')}/600/400`;
    
    return {
        id: id,
        title: title,
        category: category,
        instructor: instructor,
        thumbnail: thumbnail,
        enrollments: enrollments,
        shortDesc: `Master the core concepts and practical applications of ${title}. Perfect for beginners and intermediate learners.`,
        longDesc: `Welcome to the definitive course on ${title}. In this comprehensive program, you will learn everything from the foundational principles to advanced techniques. Guided by ${instructor}, an industry veteran, you'll engage in hands-on projects and real-world scenarios. By the end of this course, you will have a robust understanding of ${category} methodologies related to ${title} and be ready to apply them in a professional setting.`,
        outcomes: [
            `Understand the fundamental principles of ${title}`,
            `Apply theoretical knowledge to practical, real-world problems`,
            `Develop critical thinking and analytical skills in ${category}`,
            `Build a portfolio of projects demonstrating your competency`,
            `Prepare for industry certifications and career advancement`
        ],
        modules: [
            { title: 'Module 1: Introduction and Basics', desc: `A comprehensive overview of ${title} and setting up your environment.` },
            { title: 'Module 2: Core Concepts', desc: `Diving deep into the essential theories and practices.` },
            { title: 'Module 3: Advanced Techniques', desc: `Exploring complex scenarios and optimization strategies.` },
            { title: 'Module 4: Real-world Applications', desc: `Applying what you've learned to industry-standard projects.` },
            { title: 'Module 5: Final Assessment & Certification', desc: `Review, final project submission, and next steps.` }
        ],
        videos: [
            { title: `${title} - Part 1: The Basics`, thumb: `https://picsum.photos/seed/vid1${id}/300/200`, id: 'dQw4w9WgXcQ', desc: 'An introductory lecture covering the syllabus and basic concepts.' },
            { title: `${title} - Part 2: Deep Dive`, thumb: `https://picsum.photos/seed/vid2${id}/300/200`, id: 'dQw4w9WgXcQ', desc: 'Detailed explanation of core mechanics and theories.' },
            { title: `${title} - Part 3: Practical Application`, thumb: `https://picsum.photos/seed/vid3${id}/300/200`, id: 'dQw4w9WgXcQ', desc: 'A walk-through of a real-world problem solved step-by-step.' }
        ],
        tests: generateTests(title)
    };
}

function generateTests(title) {
    const questions = [];
    for(let i=1; i<=10; i++) {
        questions.push({
            question: `Question ${i}: Which of the following is a key component of ${title}?`,
            options: [
                `A core principle discussed in Module ${Math.ceil(i/2)}`,
                `An unrelated concept from another field`,
                `A common misconception`,
                `None of the above`
            ],
            answerIndex: 0 // Always 0 for mock simplicity, we will shuffle UI later if needed
        });
    }
    return questions;
}

const testimonials = [
    { name: 'Alice Johnson', course: 'Data Science', text: 'EduLearn completely transformed my career. The instructors are top-notch and the materials are highly practical.', img: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5 },
    { name: 'Mark Smith', course: 'Project Management', text: 'The flexible schedule allowed me to complete my certification while working full-time. Highly recommended!', img: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5 },
    { name: 'Priya Patel', course: 'Full Stack Web Development', text: 'The video lectures and hands-on tests ensured I understood every concept. I got a job within a month of graduating.', img: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4 },
    { name: 'David Wilson', course: 'Digital Marketing', text: 'Excellent curriculum. The real-world examples provided by the faculty were incredibly insightful.', img: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 5 }
];

const faqs = [
    { q: 'How do I enroll in a course?', a: 'Simply browse our course catalog, select a course you are interested in, and click the "Enroll Now" button. Follow the prompts to create an account and complete checkout.' },
    { q: 'Are the certificates recognized by employers?', a: 'Yes! Our certificates are highly regarded in the industry and can be added directly to your LinkedIn profile and resume.' },
    { q: 'Can I access the course materials on my mobile device?', a: 'Absolutely. EduLearn is fully responsive, meaning you can watch videos and take tests on your smartphone, tablet, or desktop.' },
    { q: 'What is the refund policy?', a: 'We offer a 14-day money-back guarantee if you are not satisfied with the course content.' },
    { q: 'How long do I have access to a course?', a: 'Once enrolled, you have lifetime access to the course materials, including all future updates.' },
    { q: 'Are there any prerequisites for beginner courses?', a: 'Most beginner courses require no prior knowledge. Specific prerequisites, if any, are listed on the course details page.' },
    { q: 'How do the online tests work?', a: 'Tests are multiple-choice quizzes designed to check your knowledge. They are auto-graded, and you will see your results immediately upon submission.' },
    { q: 'Can I interact with the instructors?', a: 'Yes, premium courses include access to a dedicated Q&A forum where instructors answer student queries within 24-48 hours.' }
];

const facultyMembers = [
    { name: 'Dr. Alan Turing', role: 'Head of Computer Science', spec: 'AI & Algorithms', img: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { name: 'Sarah Connor', role: 'Senior Instructor', spec: 'Cyber Security', img: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { name: 'Emily Chen', role: 'Professor of Business', spec: 'International Business & Finance', img: 'https://randomuser.me/api/portraits/women/23.jpg' },
    { name: 'Michael Scott', role: 'Lead Management Instructor', spec: 'Organizational Behavior', img: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { name: 'Ada Lovelace', role: 'Programming Mentor', spec: 'Software Engineering', img: 'https://randomuser.me/api/portraits/women/41.jpg' },
    { name: 'Grace Hopper', role: 'Systems Architecture Lead', spec: 'Operating Systems & Networks', img: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { name: 'Elon Musk', role: 'Guest Lecturer', spec: 'Innovation Management', img: 'https://randomuser.me/api/portraits/men/66.jpg' },
    { name: 'Steve Jobs', role: 'Product Design Lead', spec: 'Digital Marketing & UI/UX', img: 'https://randomuser.me/api/portraits/men/77.jpg' }
];

// ==========================================
// Global Variables & State
// ==========================================
let currentCourse = null;
let currentTestAnswers = [];

// ==========================================
// Initialization & DOM Setup
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupMobileMenu();
    setupRouting();
    
    // Render initial static data
    renderFeaturedCourses();
    renderTestimonials();
    renderFAQs();
    renderFaculty();
    
    // Setup Courses Page Listeners
    setupCourseFilters();
    
    // Setup Course Details Listeners
    setupCourseTabs();
    
    // Handle Routing based on initial hash
    handleHashChange();
    
    // Setup Contact Form
    setupContactForm();
    
    // Init Counters
    initCounters();
});

// ==========================================
// Theme Management (Dark/Light Mode)
// ==========================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme == "dark" || (!currentTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    themeToggle.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        if (theme == "dark") {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });
}

// ==========================================
// Mobile Menu
// ==========================================
function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    
    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fa-solid fa-times"></i>' 
            : '<i class="fa-solid fa-bars"></i>';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}

// ==========================================
// SPA Routing Mechanism
// ==========================================
function setupRouting() {
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle back button on course details
    document.getElementById('back-to-courses').addEventListener('click', () => {
        window.location.hash = '#courses';
    });
}

function handleHashChange() {
    let hash = window.location.hash || '#home';
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === hash || (hash.startsWith('#course-details') && link.getAttribute('href') === '#courses')) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle Route
    if (hash.startsWith('#course-details/')) {
        const id = parseInt(hash.split('/')[1]);
        const course = allCourses.find(c => c.id === id);
        if (course) {
            document.getElementById('view-course-details').classList.add('active');
            renderCourseDetails(course);
        } else {
            window.location.hash = '#courses';
        }
    } else {
        const viewId = `view-${hash.replace('#', '')}`;
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.add('active');
            if(hash === '#courses') {
                renderAllCourses(allCourses);
            }
            if(hash === '#home') {
                initCounters(); // Re-trigger counters
            }
        } else {
            // Default to home if route not found
            document.getElementById('view-home').classList.add('active');
            window.location.hash = '#home';
        }
    }
}

// ==========================================
// Render Functions
// ==========================================

function createCourseCardHTML(course) {
    const badgeClass = course.category === 'IT' ? 'it' : 'business';
    return `
        <div class="course-card">
            <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" loading="lazy">
            <div class="course-content">
                <span class="course-badge ${badgeClass}">${course.category}</span>
                <h3 class="course-title">${course.title}</h3>
                <div class="course-instructor"><i class="fa-solid fa-user-tie"></i> ${course.instructor}</div>
                <p class="course-desc">${course.shortDesc}</p>
                <div class="course-footer">
                    <span class="enroll-count"><i class="fa-solid fa-users"></i> ${course.enrollments.toLocaleString()} enrolled</span>
                    <a href="#course-details/${course.id}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">View Course</a>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedCourses() {
    const grid = document.getElementById('featured-course-grid');
    // Grab 6 random courses
    const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    grid.innerHTML = selected.map(createCourseCardHTML).join('');
}

function renderAllCourses(coursesToRender) {
    const grid = document.getElementById('all-course-grid');
    if (coursesToRender.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No courses found matching your criteria.</div>';
        return;
    }
    grid.innerHTML = coursesToRender.map(createCourseCardHTML).join('');
}

function renderTestimonials() {
    const grid = document.getElementById('testimonial-grid');
    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <i class="fa-solid fa-quote-right quote-icon"></i>
            <div class="rating">
                ${'<i class="fa-solid fa-star"></i>'.repeat(t.rating)}
            </div>
            <p class="testimonial-text">"${t.text}"</p>
            <div class="student-info">
                <img src="${t.img}" alt="${t.name}" class="student-img">
                <div class="student-details">
                    <h4>${t.name}</h4>
                    <p>${t.course} Graduate</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFAQs() {
    const container = document.getElementById('faq-container');
    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item">
            <div class="faq-question">
                <span>${faq.q}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                <p>${faq.a}</p>
            </div>
        </div>
    `).join('');

    // Setup FAQ Accordion Logic
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));
            
            // Open clicked if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

function renderFaculty() {
    const grid = document.getElementById('faculty-grid');
    grid.innerHTML = facultyMembers.map(f => `
        <div class="faculty-card">
            <img src="${f.img}" alt="${f.name}" class="faculty-img" loading="lazy">
            <div class="faculty-info">
                <h4>${f.name}</h4>
                <div class="faculty-role">${f.role}</div>
                <div class="faculty-spec">${f.spec}</div>
                <div class="faculty-social">
                    <a href="#"><i class="fa-brands fa-linkedin"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-solid fa-envelope"></i></a>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// Courses Page Logic (Search & Filter)
// ==========================================
function setupCourseFilters() {
    const searchInput = document.getElementById('course-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentCategory = 'all';
    let currentSearch = '';

    const filterCourses = () => {
        let filtered = allCourses;
        
        if (currentCategory !== 'all') {
            filtered = filtered.filter(c => c.category === currentCategory);
        }
        
        if (currentSearch.trim() !== '') {
            const query = currentSearch.toLowerCase();
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(query) || 
                c.shortDesc.toLowerCase().includes(query) ||
                c.instructor.toLowerCase().includes(query)
            );
        }
        
        renderAllCourses(filtered);
    };

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        filterCourses();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-filter');
            filterCourses();
        });
    });
}

// ==========================================
// Course Details Logic
// ==========================================
function setupCourseTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and panes
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            document.getElementById(`tab-${tab.getAttribute('data-tab')}`).classList.add('active');
        });
    });
}

function renderCourseDetails(course) {
    currentCourse = course;
    
    // Header
    const badgeClass = course.category === 'IT' ? 'it' : 'business';
    document.getElementById('cd-header').innerHTML = `
        <span class="course-badge ${badgeClass}" style="background: rgba(255,255,255,0.2); color:white; border: 1px solid white;">${course.category}</span>
        <h2>${course.title}</h2>
        <p style="font-size: 1.1rem; opacity: 0.9;"><i class="fa-solid fa-user-tie"></i> Instructor: ${course.instructor}</p>
        <p style="margin-top: 1rem; opacity: 0.9;"><i class="fa-solid fa-users"></i> ${course.enrollments.toLocaleString()} students enrolled</p>
    `;

    // Materials
    document.getElementById('cd-desc').textContent = course.longDesc;
    document.getElementById('cd-outcomes').innerHTML = course.outcomes.map(o => `<li>${o}</li>`).join('');
    
    document.getElementById('cd-modules').innerHTML = course.modules.map((m, i) => `
        <div class="module-item">
            <div class="module-info">
                <h4>${m.title}</h4>
                <p style="margin:0; font-size: 0.9rem;">${m.desc}</p>
            </div>
            <a href="#" class="btn btn-secondary" style="padding: 0.5rem 1rem;" onclick="event.preventDefault(); alert('Downloading PDF for ${m.title}')">
                <i class="fa-solid fa-file-pdf"></i> Download
            </a>
        </div>
    `).join('');

    // Videos
    // Using a reliable YouTube placeholder via iframe
    document.getElementById('cd-videos').innerHTML = course.videos.map(v => `
        <div class="video-card">
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="${v.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h4>${v.title}</h4>
                <p style="font-size: 0.85rem; margin:0;">${v.desc}</p>
            </div>
        </div>
    `).join('');

    // Tests
    resetTest();
}

// ==========================================
// Tests Logic
// ==========================================
let currentQuestionIndex = 0;

function resetTest() {
    currentQuestionIndex = 0;
    currentTestAnswers = new Array(10).fill(null);
    document.getElementById('test-results').style.display = 'none';
    document.getElementById('test-container').style.display = 'block';
    
    document.getElementById('submit-test').onclick = handleTestSubmit;
    renderQuestion();
}

function renderQuestion() {
    const q = currentCourse.tests[currentQuestionIndex];
    document.getElementById('current-q').textContent = currentQuestionIndex + 1;
    
    const optionsHtml = q.options.map((opt, i) => {
        // Scramble logic intentionally omitted for simplicity, but easily addable
        const isChecked = currentTestAnswers[currentQuestionIndex] === i ? 'checked' : '';
        return `
            <label class="option-label">
                <input type="radio" name="q_option" value="${i}" ${isChecked}>
                ${opt}
            </label>
        `;
    }).join('');

    document.getElementById('question-box').innerHTML = `
        <h4>${q.question}</h4>
        <div class="options-container">
            ${optionsHtml}
        </div>
    `;

    const btn = document.getElementById('submit-test');
    if (currentQuestionIndex === 9) {
        btn.textContent = 'Finish Test';
    } else {
        btn.textContent = 'Next Question';
    }
}

function handleTestSubmit() {
    const selected = document.querySelector('input[name="q_option"]:checked');
    if (!selected) {
        alert('Please select an answer before proceeding.');
        return;
    }

    currentTestAnswers[currentQuestionIndex] = parseInt(selected.value);

    if (currentQuestionIndex < 9) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        calculateTestScore();
    }
}

function calculateTestScore() {
    let score = 0;
    currentCourse.tests.forEach((q, i) => {
        if (q.answerIndex === currentTestAnswers[i]) {
            score++;
        }
    });

    const percentage = (score / 10) * 100;
    const passed = percentage >= 70;

    document.getElementById('test-container').style.display = 'none';
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.style.display = 'block';

    resultsContainer.innerHTML = `
        <h2>Test Completed!</h2>
        <p>You have finished the knowledge check for <strong>${currentCourse.title}</strong>.</p>
        
        <div class="result-circle" style="border-color: ${passed ? 'var(--success)' : 'var(--danger)'}; color: ${passed ? 'var(--success)' : 'var(--danger)'}">
            ${percentage}%
        </div>
        
        <h3 style="color: ${passed ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 1rem;">
            ${passed ? 'Congratulations! You Passed.' : 'Keep trying! You did not pass.'}
        </h3>
        
        <p>Score: ${score} out of 10 correct</p>
        <p>Passing requirement: 70%</p>
        
        <button class="btn btn-primary mt-2" id="retake-test">Retake Test</button>
    `;

    document.getElementById('retake-test').addEventListener('click', resetTest);
}

// ==========================================
// Contact Form Validation
// ==========================================
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name && email && subject && message) {
            // Simulate API Call
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                successMsg.style.display = 'block';
                form.reset();
                btn.textContent = originalText;
                btn.disabled = false;
                
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }, 1500);
        }
    });
}

// ==========================================
// Statistics Counters Animation
// ==========================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };

        // Reset and trigger
        counter.innerText = '0';
        updateCount();
    });
}
