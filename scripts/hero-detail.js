document.addEventListener('DOMContentLoaded', async () => {
    function displayHeroDetails(hero) {
        const heroDetailElement = document.getElementById('heroDetail');
        heroDetailElement.innerHTML = `
            <img src="${hero.images.lg}" alt="${hero.name} width="500" height="500">
            <h1>${hero.name}</h1>
        `;
        heroDetailElement.appendChild(jsonToUL(hero));
    }

    function retrieveHeroIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const heroId = urlParams.get('heroId');
        return heroId || null;
    }

    const heroId = retrieveHeroIdFromURL();

    let apiUrl = 'https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const hero = data.find(hero => hero.id === parseInt(heroId));

        if (hero) {
            displayHeroDetails(hero);
        } else {
            alert('Hero not found')
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
});

function jsonToUL(data) {
    const ulElement = document.createElement('ul');

    for (const key in data) {
        const liElement = document.createElement('li');
        const keyElement = document.createElement('span');
        keyElement.classList.add('json-key');
        keyElement.textContent = key + ': ';

        liElement.appendChild(keyElement);

        if (typeof data[key] === 'object' && data[key] !== null) {
            liElement.appendChild(jsonToUL(data[key]));
        } else {
            // Display primitive values
            const valueElement = document.createElement('span');

            if (data[key] === null) {
                valueElement.classList.add('json-null');
                valueElement.textContent = 'null';
            } else if (typeof data[key] === 'number') {
                valueElement.classList.add('json-number');
                valueElement.textContent = data[key];
            } else if (typeof data[key] === 'boolean') {
                valueElement.classList.add('json-boolean');
                valueElement.textContent = data[key] ? 'true' : 'false';
            } else {
                valueElement.classList.add('json-string');
                valueElement.textContent = `"${data[key]}"`;
            }

            liElement.appendChild(valueElement);
        }

        ulElement.appendChild(liElement);
    }

    return ulElement;
}
