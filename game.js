document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 DOM totalmente carregado!");

    // 🔹 Reseta challengeId ao iniciar um novo jogo
    if (!localStorage.getItem("challengeId") || isNaN(localStorage.getItem("challengeId"))) {
        localStorage.setItem("challengeId", 1);
    }

    let playerName = localStorage.getItem("playerName");
    let avatar = localStorage.getItem("avatar");
    let challengeId = parseInt(localStorage.getItem("challengeId")); // 🔹 Agora garantimos que começa em 1
    let shields = 3;
    let score = localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0;
    let totalChallenges = 6;
    let roundFinished = false;
    let challenges = [];

    // Atualiza a interface com nome e avatar
    document.getElementById("playerNameDisplay").innerText = playerName;
    document.getElementById("playerAvatar").innerText = avatar;

    function updateShields() {
        let shieldsContainer = document.getElementById("shields");
        shieldsContainer.innerHTML = "🛡️".repeat(shields) || "❌";
    }

    function loadChallenges() {
        fetch("challenges.json")
            .then(response => response.json())
            .then(data => {
                challenges = data;
                loadChallenge();
            })
            .catch(() => {
                console.error("Erro ao carregar desafios.");
            });
    }

    function loadChallenge() {
        roundFinished = false;

        console.log("🔍 Carregando desafio:", challengeId); // Debug para verificar no console

        let challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) {
            localStorage.setItem("score", score);
            window.location.href = "score.html";
            return;
        }

        document.getElementById("challengeText").innerText = challenge.scenario;
        let optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";
        document.getElementById("result").innerText = "";

        // Esconder popup ao iniciar novo desafio
        document.getElementById("popup-stride").style.display = "none";

        // Esconder botões de navegação
        document.getElementById("nextButton").classList.add("hidden");
        document.getElementById("scoreButton").classList.add("hidden");

        challenge.options.forEach(option => {
            let button = document.createElement("button");
            button.classList.add("btn");
            button.innerText = option;
            button.onclick = function () {
                submitAnswer(option, challenge.stride_category, challenge.correct_control);
            };
            optionsDiv.appendChild(button);
        });
    }

    function submitAnswer(selectedOption, strideCategory, correctControl) {
        if (roundFinished) return;  // Evita múltiplos cliques

        document.getElementById("result").innerText = selectedOption === correctControl
            ? "✅ Resposta correta!"
            : "❌ Resposta errada!";

        if (selectedOption === correctControl) {
            score += 30;
            roundFinished = true;
        } else {
            shields -= 1; // Escudo SÓ é removido se errar
            score -= 10;
            updateShields();
        }

        // 🔹 Marcar se o jogo acabou para redirecionar depois
        if (shields === 0 || challengeId === totalChallenges) {
            localStorage.setItem("gameOver", "true");
        }

        if (shields === 0 || challengeId === totalChallenges) {
            document.getElementById('strideCategory').textContent = strideCategory;
            document.getElementById('strideDescription').textContent = getCategoryDescription(strideCategory);
            document.getElementById("popup-stride").style.display = "flex";
            localStorage.setItem("score", score); // Salva a pontuação antes de sair
        }

        // Se a rodada finalizou (acerto ou perdeu todos os escudos)
        if (roundFinished) {
            document.getElementById('strideCategory').textContent = strideCategory;
            document.getElementById('strideDescription').textContent = getCategoryDescription(strideCategory);
            document.getElementById("popup-stride").style.display = "flex"; // Exibir pop-up

            // Exibir botões corretamente
            if (challengeId === totalChallenges) {
                document.getElementById("scoreButton").classList.remove("hidden");
            } else {
                document.getElementById("nextButton").classList.remove("hidden");
                document.getElementById("scoreButton").classList.remove("hidden");
            }
        }
    }

    function nextStep() {
        challengeId++;
        localStorage.setItem("challengeId", challengeId);

        if (challengeId > totalChallenges) {
            viewScore();
        } else {
            loadChallenge();
            document.getElementById("popup-stride").style.display = "none";
        }
    }

    function viewScore() {
        localStorage.setItem("score", score);
        window.location.href = "score.html";
    }

    function closePopup() {
        document.getElementById("popup-stride").style.display = "none";

        // 🔹 Se o jogo acabou (sem escudos ou no último desafio), redirecionar para a pontuação
        if (localStorage.getItem("gameOver") === "true") {
            localStorage.setItem("score", score); // Salva a pontuação antes de sair
            window.location.href = "score.html";  // 🔥 Vai para a tela final
        }
    }

    function getCategoryDescription(category) {
        const descriptions = {
            "Spoofing": "Tentativa de enganar um sistema ou usuário.",
            "Tampering": "Modificação não autorizada de dados.",
            "Repudiation": "Negação de ações realizadas no sistema.",
            "Information Disclosure": "Exposição não autorizada de informações.",
            "Denial of Service": "Impedimento de acesso a um serviço.",
            "Elevation of Privilege": "Acesso não autorizado a funcionalidades."
        };
        return descriptions[category] || "Descrição não disponível.";
    }

    // 🔹 Adicionar eventos corretamente aos botões
    document.getElementById("nextButton").addEventListener("click", nextStep);
    document.getElementById("scoreButton").addEventListener("click", viewScore);

    document.getElementById("popup-stride").addEventListener("click", function (event) {
        if (event.target.closest(".stride-content")) { 
            closePopup();
        }
    });

    updateShields();
    loadChallenges(); // 🔹 Agora os desafios são carregados de `challenges.json`
});
