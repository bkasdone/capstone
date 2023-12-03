//For adding and deleting rows in a Project
document.addEventListener('contextmenu', function (e) {
    e.preventDefault(); // Disable right-click context menu
})

let deletedRows = []

function addRow() {
    let table = document.getElementById("projectTable").getElementsByTagName('tbody')[0]
    let newRow = table.insertRow(table.rows.length)
    let rowNum = table.rows.length

    for (let i = 1; i < newRow.cells.length - 1; i++) {
        let cell = newRow.cells[i].getElementsByTagName('div')[0]
        cell.contentEditable = 'true'
    }

    for (let i = 0; i < 6; i++) {
        let cell = newRow.insertCell(i)
        if (i === 0) {
            cell.innerHTML = rowNum
        } else if (i === 5) {
            cell.innerHTML = '<span onclick="deleteRow(this)" class="delete-icon">&#10060;</span>'
        } else {
            let placeholderText = i === 1 ? 'Description' : (i === 2 ? 'Quantity' : (i === 3 ? 'Price' : 'Total Amount'))
            cell.innerHTML = '<div contenteditable="' + (i === 4 ? 'false' : 'true') + '" oninput="updateRowTotal(this)">' + placeholderText + '</div>'
        }
    }

}

function deleteRow(button) {
    let row = button.parentNode.parentNode
    let rowIndex = row.rowIndex
    let rowData = []

    for (let i = 0; i < row.cells.length - 1; i++) {
        rowData.push(row.cells[i].innerHTML)
    }

    row.parentNode.removeChild(row)

    deletedRows.push({ index: rowIndex, data: rowData })

    updateTotalAmount()
}

// Undo Button
function undoDelete() {
    if (deletedRows.length > 0) {
        let lastDeleted = deletedRows.pop()
        let table = document.getElementById("projectTable").getElementsByTagName('tbody')[0]
        let newRow = table.insertRow(lastDeleted.index - 1)

        for (let i = 0; i < lastDeleted.data.length; i++) {
            let cell = newRow.insertCell(i)
            cell.innerHTML = lastDeleted.data[i]
        }

        let deleteCell = newRow.insertCell(lastDeleted.data.length)
        deleteCell.innerHTML = '<span onclick="deleteRow(this)" class="delete-icon">&#10060;</span>'
    }
}

// Update the total amount in the table
function updateRowTotal(input) {
    let row = input.parentNode.parentNode;
    let quantity = parseFloat(row.cells[2].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[2].getElementsByTagName('div')[0].textContent)
    let price = parseFloat(row.cells[3].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[3].getElementsByTagName('div')[0].textContent)
    let totalAmountCell = row.cells[4].getElementsByTagName('div')[0]

    if (!isNaN(quantity) && !isNaN(price)) {
        let totalAmount = quantity * price
        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        updateTotalAmount()
    }
}

// Update the total in the table
function updateTotalAmount(row) {
    let quantityCell = row.cells[2].getElementsByTagName('div')[0]
    let priceCell = row.cells[3].getElementsByTagName('div')[0]
    let totalAmountCell = row.cells[4].getElementsByTagName('div')[0]

    let quantity = parseFloat(quantityCell.innerText) || parseFloat(quantityCell.textContent)
    let price = parseFloat(priceCell.innerText) || parseFloat(priceCell.textContent)

    if (!isNaN(quantity) && !isNaN(price)) {
        let totalAmount = quantity * price
        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        updateTotalAmount()
    }
}

// Update the total below the table
function updateTotalAmount() {
    let totalAmountCell = document.getElementById("totalAmount")
    let table = document.getElementById("projectTable")
    let rows = table.getElementsByTagName("tr")
    let totalAmount = 0

    for (let i = 1; i < rows.length - 1; i++) {
        let quantityCell = rows[i].cells[2].getElementsByTagName('div')[0]
        let priceCell = rows[i].cells[3].getElementsByTagName('div')[0]

        let quantity = parseFloat(quantityCell.innerText) || parseFloat(quantityCell.textContent)
        let price = parseFloat(priceCell.innerText) || parseFloat(priceCell.textContent)

        if (!isNaN(quantity) && !isNaN(price)) {
            totalAmount += quantity * price
        }
    }

    totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Pump Power Consumption Computation
function calculatePower() {
    let flowRate = parseFloat(document.getElementById("flowRate").value)
    let totalHead = parseFloat(document.getElementById("totalHead").value)
    let efficiency = parseFloat(document.getElementById("efficiency").value)
    let systemType = document.querySelector('input[name="system"]:checked').value
    let conversionFactor = (systemType === 'english') ? 3960 : 75


    if (isNaN(flowRate) || isNaN(totalHead) || isNaN(efficiency)) {
        document.getElementById("result").innerHTML = "Invalid input values"
        return
    }

    efficiency = efficiency / 100

    let horsepower = (flowRate * totalHead) / (conversionFactor * efficiency)

    document.getElementById("result").innerHTML = horsepower.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    document.getElementById("power").value = horsepower.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    document.getElementById("flowRateHidden").value = parseFloat(flowRate);
    document.getElementById("totalHeadHidden").value = parseFloat(totalHead);
    document.getElementById("efficiencyHidden").value = parseFloat(efficiency);

}

document.addEventListener("DOMContentLoaded", function () {
    let sliders = document.querySelectorAll(".form-range")
    let outputs = document.querySelectorAll("input[type=number]")
    let radios = document.querySelectorAll(".form-radio")

    if (radios.length > 0) {
        sliders.forEach(function (slider, index) {
            outputs[index].value = slider.value

            slider.oninput = function () {
                outputs[index].value = this.value
                calculatePower()
            };

            calculatePower()
        });

        outputs.forEach(function (output, index) {
            function updateValues(value) {
                let inputValue = parseFloat(value)
                sliders[index].value = inputValue
                calculatePower()
            }

            output.oninput = function () {
                updateValues(this.value)
                calculatePower()
            };

        });

        function updateUnits() {
            if (radios[0].checked) {
                document.querySelector(".power-unit").innerHTML = " HP"
                document.querySelector(".power-unit").title = "Horsepower; Formula: (FlowRate * Total Head) / (3960 * Efficiency)"
                document.querySelector(".flowrate-unit").innerHTML = "GPM"
                document.querySelector(".flowrate-unit").title = "Gallon per minute"
                document.querySelector(".totalHead-unit").innerHTML = "ft"
                document.querySelector(".totalHead-unit").title = "Feet"
                calculatePower()
            } else {
                document.querySelector(".power-unit").innerHTML = " KWH"
                document.querySelector(".power-unit").title = "Kilowatt Hour; Formula: (FlowRate * Total Head) / (75 * Efficiency)"
                document.querySelector(".flowrate-unit").innerHTML = "m3/hr or L/s"
                document.querySelector(".flowrate-unit").title = "Cubic meter per hour or Liter per second"
                document.querySelector(".totalHead-unit").innerHTML = "m"
                document.querySelector(".totalHead-unit").title = "Meter"
                calculatePower()
            }
        }

        radios.forEach(function (radioButton) {
            radioButton.addEventListener("change", updateUnits)

        })

        updateUnits()
    }

})

// Assuming you have a button with the id 'saveTable'
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('saveTable').addEventListener('click', function () {
        // Select data from the HTML table (modify this according to your table structure)
        const tableData = [];
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const rowData = {};
            const cells = row.querySelectorAll('td');
            rowData.description = cells[1].querySelector('div').innerText;
            rowData.quantity = parseInt(cells[2].querySelector('div').innerText, 10);
            rowData.price = parseInt(cells[3].querySelector('div').innerText, 10);
            // Add more fields as needed
            tableData.push(rowData);
        });

        // Send the data to the Django API endpoint
        const projectId = document.querySelector("#projectname").value;
        console.log(projectId);  // Check the value in the console
        fetch(`/api/save_data/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include the CSRF token
            },
            body: JSON.stringify(tableData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });


    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Check if this cookie name is the one we want
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

})
