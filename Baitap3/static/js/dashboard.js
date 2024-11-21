document.addEventListener("DOMContentLoaded", () => {
    const themeForm = document.getElementById("themeForm");
    const legoSetForm = document.getElementById("legoSetForm");
    const legoSetsTable = document.getElementById("legoSetsTable");

    // Thêm chủ đề
    themeForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(themeForm);
        const response = await fetch("/add_theme", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Tải lại giao diện sau khi thêm chủ đề
    };

    // Thêm thông tin về bộ LEGO
    legoSetForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(legoSetForm);
        const response = await fetch("/add_legoset", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Tải lại giao diện sau khi thêm thông tin về bộ LEGO
    };

    // Chỉnh sửa chủ đề
    window.editTheme = async (oldTheme) => {
        const newTheme = prompt("Enter the new name for the theme:", oldTheme);
        if (newTheme && newTheme !== oldTheme) {
            const formData = new FormData();
            formData.append('old_theme', oldTheme);
            formData.append('new_theme', newTheme);

            const response = await fetch("/edit_theme", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Tải lại giao diện sau khi chỉnh sửa chủ đề
        }
    };

    // Chỉnh sửa thông tin về bộ LEGO
    window.editLegoSet = async (id, currentTheme, currentName) => {
        const newTheme = prompt("Enter the new theme:", currentTheme) || currentTheme;
        const newName = prompt("Enter the new name:", currentName) || currentName;

        const formData = new FormData();
        formData.append('lego_id', id);
        formData.append('lego_theme', newTheme);
        formData.append('lego_name', newName);

        const response = await fetch("/edit_lego", { method: "POST", body: formData });
        if (response.ok) location.reload();  // Tải lại giao diện sau khi chỉnh sửa thông tin về bộ LEGO
    };

    // Xóa chủ đề
    window.deleteTheme = async (theme) => {
        if (confirm(`Are you sure you want to delete the theme: ${theme}?`)) {
            const formData = new FormData();
            formData.append('theme', theme);
            const response = await fetch("/delete_theme", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Tải lại giao diện sau khi xóa chủ đề
        }
    };

    // Xóa thông tin về bộ LEGO
    window.deleteLegoSet = async (id) => {
        if (confirm("Are you sure you want to delete this LEGO set?")) {
            const formData = new FormData();
            formData.append('lego_id', id);
            const response = await fetch("/delete_lego", { method: "POST", body: formData });
            if (response.ok) location.reload();  // Tải lại giao diện sau khi xóa thông tin về bộ LEGO
        }
    };

    // Tải dữ liệu về bộ LEGO theo chức năng lọc
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

    // Khởi tạo
    loadLegoSets();
});