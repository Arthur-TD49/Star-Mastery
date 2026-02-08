document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const taskDifficulty = document.getElementById('taskDifficulty');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const starCountDisplay = document.getElementById('starCount');
    const buyBonusBtns = document.querySelectorAll('.buy-bonus-btn');

    let stars = parseInt(localStorage.getItem('starCount')) || 0;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function updateStarCount() {
        starCountDisplay.textContent = stars;
        localStorage.setItem('starCount', stars);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.completed) {
                li.classList.add('completed');
            }
            li.innerHTML = `
                <span class="task-name">${task.name}</span>
                <span class="task-stars">${'⭐'.repeat(task.difficulty)}</span>
                <div class="task-actions">
                    <button class="complete-task-btn" data-index="${index}" ${task.completed ? 'disabled' : ''}>${task.completed ? 'Terminée' : 'Terminer'}</button>
                    <button class="remove-task-btn" data-index="${index}">Supprimer</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        attachEventListenersToTaskButtons();
    }

    function attachEventListenersToTaskButtons() {
        document.querySelectorAll('.complete-task-btn').forEach(button => {
            button.onclick = (event) => {
                const index = parseInt(event.target.dataset.index);
                if (!tasks[index].completed) {
                    tasks[index].completed = true;
                    stars += tasks[index].difficulty;
                    updateStarCount();
                    saveTasks();
                    renderTasks(); // Re-render to update UI (line-through, disabled button)
                }
            };
        });

        document.querySelectorAll('.remove-task-btn').forEach(button => {
            button.onclick = (event) => {
                const index = parseInt(event.target.dataset.index);
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            };
        });
    }

    addTaskBtn.addEventListener('click', () => {
        const taskName = newTaskInput.value.trim();
        const difficulty = parseInt(taskDifficulty.value);
        const isHabit = taskDifficulty.options[taskDifficulty.selectedIndex].dataset.isHabit === 'true';

        if (taskName) {
            tasks.push({
                name: taskName,
                difficulty: difficulty,
                completed: false,
                isHabit: isHabit
            });
            newTaskInput.value = '';
            saveTasks();
            renderTasks();
        }
    });

    buyBonusBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const cost = parseInt(event.target.closest('.bonus-item').dataset.cost);
            const bonusName = event.target.closest('.bonus-item').querySelector('h3').textContent;

            if (stars >= cost) {
                stars -= cost;
                updateStarCount();
                alert(`Félicitations ! Tu as débloqué : "${bonusName}" !`);
            } else {
                alert(`Tu n'as pas assez d'étoiles pour acheter "${bonusName}". Il te manque ${cost - stars} ⭐.`);
            }
        });
    });

    // Initial load
    updateStarCount();
    renderTasks();
});
const pipBtn = document.getElementById('pipBtn');
const canvas = document.getElementById('pipCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('pipVideo');

// Fonction pour dessiner le score sur le canvas
function drawScoreToCanvas() {
    ctx.fillStyle = "#0f0c29"; // Fond sombre assorti
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ffda6a"; // Couleur des étoiles
    ctx.font = "bold 24px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("STARS", 100, 40);
    
    ctx.font = "bold 40px Arial";
    ctx.fillText(`${stars} ⭐`, 100, 85);
}

// Mise à jour du canvas dès que le score change
function updatePip() {
    drawScoreToCanvas();
}

// Intercepter le clic pour lancer le Picture-in-Picture
pipBtn.addEventListener('click', async () => {
    try {
        drawScoreToCanvas();
        // Créer un flux vidéo à partir du canvas (1 image par seconde suffit)
        const stream = canvas.captureStream(1); 
        video.srcObject = stream;
        
        await video.play();
        await video.requestPictureInPicture();
    } catch (error) {
        console.error("Le mode PiP a échoué : ", error);
        alert("Ton navigateur ne supporte pas encore le mode PiP pour canvas.");
    }
});

// N'oublie pas d'appeler updatePip() à l'intérieur de ta fonction updateStarCount() existante !
