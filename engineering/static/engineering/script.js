//For adding and deleting rows in a Project
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
function calculateHorsepower() {
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

    document.getElementById("result").innerHTML = horsepower.toFixed(2) 
}

document.addEventListener("DOMContentLoaded", function () {
    let sliders = document.querySelectorAll(".form-range")
    let outputs = document.querySelectorAll("input[type=number]")
    let radios = document.querySelectorAll(".form-radio")

    sliders.forEach(function (slider, index) {
        outputs[index].value = slider.value

        slider.oninput = function () {
            outputs[index].value = this.value
            calculateHorsepower()
        };

        calculateHorsepower()
    });

    outputs.forEach(function (output, index) {
        function updateValues(value) {
            let inputValue = parseFloat(value)
            sliders[index].value = inputValue
            calculateHorsepower()
        }

        output.oninput = function () {
            updateValues(this.value)
            calculateHorsepower()
        };

    });

    function updateUnits() {
        if (radios[0].checked) {
            document.querySelector(".power-unit").innerHTML = " HP"
            document.querySelector(".flowrate-unit").innerHTML = " GPM"
            document.querySelector(".totalHead-unit").innerHTML = " ft"
            calculateHorsepower()
        } else {
            document.querySelector(".power-unit").innerHTML = " KWH"
            document.querySelector(".flowrate-unit").innerHTML = " m3/hr or L/s"
            document.querySelector(".totalHead-unit").innerHTML = " m"
            calculateHorsepower()
        }
    }

    radios.forEach(function (radioButton) {
        radioButton.addEventListener("change", updateUnits)
        
    })

    updateUnits()
    
})

