document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const newTaskInput = document.getElementById('newTaskInput');
    const taskDifficulty = document.getElementById('taskDifficulty');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const starCountDisplay = document.getElementById('starCount');
    const buyBonusBtns = document.querySelectorAll('.buy-bonus-btn');
    
    // Éléments PiP (Mode Flottant)
    const pipBtn = document.getElementById('pipBtn');
    const canvas = document.getElementById('pipCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('pipVideo');

    // Données du jeu
    let stars = parseInt(localStorage.getItem('starCount')) || 0;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- LOGIQUE DE BASE ---

    function updateStarCount() {
        starCountDisplay.textContent = stars;
        localStorage.setItem('starCount', stars);
        drawScoreToCanvas(); // Met à jour le dessin pour le mode flottant
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            
            li.innerHTML = `
                <span class="task-name">${task.name}</span>
                <span class="task-stars">${'⭐'.repeat(task.difficulty)}</span>
                <div class="task-actions">
                    <button class="complete-task-btn" data-index="${index}" ${task.completed ? 'disabled' : ''}>
                        ${task.completed ? 'Fait !' : 'Terminer'}
                    </button>
                    <button class="remove-task-btn" data-index="${index}">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        attachTaskEvents();
    }

    function attachTaskEvents() {
        document.querySelectorAll('.complete-task-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.target.dataset.index;
                if (!tasks[idx].completed) {
                    tasks[idx].completed = true;
                    stars += tasks[idx].difficulty;
                    updateStarCount();
                    saveTasks();
                    renderTasks();
                }
            };
        });

        document.querySelectorAll('.remove-task-btn').forEach(btn => {
            btn.onclick = (e) => {
                tasks.splice(e.target.dataset.index, 1);
                saveTasks();
                renderTasks();
            };
        });
    }

    addTaskBtn.onclick = () => {
        const name = newTaskInput.value.trim();
        const diff = parseInt(taskDifficulty.value);
        if (name) {
            tasks.push({ name, difficulty: diff, completed: false });
            newTaskInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    buyBonusBtns.forEach(btn => {
        btn.onclick = (e) => {
            const cost = parseInt(e.target.closest('.bonus-item').dataset.cost);
            if (stars >= cost) {
                stars -= cost;
                updateStarCount();
                alert("Bonus débloqué ! Profite bien !");
            } else {
                alert(`Il te manque ${cost - stars} ⭐ !`);
            }
        };
    });

    // --- LOGIQUE MODE FLOTTANT (PICTURE-IN-PICTURE) ---

    function drawScoreToCanvas() {
        // Fond
        ctx.fillStyle = "#1e1e32"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texte "Score"
        ctx.fillStyle = "#a7e0ff";
        ctx.font = "bold 20px Orbitron, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OBJECTIF", 100, 35);
        
        // Nombre d'étoiles
        ctx.fillStyle = "#ffda6a";
        ctx.font = "bold 35px Arial";
        ctx.fillText(`${stars} ⭐`, 100, 80);
    }

    pipBtn.onclick = async () => {
        try {
            drawScoreToCanvas();
            
            // captureStream(FPS) - 30 FPS pour iPad
            const stream = canvas.captureStream(30);
            video.srcObject = stream;

            // Astuce Safari iPad : la vidéo doit être "active" dans la page
            video.style.display = "block";
            video.style.position = "fixed";
            video.style.top = "0";
            video.style.width = "1px";
            video.style.height = "1px";
            video.style.opacity = "0.01";

            await video.play();

            // Demande le mode Picture-in-Picture
            if (video.requestPictureInPicture) {
                await video.requestPictureInPicture();
            } else if (video.webkitSetPresentationMode) {
                // Ancienne méthode Safari/iOS
                video.webkitSetPresentationMode("picture-in-picture");
            }
            
            video.style.display = "none";
        } catch (err) {
            console.error("Erreur PiP:", err);
            alert("Le mode flottant nécessite que le site soit servi en HTTPS sur iPad.");
        }
    };

    // Initialisation
    updateStarCount();
    renderTasks();
});
