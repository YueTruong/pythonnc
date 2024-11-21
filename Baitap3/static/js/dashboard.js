document.addEventListener("DOMContentLoaded", () => {
    const themeForm = document.getElementById("themeForm");
    const legoSetForm = document.getElementById("legoSetForm");
    const legoSetsTable = document.getElementById("legoSetsTable");

    // Add Theme
    themeForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(themeForm);
        const response = await fetch("/add_theme", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Reload dashboard after adding a theme
    };

    // Add Lego Set
    legoSetForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(legoSetForm);
        const response = await fetch("/add_legoset", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Reload dashboard after adding a LEGO set
    };

    // Edit Theme
    window.editTheme = async (oldTheme) => {
        const newTheme = prompt("Enter the new name for the theme:", oldTheme);
        if (newTheme && newTheme !== oldTheme) {
            const formData = new FormData();
            formData.append('old_theme', oldTheme);
            formData.append('new_theme', newTheme);

            const response = await fetch("/edit_theme", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Reload dashboard after editing a theme
        }
    };

    // Edit Lego Set
    window.editLegoSet = async (id, currentTheme, currentName) => {
        const newTheme = prompt("Enter the new theme:", currentTheme) || currentTheme;
        const newName = prompt("Enter the new name:", currentName) || currentName;

        const formData = new FormData();
        formData.append('lego_id', id);
        formData.append('lego_theme', newTheme);
        formData.append('lego_name', newName);

        const response = await fetch("/edit_lego", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Reload dashboard after editing a LEGO set
    };

    // Delete Theme
    window.deleteTheme = async (theme) => {
        if (confirm(`Are you sure you want to delete the theme: ${theme}?`)) {
            const formData = new FormData();
            formData.append('theme', theme);
            const response = await fetch("/delete_theme", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Reload dashboard after deleting a theme
        }
    };

    // Delete Lego Set
    window.deleteLegoSet = async (id) => {
        if (confirm("Are you sure you want to delete this LEGO set?")) {
            const formData = new FormData();
            formData.append('lego_id', id);
            const response = await fetch("/delete_lego", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Reload dashboard after deleting a LEGO set
        }
    };

    // Load Lego Sets with Sorting
    async function loadLegoSets(column = "name", order = "asc") {
        const response = await fetch(`/legosets?sort_column=${column}&sort_order=${order}`);
        const data = await response.json();
        let html = "";
        data.forEach(row => {
            html += `
                <tr>
                    <td>${row[1]}</td> <!-- Theme -->
                    <td>${row[2]}</td> <!-- Name -->
                    <td>
                        <button onclick="editLegoSet(${row[0]}, '${row[1]}', '${row[2]}')">Edit</button>
                        <button onclick="deleteLegoSet(${row[0]})">Delete</button>
                    </td>
                </tr>`;
        });
        legoSetsTable.querySelector("tbody").innerHTML = html;
    }

    // Initial load of LEGO sets
    loadLegoSets();
});
