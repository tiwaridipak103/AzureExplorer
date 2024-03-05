var currentPopup = null;
    
function rowDoubleClick(row) {
    if (row && row.cells && row.cells.length > 0) {
    // Double click functionality
    var name = row.cells[0].innerText;

    // Send HTTP request to Python server
    fetch('/update_dropdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name }) // Send the clicked file name to the server
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Dropdown value updated successfully
            var dropdown = document.getElementById('pathDropdown');
            var newOption = document.createElement('option');
            newOption.value = data.newValue;
            newOption.text = data.newValue;
            dropdown.add(newOption);
            newOption.selected = true;

            // Update table with new file list
            updateTable(data.file_list);
        } else {
            // Error handling
            console.error('Error updating dropdown value:', data.error);
        }
    })
    .catch(error => {
        // Error handling
        console.error('Error updating dropdown value:', error);
    });

}

}
function showContextMenu(event, row) {
    event.preventDefault();

    // Remove any existing popup
    if (currentPopup !== null) {
        currentPopup.remove();
    }

    // Create context menu
    var menu = document.createElement("div");
    menu.className = "popup";
    menu.style.top = event.clientY + "px";
    menu.style.left = event.clientX + "px";
    menu.innerHTML = "<ul><li>📋 Copy</li><li>✂️ Cut</li><li>🗑️ Delete</li><li>📥 Paste</li><li>🔄 Rename</li></ul>";

    // Add menu to the document
    document.body.appendChild(menu);

    // Assign the current popup
    currentPopup = menu;

    // Close the menu when clicking outside
    window.addEventListener("click", function(event) {
        if (!menu.contains(event.target)) {
            menu.remove();
            currentPopup = null;
        }
    });
}

function updateTable(fileList) {
var tableBody = document.querySelector('#sortable tbody');
tableBody.innerHTML = ''; // Clear the existing table content

// Add new rows to the table
fileList.forEach(function(file) {
    var row = tableBody.insertRow();
    row.innerHTML = '<td>' + file.name + '</td>' +
                    '<td>' + file.modified_date + '</td>' +
                    '<td>' + file.size + '</td>';
});
}




// Event listener for dropdown value change
document.getElementById('pathDropdown').addEventListener('change', function() {
    var selectedValue = this.value;

    // Send AJAX request to Flask route
    fetch('/selected_value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedValue: selectedValue })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        // Print output received from server
        console.log('Response from server:', data.selected_value);
        // Update table with new file list
        updateTable(data.file_list);

        } else {
        // Error handling
        console.error('Error updating dropdown value:', data.error);
        }
    })
    .catch(error => {
        // Log error if request fails
        console.error('Error:', error);
    });
});

// Event listener for "Previous" button click
document.getElementById('previousButton').addEventListener('click', function() {
    // Navigate to previous page
    //var dropdown = document.getElementById('pathDropdown');
    
    // Send AJAX request to Flask route
    fetch('/pre_tab', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        //,body: JSON.stringify({ selectedValue: selectedValue })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        // Print output received from server
        console.log('Response from server:', data.newValue);

        // Dropdown value updated successfully
        var dropdown = document.getElementById('pathDropdown');
        var newOption = document.createElement('option');
        newOption.value = data.newValue;
        newOption.text = data.newValue;
        dropdown.add(newOption);
        newOption.selected = true;

        // Update table with new file list
        updateTable(data.file_list);

        } else {
        // Error handling
        console.error('Error updating dropdown value:', data.error);
        }
    })
    .catch(error => {
        // Log error if request fails
        console.error('Error:', error);
    });
});

// Event listener for "Previous" button click
document.getElementById('nextButton').addEventListener('click', function() {
    // Navigate to previous page
    //var dropdown = document.getElementById('pathDropdown');
    
    // Send AJAX request to Flask route
    fetch('/next_tab', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        //,body: JSON.stringify({ selectedValue: selectedValue })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        // Print output received from server
        console.log('Response from server:', data.newValue);

        // Dropdown value updated successfully
        var dropdown = document.getElementById('pathDropdown');
        var newOption = document.createElement('option');
        newOption.value = data.newValue;
        newOption.text = data.newValue;
        dropdown.add(newOption);
        newOption.selected = true;

        // Update table with new file list
        updateTable(data.file_list);

        } else {
        // Error handling
        console.error('Error updating dropdown value:', data.error);
        }
    })
    .catch(error => {
        // Log error if request fails
        console.error('Error:', error);
    });
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData();
    formData.append('file', document.getElementById('fileInput').files[0]);

    fetch('/upload_file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update table with new file list
            updateTable(data.file_list);
        } else {
            // Error handling
            console.error('Error uploading file:', data.error);
        }
    })
    .catch(error => {
        // Log error if request fails
        console.error('Error:', error);
    });
});

document.querySelector('#sortable tbody').addEventListener('dblclick', function(event) {
var target = event.target;
if (target.tagName === 'TD') {
    rowDoubleClick(target.parentNode); // Pass the parent row to the rowDoubleClick function
}
});

// Event delegation for context menu
document.querySelector('#sortable tbody').addEventListener('contextmenu', function(event) {
    var target = event.target;
    if (target.tagName === 'TD') {
        showContextMenu(event, target.parentNode); // Pass the parent row to the showContextMenu function
    }
});



