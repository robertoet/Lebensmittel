// Listen DOM-Elemente
let todosList = document.getElementById('todos-list');
let lebensmittelList = document.getElementById('lebensmittel-list');
let einkaufslisteList = document.getElementById('einkaufsliste-list');

// Datenstrukturen für die Listen
let todosData = JSON.parse(localStorage.getItem('todos')) || [];
let lebensmittelData = JSON.parse(localStorage.getItem('lebensmittel')) || [];
let einkaufslisteData = JSON.parse(localStorage.getItem('einkaufsliste')) || [];

// jsPDF initialisieren
const { jsPDF } = window.jspdf;

// Funktion zum Laden der gespeicherten Daten
function loadLists() {
    todosList.innerHTML = '';
    lebensmittelList.innerHTML = '';
    einkaufslisteList.innerHTML = '';
    todosData.forEach(item => addToTodosList(item.text, item.date));
    lebensmittelData.forEach(item => addToLebensmittelList(item.text, item.date, item.location));
    einkaufslisteData.forEach(item => addToEinkaufslisteList(item.text));
}

// Hilfsfunktion zur Korrektur des Anfangsbuchstabens
// function capitalizeFirstLetter(text) {
//     if (!text) return text;
//     return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
// }

// Hilfsfunktion zum Hinzufügen eines Elements zur TO-DOs-Liste
function addToTodosList(text, date) {
    let li = document.createElement('li');
    li.textContent = text;

    // Container für Datum und Button (rechts ausgerichtet)
    let rightContainer = document.createElement('div');
    rightContainer.className = 'right-align';
    rightContainer.innerHTML = `<span class="date">(${date})</span>`;

    let erledigtBtn = document.createElement('button');
    erledigtBtn.textContent = 'erledigt';
    erledigtBtn.onclick = function() {
        li.remove();
        todosData = todosData.filter(i => i.text !== text);
        saveLists();
    };
    rightContainer.appendChild(erledigtBtn);

    li.appendChild(rightContainer);
    todosList.appendChild(li);

    // Bearbeitungsfunktion hinzufügen
    li.addEventListener('click', function(e) {
        // Ignoriere Klicks auf den Button oder den Container
        if (e.target.tagName === 'BUTTON' || e.target.className === 'right-align' || e.target.tagName === 'SPAN') {
            return;
        }

        // Aktuellen Text speichern
        let oldText = text;

        // Eingabefeld erstellen
        let input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        input.style.width = '50%'; // Optional: Breite anpassen

        // Bestehenden Text und Container entfernen
        li.textContent = '';
        li.appendChild(input);
        li.appendChild(rightContainer);
        input.focus();

        // Bei Enter oder Verlassen des Eingabefelds speichern
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });

        function saveEdit() {
            let newText = input.value.trim();
            if (newText && newText !== oldText) {
                // Listenelement aktualisieren
                li.textContent = newText;
                li.appendChild(rightContainer);

                // Datenstruktur aktualisieren
                let item = todosData.find(i => i.text === oldText);
                if (item) {
                    item.text = newText;
                    saveLists();
                }
            } else {
                // Alten Text wiederherstellen, wenn nichts geändert wurde
                li.textContent = oldText;
                li.appendChild(rightContainer);
            }
        }
    });
}

// Hilfsfunktion zum Hinzufügen eines Elements zur Lebensmittel-Liste
function addToLebensmittelList(text, date, location = 'Ort') {
    let li = document.createElement('li');
    li.textContent = text + ' ';
    li.innerHTML += `<span class="date">(${date})</span>`;

    // Container für Dropdown und Button
    let rightContainer = document.createElement('div');
    rightContainer.className = 'right-align';

    // Dropdown-Menü für Speicherort
    let select = document.createElement('select');
    select.innerHTML = `
        <option value="Ort" ${location === 'Ort' ? 'selected' : ''}>Ort</option>
        <option value="Kühlschrank" ${location === 'Kühlschrank' ? 'selected' : ''}>Kühlschrank</option>
        <option value="Vorratskammer" ${location === 'Vorratskammer' ? 'selected' : ''}>Vorratskammer</option>
        <option value="Keller" ${location === 'Keller' ? 'selected' : ''}>Keller</option>
    `;
    select.onchange = function() {
        // Aktualisiere den Speicherort in lebensmittelData
        let item = lebensmittelData.find(i => i.text === text);
        if (item) {
            item.location = select.value;
            saveLists();
        }
    };
    rightContainer.appendChild(select);

    // Gegessen-Button
    let gegessenBtn = document.createElement('button');
    gegessenBtn.textContent = 'gegessen';
    gegessenBtn.onclick = function() {
        if (confirm('Soll dieses Element zur Einkaufsliste hinzugefügt werden?')) {
            addToEinkaufslisteItem(text);
        }
        li.remove();
        lebensmittelData = lebensmittelData.filter(i => i.text !== text);
        saveLists();
    };
    rightContainer.appendChild(gegessenBtn);

    li.appendChild(rightContainer);
    lebensmittelList.appendChild(li);

    // Bearbeitungsfunktion hinzufügen
    li.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.className === 'right-align' || e.target.tagName === 'SPAN') {
            return;
        }

        let oldText = text;
        let input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        input.style.width = '50%';

        li.textContent = '';
        li.innerHTML += `<span class="date">(${date})</span>`;
        li.insertBefore(input, li.firstChild);
        li.appendChild(rightContainer);
        input.focus();

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });

        function saveEdit() {
            let newText = input.value.trim();
            if (newText && newText !== oldText) {
                li.textContent = newText + ' ';
                li.innerHTML += `<span class="date">(${date})</span>`;
                li.appendChild(rightContainer);

                let item = lebensmittelData.find(i => i.text === oldText);
                if (item) {
                    item.text = newText;
                    saveLists();
                }
            } else {
                li.textContent = oldText + ' ';
                li.innerHTML += `<span class="date">(${date})</span>`;
                li.appendChild(rightContainer);
            }
        }
    });
}

// Hilfsfunktion zum Hinzufügen eines Elements zur Einkaufsliste
function addToEinkaufslisteList(text) {
    let li = document.createElement('li');
    li.textContent = text;
    let erledigtBtn = document.createElement('button');
    erledigtBtn.textContent = 'erledigt';
    erledigtBtn.onclick = function() {
        moveToLebensmittel(text);
        li.remove();
        einkaufslisteData = einkaufslisteData.filter(i => i.text !== text);
        saveLists();
    };
    li.appendChild(erledigtBtn);
    einkaufslisteList.appendChild(li);
}

// Funktion zum Hinzufügen eines Elements zur TO-DOs-Liste
function addToTodos() {
    let item = prompt("Bitte geben Sie das neue Element ein:");
    if (item) {
        let date = new Date().toLocaleDateString('de-DE');
        addToTodosList(item, date);
        todosData.push({ text: item, date: date });
        saveLists();
    }
}

// Funktion zum Hinzufügen eines Elements zur Einkaufsliste
function addToEinkaufsliste() {
    let item = prompt("Bitte geben Sie das neue Element ein:");
    if (item) {
        addToEinkaufslisteList(item);
        einkaufslisteData.push({ text: item });
        saveLists();
    }
}

// Funktion zum Hinzufügen eines Elements zur Lebensmittel-Liste
function addToLebensmittel() {
    let item = prompt("Bitte geben Sie das neue Element ein:");
    if (item) {
        let date = new Date().toLocaleDateString('de-DE');
        addToLebensmittelList(item, date);
        lebensmittelData.push({ text: item, date: date, location: 'Ort' });
        saveLists();
    }
}

// Element von Einkaufsliste zur Lebensmittel-Liste verschieben
function moveToLebensmittel(item) {
    let date = new Date().toLocaleDateString('de-DE');
    addToLebensmittelList(item, date);
    lebensmittelData.push({ text: item, date: date, location: 'Ort' });
    saveLists();
}

// Element direkt zur Einkaufsliste hinzufügen (nach "gegessen")
function addToEinkaufslisteItem(item) {
    addToEinkaufslisteList(item);
    einkaufslisteData.push({ text: item });
    saveLists();
}

// Funktion zum Speichern der Listen in localStorage
function saveLists() {
    localStorage.setItem('todos', JSON.stringify(todosData));
    localStorage.setItem('lebensmittel', JSON.stringify(lebensmittelData));
    localStorage.setItem('einkaufsliste', JSON.stringify(einkaufslisteData));
}

// Funktion für "Ideen zum Kochen"
function getCookingIdeas() {
    let items = lebensmittelData.map(item => item.text).join(', ');
    if (!items) {
        alert('Die Lebensmittel-Liste ist leer!');
        return;
    }

    let prompt = `Gib mir drei einfache Gerichte, die ich aus dieser Ansammlung von Lebensmitteln kochen kann. Die Mahlzeiten sollen ausgewogen und proteinreich sein. Wenn Lebensmittel fehlen, markiere sie, in dem du sie unterstreichst. Lebensmittelliste: ${items}`;
    let grokUrl = 'https://grok.com/';

    // Kopiere den Prompt in die Zwischenablage
    navigator.clipboard.writeText(prompt)
        .then(() => {
            // Öffne die URL in einem neuen Tab
            window.open(grokUrl, '_blank');
            // Optional: Informiere den Nutzer, dass der Prompt kopiert wurde
            console.log('Prompt wurde in die Zwischenablage kopiert. Verwende Strg+V oder Cmd+V zum Einfügen.');
        })
        .catch(err => {
            console.error('Fehler beim Kopieren in die Zwischenablage: ', err);
            // Fallback: Öffne die URL trotzdem
            window.open(grokUrl, '_blank');
        });
}

// Funktion für "Einkaufsliste drucken" (PDF-Download)
function printEinkaufsliste() {
    if (einkaufslisteData.length === 0) {
        alert('Die Einkaufsliste ist leer!');
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Einkaufsliste', 10, 10);
    doc.setFontSize(12);
    let yPosition = 20;
    einkaufslisteData.forEach((item, index) => {
        doc.text(`- ${item.text}`, 10, yPosition);
        yPosition += 10;
    });
    doc.save('einkaufsliste.pdf');
}

// Liste beim Laden der Seite initialisieren
window.onload = loadLists();