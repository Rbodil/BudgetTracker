let db;
const request = indexedDB.open('budget-tracker-24', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        updateBudget();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['transaction'], 'readwrite');

    const activityObjStore = transaction.objectStore('transaction');

    activityObjStore.add(record);
}

function updateBudget() {
    const transaction = db.transaction(['transaction'], 'readwrite');

    const activityObjStore = transaction.objectStore('transaction');

    const getAll = activityObjStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['transaction'], 'readwrite');
                    const activityObjStore = transaction.objectStore('transaction');
                    activityObjStore.clear();
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', updateBudget);
