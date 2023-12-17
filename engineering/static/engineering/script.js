//For adding and deleting rows in a Project
document.addEventListener('DOMContentLoaded', function (e) {
    e.preventDefault(); // Disable right-click context menu
})

function validateFormSubPump() {
    // Validate other fields as needed
    var flowRate = document.getElementById("flowRate").value;
    var totalHead = document.getElementById("totalHead").value;
    var efficiency = document.getElementById("efficiency").value;
    var phase = document.getElementsByName("phase")[0].value;
    var quantity = document.getElementsByName("quantity")[0].value;
    var price = document.getElementsByName("price")[0].value;

    if (flowRate === "" || totalHead === "" || efficiency === "" || phase === "--Select Power System--" || quantity === "" || price === "") {
        alert("Please fill in all fields");
        return false;
    }

    return true;
}

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
            let placeholderText = i === 1 ? 'Description' : (i === 2 ? '0' : (i === 3 ? '0.00' : '0.00'))
            cell.innerHTML = '<div contenteditable="' + (i === 4 ? 'false' : 'true') + '" oninput="updateRowTotal(this)">' + placeholderText + '</div>'
        }
    }
    updateTotalAmount()
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
    updateTotalAmount()
}

// Update the total amount in the table
// Update the total amount in the table
function updateRowTotal(input) {
    let row = input.parentNode.parentNode;
    let quantity = parseFloat(row.cells[2].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[2].getElementsByTagName('div')[0].textContent)
    let price = parseFloat(row.cells[3].getElementsByTagName('div')[0].innerText) || parseFloat(row.cells[3].getElementsByTagName('div')[0].textContent)
    let totalAmountCell = row.cells[4].getElementsByTagName('div')[0]

    updateTotalAmountForRow(row, quantity, price, totalAmountCell);
}

// Update the total in the table
function updateTotalAmountForRow(row, quantity, price, totalAmountCell) {
    if (!isNaN(quantity) && !isNaN(price)) {
        let totalAmount = quantity * price
        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        updateTotalAmount();
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

        totalAmountCell.innerText = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
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


document.addEventListener("DOMContentLoaded", function () {
    const saveTable = document.getElementById('saveTable')
    if (saveTable) {
        saveTable.addEventListener('click', function () {
            const tableData = [];
            const rows = document.querySelectorAll('table tbody tr');
            rows.forEach(row => {
                const rowData = {};
                const cells = row.querySelectorAll('td');
                rowData.description = cells[1].querySelector('div').innerText;
                rowData.quantity = parseInt(cells[2].querySelector('div').innerText, 10);
                rowData.price = parseFloat(cells[3].querySelector('div').innerText, 10);
                tableData.push(rowData);
            });

            const projectId = document.querySelector("#projectname").value;
            console.log(projectId);

            fetch(`/api/save_data/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(tableData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);

                    // Updated code to use Bootstrap 5 modal
                    const saveMessageModal = new bootstrap.Modal(document.getElementById('saveMessage'));
                    alert("Project Saved")

                    setTimeout(() => {
                        window.location.href = `/project/${projectId}`;
                    }, 5000);
                })
                .catch(error => {
                    console.error('Error:', error);
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
    }
})

document.addEventListener("DOMContentLoaded", function () {
    const versionDropdown = document.getElementById('versionDropdown')
    if (versionDropdown) {
        versionDropdown.addEventListener('change', function () {
            var projectId = document.getElementById('projectname').value;
            var version = document.getElementById('versionDropdown').value;

            if (version != "Version History") {
                fetch(`/get_data/${projectId}/${version}`)
                    .then(response => response.json())
                    .then(data => {
                        updateTable(data.projDetails);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
            }
        })
    };

    function updateTable(projDetails) {
        var tableBody = document.getElementById('projectTable').getElementsByTagName('tbody')[0];

        // Clear existing rows
        tableBody.innerHTML = '';

        // Iterate through projDetails and append rows to the table
        projDetails.forEach((detail, index) => {
            var newRow = `
            <tr>
                <td>${index + 1}</td>
                <td><div contenteditable="true">${detail.description}</div></td>
                <td><div contenteditable="true" oninput="updateRowTotal(this)">${detail.quantity}</div></td>
                <td><div contenteditable="true" oninput="updateRowTotal(this)">${parseFloat(detail.price).toFixed(2)}</div></td>
                <td><div contenteditable="false">${parseFloat(detail.totalAmount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div></td>
                <td><span onclick="deleteRow(this)" class="delete-icon">&#10060;</span></td>
            </tr>`;

            tableBody.insertAdjacentHTML('beforeend', newRow);
            updateTotalAmount()
        });
    }


    // Function to handle the import button click
    const importDesign = document.getElementById('import-design')
    if (importDesign) {
        importDesign.addEventListener('click', function () {
            var projectId = document.getElementById('projectname').value;
            var pumpID = document.getElementById('importDropdown').value;


            fetch(`/designData/${projectId}/${pumpID}`)
                .then(response => response.json())
                .then(data => {
                    importRow(data)
                    $('#importModal').modal('hide'); // Close the modal after updating the table
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    // Handle error (e.g., show an alert to the user)
                });
        });
    }

    function importRow(data) {
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
                data[0].system === 'english' ? unit = 'hp' : unit = 'KWH'
                let placeholderText = i === 1 ? `
                <span>Submersible Pump,</span><br>
                <span>${data[0].ph},</span><br>
                <span>${data[0].power} ${unit},</span>` : (i === 2 ? `${data[0].quantity}` : (i === 3 ? `${(data[0].price).toFixed(2)}` : `${(parseFloat(data[0].price) * parseFloat(data[0].quantity)).toFixed(2)}`))
                cell.innerHTML = '<div contenteditable="' + (i === 4 ? 'false' : 'true') + '" oninput="updateRowTotal(this)">' + placeholderText + '</div>'
            }
        }
        updateTotalAmount()
    }
})