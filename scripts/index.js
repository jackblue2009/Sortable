function createTableRows(heroes, pageSize) {
    const tableBody = document.querySelector('#superheroTable tbody');
    tableBody.innerHTML = '';

    const limit = pageSize === 'all' ? heroes.length : parseInt(pageSize);

    for (let i = 0; i < limit; i++) {
        const hero = heroes[i];
        const row = document.createElement('tr');
        const icon = `<td><img src="${hero.images.xs}" width="50" height="50" alt="${hero.name}"></td>`;
        const name = `<td>${hero.name}</td>`;
        const fullName = `<td>${hero.biography.fullName}</td>`;
        const pwrStats = `<td>${getItems(hero.powerstats)}</td>`;
        const race = `<td>${hero.appearance.race}</td>`;
        const gender = `<td>${hero.appearance.gender}</td>`;
        const height = `<td>${hero.appearance.height[1]}</td>`;
        const weight = `<td>${hero.appearance.weight[1]}</td>`;
        const placeOfBirth = `<td>${hero.biography.placeOfBirth}</td>`;
        const alignment = `<td>${hero.biography.alignment}</td>`;

        row.innerHTML = `${icon}${name}${fullName}${pwrStats}${race}${gender}${height}${weight}${placeOfBirth}${alignment}`;
        row.dataset.id = hero.id;
        tableBody.appendChild(row);
    }
}

function getItems(obj) {
    let result = "";
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
        const isLastKey = index === keys.length - 1;
        if (isLastKey) {
            result += `${key}: ${obj[key]}`;
        } else {
            result += `${key}: ${obj[key]}` + ', ';
        }
    });
    return result;
}

function filterHeroes(heroes, searchQuery) {
    if (searchQuery.toLowerCase().includes('fuzzy')) {
        return heroes.sort(() => Math.random() - Math.random()).slice(0, Math.floor(Math.random() * (50 - 20 + 1)) + 20);
    }
    const queries = parseSearchQuery(searchQuery);

    return heroes.filter((hero) => {
        return Object.entries(queries).every(([field, { operator, value }]) => {
            headers = document.querySelectorAll('#superheroTable th');
            let index = 0;
            headers.forEach((header, i) => {
                let f = field.toLowerCase();
                if (f === 'intelligence' || f === 'strength' || f === 'speed' || f === 'durability' || f === 'power' || f === 'combat') {
                    f = 'powerstats';
                }
                header.classList.remove('searched');
                if (header.innerHTML.toLowerCase() === f.toLowerCase()) {
                    index = i;
                }
            });
            headers[index].classList.add('searched');
            let heroValue = getField(hero, field);

            if (!heroValue) {
                return false;
            } else heroValue = heroValue.toString();

            switch (operator) {
                case 'include':
                    return heroValue.toLowerCase().includes(value.toLowerCase());
                case 'exclude':
                    return !heroValue.toLowerCase().includes(value.toLowerCase());
                case 'equal':
                    console.log(heroValue, value)
                    return parseInt(heroValue.split(' ')[0].replace(',', '')) === parseInt(value.split(' ')[0].replace(',', ''));
                case 'not equal':
                    return parseInt(heroValue.split(' ')[0].replace(',', '')) !== parseInt(value.split(' ')[0].replace(',', ''));
                case 'greater than':
                    return parseInt(heroValue.split(' ')[0].replace(',', '')) > parseInt(value.split(' ')[0].replace(',', ''));
                case 'less than':
                    return parseInt(heroValue.split(' ')[0].replace(',', '')) < parseInt(value.split(' ')[0].replace(',', ''));
                default:
                    return heroValue.toLowerCase().includes(value.toLowerCase());
            }
        });
    });
}

function parseSearchQuery(searchQuery) {
    const queries = {};
    const pairs = searchQuery.split(',');

    pairs.forEach(pair => {
        const [field, operatorValue] = pair.split(':');
        if (field && operatorValue) {
            const trimmedField = field.trim();
            const [operator, value] = parseOperator(operatorValue.trim());
            queries[trimmedField] = { operator, value };
        } else if (pair.trim()) {
            queries.name = { operator: 'default', value: pair.trim() };
        }
    });

    return queries;
}

function parseOperator(operatorValue) {
    const operators = ['include', 'exclude', 'fuzzy', 'equal', 'not equal', 'greater than', 'less than'];
    const operator = operators.find(op => operatorValue.toLowerCase().startsWith(op));

    if (operator) {
        const value = operatorValue.slice(operator.length).trim();
        return [operator, value];
    } else {
        return ['default', operatorValue];
    }
}


function getField(hero, field) {
    switch (field.toLowerCase()) {
        case 'name':
            return hero.name;
        case 'full name':
            return hero.biography.fullName;
        case 'place of birth':
            return hero.biography.placeOfBirth;
        case 'alignment':
            return hero.biography.alignment;
        case 'race':
            return hero.appearance.race;
        case 'gender':
            return hero.appearance.gender;
        case 'weight':
            return hero.appearance.weight[1];
        case 'height':
            return hero.appearance.height[1];
        case 'intelligence':
        case 'strength':
        case 'speed':
        case 'durability':
        case 'power':
        case 'combat':
            return hero.powerstats[field];
    }
}

const handlePageSizeChange = async () => {
    const selectedSize = document.querySelector('#pageSize').value;
    const searchQuery = document.querySelector('#searchInput').value;

    if (!searchQuery) {
        document.querySelectorAll('#superheroTable th')[1].classList.remove('searched');
    }

    let apiUrl = 'https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const filteredHeroes = filterHeroes(data, searchQuery);
        createTableRows(filteredHeroes, selectedSize);
        document.querySelectorAll('#superheroTable tbody tr').forEach((row) => {
            row.addEventListener('click', () => {
                const heroId = row.getAttribute('data-id');
                console.log(heroId);
                window.location.href = `hero-detail.html?heroId=${encodeURIComponent(heroId)}`;
            });
        });
    } catch (error) { 
        console.error('Error fetching data: ', error);
    }
    updateURL();
}

function updateURL() {
    const selectedSize = document.querySelector('#pageSize').value;
    const searchQuery = document.querySelector('#searchInput').value;

    const queryParams = new URLSearchParams();
    queryParams.set('search', encodeURIComponent(searchQuery));
    queryParams.set('pageSize', encodeURIComponent(selectedSize));


    window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`);
}

function retrieveSearchParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    const searchQuery = urlParams.get('search');
    const pageSize = urlParams.get('pageSize');

    document.querySelector('#searchInput').value = searchQuery || '';
    document.querySelector('#pageSize').value = pageSize || '20';
    handlePageSizeChange();
}

function sortTable(columnName, columnIndex, ascending) {
    const tableBody = document.querySelector('#superheroTable tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    let missing = [];
    let filtered = [];

    rows.forEach((row) => {
        let value = getCellValue(row, columnIndex);
        if (value === '' || value === '-' || value === 'null' || value === 'undefined' || parseFloat(value) === 0) {
            missing.push(row);
        } else {
            filtered.push(row);
        }
    })

    switch (columnName) {
        case 'name':
        case 'full name':
        case 'place of birth':
        case 'alignment':
        case 'gender':
        case 'race':
            filtered.sort(
                (rowA, rowB) => getCellValue(rowA, columnIndex).localeCompare(getCellValue(rowB, columnIndex))
            );
            break;
        case 'powerstats':
            filtered.sort((rowA, rowB) => calculatePowerstatsAverage(rowA, columnIndex) - calculatePowerstatsAverage(rowB, columnIndex));
            break;
        case 'height':
            filtered.sort((rowA, rowB) => calculateHeight(rowA, columnIndex) - calculateHeight(rowB, columnIndex));
            break;
        case 'weight':
            filtered.sort((rowA, rowB) => calculateWeight(rowA, columnIndex) - calculateWeight(rowB, columnIndex));
            break;
    }

    if (!ascending) {
        filtered.reverse();
    }
    tableBody.innerHTML = '';
    tableBody.append(...filtered, ...missing);
}

function getCellValue(row, colIndex) {
    const cell = row.children[colIndex];
    const cellValue = cell ? cell.textContent.trim().toLowerCase() : '';

    return cellValue;
}

function calculatePowerstatsAverage(row, columnIndex) {
    const powerstatsString = getCellValue(row, columnIndex);
    const powerstatsArray = powerstatsString.split(',').map(item => parseInt(item.trim().split(':')[1]));

    const sum = powerstatsArray.reduce((acc, value) => acc + value, 0);
    const average = sum / powerstatsArray.length;

    return average;
}

function calculateHeight(row, columnIndex) {
    const heightString = getCellValue(row, columnIndex);
    let height = parseFloat(heightString.split(' ')[0].replace(',', ''));

    if (heightString.split(' ')[1].trim().match(/^m|meters$/)) {
        height *= 100;
    }

    return height;
}

function calculateWeight(row, columnIndex) {
    const weightString = getCellValue(row, columnIndex);
    let weight = parseFloat(weightString.split(' ')[0].replace(',', ''));

    if (weightString.split(' ')[1].trim().match(/^tons$/)) {
        weight *= 907.185;
    }

    return weight;
}

window.addEventListener('load', retrieveSearchParamsFromURL);

document.querySelectorAll('#superheroTable th.sortable').forEach((header) => {
    header.addEventListener('click', () => {
        const columnIndex = parseInt(header.getAttribute('data-column'));
        const ascending = header.classList.toggle('asc');

        sortTable(header.innerHTML.toLowerCase(), columnIndex, ascending);
    });
});

document.querySelector('#pageSize').addEventListener('change', handlePageSizeChange);
document.querySelector('#searchInput').addEventListener('input', handlePageSizeChange);
handlePageSizeChange();
