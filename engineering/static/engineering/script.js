var deletedRows = [];

function addRow() {
    var table = document.getElementById("projectTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    // Get the current number of rows
    var rowNum = table.rows.length;

    // Add cells with contenteditable attribute
    for (var i = 0; i < 5; i++) {
        var cell = newRow.insertCell(i);
        if (i === 0) {
            cell.innerHTML = rowNum;
        } else if (i === 4) {
            cell.innerHTML = '<div contenteditable="false">0.00</div>';
        } else {
            var placeholderText = i === 1 ? 'Description' : (i === 2 ? 'Quantity' : 'Price');
            cell.innerHTML = '<div contenteditable="true" oninput="updateRowTotal(this)">' + placeholderText + '</div>';
        }
    }

    var deleteCell = newRow.insertCell(5);
    deleteCell.innerHTML = '<span onclick="deleteRow(this)" class="delete-icon">&#10060;</span>';

    // Ensure the existing cells are always editable
    for (var i = 1; i < newRow.cells.length - 1; i++) { // Exclude the last cell with the delete button
        var cell = newRow.cells[i].getElementsByTagName('div')[0];
        cell.contentEditable = 'true';
    }
}


function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var rowIndex = row.rowIndex;
    var rowData = [];

    // Save row data before deletion
    for (var i = 0; i < row.cells.length - 1; i++) {
        rowData.push(row.cells[i].innerHTML);
    }

    // Remove the row from the table
    row.parentNode.removeChild(row);

    // Save the deleted row for undo
    deletedRows.push({ index: rowIndex, data: rowData });
}

function undoDelete() {
    if (deletedRows.length > 0) {
        var lastDeleted = deletedRows.pop();
        var table = document.getElementById("projectTable").getElementsByTagName('tbody')[0];
        var newRow = table.insertRow(lastDeleted.index - 1);

        // Add cells and restore data
        for (var i = 0; i < lastDeleted.data.length; i++) {
            var cell = newRow.insertCell(i);
            cell.innerHTML = lastDeleted.data[i];
        }

        // Add the "Delete" button to the last cell
        var deleteCell = newRow.insertCell(lastDeleted.data.length);
        deleteCell.innerHTML = '<span onclick="deleteRow(this)" class="delete-icon">&#10060;</span>';
    }
}


function updateRowTotal(input) {
    var row = input.parentNode.parentNode;
    var quantity = parseFloat(row.cells[2].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[2].getElementsByTagName('div')[0].textContent);
    var price = parseFloat(row.cells[3].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[3].getElementsByTagName('div')[0].textContent);
    var totalAmountCell = row.cells[4].getElementsByTagName('div')[0];

    if (!isNaN(quantity) && !isNaN(price)) {
        var totalAmount = quantity * price;
        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        updateTotalAmount(); // Update the total below the table
    }
}

function updateTotalAmount(row) {
    var quantityCell = row.cells[2].getElementsByTagName('div')[0];
    var priceCell = row.cells[3].getElementsByTagName('div')[0];
    var totalAmountCell = row.cells[4].getElementsByTagName('div')[0];

    var quantity = parseFloat(quantityCell.innerText) || parseFloat(quantityCell.textContent);
    var price = parseFloat(priceCell.innerText) || parseFloat(priceCell.textContent);

    if (!isNaN(quantity) && !isNaN(price)) {
        var totalAmount = quantity * price;
        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        updateTotalAmount(); // Update the total below the table
    }
}

function updateTotalAmount() {
    var totalAmountCell = document.getElementById("totalAmount");
    var table = document.getElementById("projectTable");
    var rows = table.getElementsByTagName("tr");
    var totalAmount = 0;

    for (var i = 1; i < rows.length - 1; i++) { // Skip the header and total rows
        var quantityCell = rows[i].cells[2].getElementsByTagName('div')[0];
        var priceCell = rows[i].cells[3].getElementsByTagName('div')[0];

        var quantity = parseFloat(quantityCell.innerText) || parseFloat(quantityCell.textContent);
        var price = parseFloat(priceCell.innerText) || parseFloat(priceCell.textContent);

        if (!isNaN(quantity) && !isNaN(price)) {
            totalAmount += quantity * price;
        }
    }

    totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

