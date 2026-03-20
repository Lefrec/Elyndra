let biomeData = window.biomeData;
let biomeName = window.biomeName;
const allBiomes = window.allBiomes;

// ============ GESTION DU MENU HAMBURGER ============
const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");
const menuOverlay = document.getElementById("menu-overlay");
const closeMenuBtn = document.getElementById("close-menu");

let menuOpen = false;

function toggleMenu() {
    menuOpen = !menuOpen;

    if (menuOpen) {
        // Ouvrir le menu
        sideMenu.classList.remove("translate-x-full");
        menuOverlay.classList.remove(
            "opacity-0",
            "pointer-events-none",
        );

        // Cacher le bouton hamburger
        menuToggle.style.opacity = "0";
        menuToggle.style.pointerEvents = "none";
    } else {
        // Fermer le menu
        sideMenu.classList.add("translate-x-full");
        menuOverlay.classList.add("opacity-0", "pointer-events-none");

        // Réafficher le bouton hamburger
        menuToggle.style.opacity = "1";
        menuToggle.style.pointerEvents = "auto";
    }
}

menuToggle.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);
menuOverlay.addEventListener("click", toggleMenu);

// ============ GESTION DE LA MODAL VERBOMNES ============
const verbomnesButton = document.getElementById("verbomnes-button");
const verbomnesModal = document.getElementById("verbomnes-modal");
const closeVerbomnes = document.getElementById("close-verbomnes");

function openVerbomnesModal() {
    verbomnesModal.classList.remove("opacity-0", "pointer-events-none");
    verbomnesModal.querySelector("div").classList.remove("scale-95");
    verbomnesModal.querySelector("div").classList.add("scale-100");
}

function closeVerbomnesModal() {
    verbomnesModal.classList.add("opacity-0", "pointer-events-none");
    verbomnesModal.querySelector("div").classList.remove("scale-100");
    verbomnesModal.querySelector("div").classList.add("scale-95");
}

verbomnesButton.addEventListener("click", openVerbomnesModal);
closeVerbomnes.addEventListener("click", closeVerbomnesModal);

// Fermer en cliquant sur l'overlay
verbomnesModal.addEventListener("click", (e) => {
    if (e.target === verbomnesModal) {
        closeVerbomnesModal();
    }
});

// Fermer avec la touche Escape
document.addEventListener("keydown", (e) => {
    if (
        e.key === "Escape" &&
        !verbomnesModal.classList.contains("pointer-events-none")
    ) {
        closeVerbomnesModal();
    }
});

// ============ GESTION DE L'IA ============
// Configuration pour l'IA
const messages = [
    {
        role: "system",
        content:
            "Tu es un Maître du Jeu d'un jeu de rôle narratif immersif." +
            "Ta mission : décrire l'univers, narrer les événements, incarner les personnages non-joueurs et faire évoluer l'histoire selon les actions du joueur." +
            "Règles :" +
            "- Ne sors jamais de ton rôle de maître du jeu" +
            "- Tes réponses sont très concises et centrées sur la narration immersive." +
            "- Évite les métaphores à rallonge et formulations pompeuses." +
            "- Décris les environnements, actions et conséquences de façon sensorielle et cinématique." +
            "- Ne donne pas au joueur des informations qu'il ne peut pas savoir." +
            "- Tu contrôles les PNJ et le monde, pas le personnage joueur ; laisse toujours au joueur le choix d'agir." +
            "- Tes réponses se terminent par une ouverture ou une question incitant le joueur à décider de sa prochaine action." +
            "- Tu donnes subtilement des quêtes et des objectifs à suivre pour le joueur." +
            "- Reste strictement cohérent avec l'historique de la conversation et les données RAG fournies. Ne crée ni éléments contradictoires ni incohérences." +
            "- Si tu manques d'information, improvise en te basant sur la logique et l'imagination en faisant attention à la cohérence." +
            "- Les actions du joueur doivent rester plausibles dans les limites de l'univers. Corrige doucement toute tentative impossible ou méta." +
            "- Chaque action entraîne une conséquence logique (réussite, échec, compromis)." +
            "- Récompense les actions créatives et solutions ingénieuses du joueur." +
            "- Le ton doit être immersif, fluide et agréable. Tu équilibres description et rythme sans faire de textes trop longs ni trop laconiques." +
            "- Tu n'es pas un adversaire du joueur, mais un narrateur impartial favorisant l'immersion et le plaisir du jeu." +
            "- De temps en temps, tu peux proposer subtilement au joueur de voyager vers un autre biome (parmi Lunel, Solarys, Auralis, Elyndra). S'il EXPRIME CLAIREMENT sa volonté de s'y rendre, tu dois OBLIGATOIREMENT terminer ta réponse par la balise [NEW_BIOME: nom_du_biome]. Ex: [NEW_BIOME: solarys]" +
            `- L'aventure se déroule dans le biome de ${biomeData.fullName}.`,
    },
];

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Fonction pour ajouter un message au chat
function addMessage(role, content) {
    const messageDiv = document.createElement("div");

    if (role === "assistant") {
        messageDiv.className = `ai-msg-bg ${biomeData.colors.messageBg} rounded-[10px] border border-lime-900/30 p-3`;
        messageDiv.innerHTML = `
        <div class="text-yellow-500 text-base  mb-1">Narrateur</div>
        <div class="ai-msg-text ${biomeData.colors.messageText} text-sm ">${content}</div>
    `;
    } else {
        messageDiv.className = `ai-msg-bg ${biomeData.colors.messageBg} rounded-[10px] border border-lime-900/50 p-3 ml-auto max-w-md`;
        messageDiv.innerHTML = `
        <div class="text-white/90 text-sm  text-right">${content}</div>
    `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour envoyer un message à l'IA
async function sendMessage(userMessage) {
    if (!userMessage.trim()) return;

    // Afficher le message de l'utilisateur
    addMessage("user", userMessage);
    userInput.value = "";

    // Ajouter le message à l'historique
    messages.push({
        role: "user",
        content: userMessage,
    });

    try {
        // Appel à l'API
        const response = await fetch("/api/ChatCompletion.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });

        const data = await response.json();
        let aiResponse = data.choices[0].message.content;

        // Vérification de changement de biome demandé par l'IA
        const biomeMatch = aiResponse.match(/\[NEW_BIOME:\s*(lunel|solarys|auralis|elyndra)\]/i);
        if (biomeMatch) {
            const nextBiome = biomeMatch[1].toLowerCase();
            // Nettoyage de la balise dans le texte affiché
            aiResponse = aiResponse.replace(/\[NEW_BIOME:\s*.*?\]/ig, '').trim();
            
            // On déclenche le changement visuel
            if (typeof window.changeBiome === 'function') {
                window.changeBiome(nextBiome);
            }
        }

        // Ajouter la réponse à l'historique
        messages.push({
            role: "assistant",
            content: aiResponse,
        });

        // Afficher la réponse
        addMessage("assistant", aiResponse);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'IA:", error);
        addMessage(
            "assistant",
            "Une erreur s'est produite. Veuillez réessayer.",
        );
    }
}

// Initialisation du jeu
async function startGame() {
    messages.push({
        role: "user",
        content: biomeData.startPrompt,
    });

    try {
        const response = await fetch("/api/ChatCompletion.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });

        const data = await response.json();
        let aiResponse = data.choices[0].message.content;

        // Vérification de changement de biome (sécurité aussi au démarrage)
        const biomeMatch = aiResponse.match(/\[NEW_BIOME:\s*(lunel|solarys|auralis|elyndra)\]/i);
        if (biomeMatch) {
            const nextBiome = biomeMatch[1].toLowerCase();
            aiResponse = aiResponse.replace(/\[NEW_BIOME:\s*.*?\]/ig, '').trim();
            if (typeof window.changeBiome === 'function') {
                window.changeBiome(nextBiome);
            }
        }

        messages.push({
            role: "assistant",
            content: aiResponse,
        });

        addMessage("assistant", aiResponse);
    } catch (error) {
        console.error("Erreur lors du démarrage:", error);
        addMessage(
            "assistant",
            `Bienvenue dans ${biomeData.fullName}. Votre aventure commence...`,
        );
    }
}

// Fonction pour changer dynamiquement de biome depuis l'IA
window.changeBiome = function(newBiomeId) {
    newBiomeId = newBiomeId.toLowerCase();
    const newBiome = allBiomes[newBiomeId];
    if (!newBiome) return;

    console.log(`Changement dynamique vers le biome : ${newBiome.name}`);

    // Textes des lieux
    const titleEl = document.getElementById("biome-title");
    if(titleEl) titleEl.textContent = newBiome.name;

    const asideNameEl = document.getElementById("aside-biome-name");
    if(asideNameEl) asideNameEl.textContent = `Lieu - ${newBiome.name}`;

    const descEl = document.getElementById("location-description");
    if(descEl) descEl.textContent = newBiome.description;

    // Mise à jour des couleurs pour les attributs SVG qui matchent directement
    const updateSVG = (attr, oldColor, newColor) => {
        if (oldColor && newColor && oldColor !== newColor) {
            document.querySelectorAll(`[${attr}="${oldColor}"]`).forEach(el => el.setAttribute(attr, newColor));
        }
    };
    updateSVG("stop-color", biomeData.colors.svgGradientLight, newBiome.colors.svgGradientLight);
    updateSVG("stop-color", biomeData.colors.svgGradientDark, newBiome.colors.svgGradientDark);
    updateSVG("stop-color", biomeData.colors.svgSecondary, newBiome.colors.svgSecondary);
    updateSVG("fill", biomeData.colors.svgPrimary, newBiome.colors.svgPrimary);
    updateSVG("fill", biomeData.colors.svgSecondary, newBiome.colors.svgSecondary);
    updateSVG("stroke", biomeData.colors.svgStroke, newBiome.colors.svgStroke);
    updateSVG("stroke", biomeData.colors.svgPrimary, newBiome.colors.svgPrimary);

    // Mise à jour des classes
    const classElements = [
        { id: "verbomnes-button", props: ["buttonBg", "buttonHover"] },
        { id: "biome-title", props: ["primary"] },
        { id: "main-container", props: ["bgGradient"] },
        { id: "current-location", props: ["locationText"] },
        { id: "chat-container", props: ["chatBg"] }
    ];

    classElements.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            item.props.forEach(prop => {
                const oldClasses = biomeData.colors[prop]?.split(' ').filter(Boolean) || [];
                const newClasses = newBiome.colors[prop]?.split(' ').filter(Boolean) || [];
                if (oldClasses.length) el.classList.remove(...oldClasses);
                if (newClasses.length) el.classList.add(...newClasses);
            });
        }
    });

    // Mise à jour de l'inventaire
    document.querySelectorAll(".ai-inventory-border").forEach(el => {
        const oldClasses = (biomeData.colors.inventoryBorder || 'border-Or-clair').split(' ').filter(Boolean);
        const newClasses = (newBiome.colors.inventoryBorder || 'border-Or-clair').split(' ').filter(Boolean);
        el.classList.remove(...oldClasses);
        el.classList.add(...newClasses);
    });

    // Mise à jour des messages de chat existants
    document.querySelectorAll(".ai-msg-bg").forEach(el => {
        const oldClasses = biomeData.colors.messageBg?.split(' ').filter(Boolean) || [];
        const newClasses = newBiome.colors.messageBg?.split(' ').filter(Boolean) || [];
        if (oldClasses.length) el.classList.remove(...oldClasses);
        if (newClasses.length) el.classList.add(...newClasses);
    });
    document.querySelectorAll(".ai-msg-text").forEach(el => {
        const oldClasses = biomeData.colors.messageText?.split(' ').filter(Boolean) || [];
        const newClasses = newBiome.colors.messageText?.split(' ').filter(Boolean) || [];
        if (oldClasses.length) el.classList.remove(...oldClasses);
        if (newClasses.length) el.classList.add(...newClasses);
    });

    // Enregistrer globalement
    biomeData = newBiome;
    biomeName = newBiomeId;

    // Mise à jour du prompt système pour la continuité IA
    if (messages[0] && messages[0].role === "system") {
        messages[0].content = messages[0].content.replace(
            /- L'aventure se déroule dans le biome de .*\./,
            `- L'aventure se déroule dans le biome de ${newBiome.fullName}.`
        );
    }
};

// Event listeners
sendButton.addEventListener("click", () => {
    sendMessage(userInput.value);
});

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage(userInput.value);
    }
});

// ============ SAUVEGARDE / CHARGEMENT ============
const saveBtn     = document.getElementById("save-btn");
const saveToast   = document.getElementById("save-toast");
const resumeModal = document.getElementById("resume-modal");
const resumeYes   = document.getElementById("resume-yes");
const resumeNo    = document.getElementById("resume-no");

const role = new URLSearchParams(window.location.search).get("role") ?? "";

let savedMessages = null;

function showToast(text) {
    saveToast.textContent = text;
    saveToast.classList.remove("opacity-0");
    setTimeout(() => saveToast.classList.add("opacity-0"), 2500);
}

// Bouton Sauvegarder
saveBtn?.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/game/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ biome: biomeName, role, messages }),
        });
        showToast(res.ok ? "✓ Partie sauvegardée" : "✗ Erreur lors de la sauvegarde");
        if (res.ok) toggleMenu();
    } catch {
        showToast("✗ Erreur lors de la sauvegarde");
    }
});

// Vérifier si une sauvegarde existe au chargement
async function checkSave() {
    try {
        const res  = await fetch(`/api/game/load?biome=${biomeName}`);
        const data = await res.json();

        if (data.save?.messages?.length > 1) {
            savedMessages = data.save.messages;
            resumeModal.classList.remove("opacity-0", "pointer-events-none");
        } else {
            startGame();
        }
    } catch {
        startGame();
    }
}

// Reprendre la partie sauvegardée
resumeYes?.addEventListener("click", () => {
    resumeModal.classList.add("opacity-0", "pointer-events-none");
    messages.length = 0;
    savedMessages.forEach((m) => messages.push(m));
    messages
        .filter((m) => m.role !== "system")
        .forEach((m) => addMessage(m.role, m.content));
});

// Nouvelle partie
resumeNo?.addEventListener("click", () => {
    resumeModal.classList.add("opacity-0", "pointer-events-none");
    startGame();
});

// Démarrer le jeu au chargement
checkSave();
