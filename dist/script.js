document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const btn = document.querySelector("button");
    //date
    const dateInput = document.getElementById("dt");
    const today = new Date().toISOString().slice(0, 10);
    dateInput.setAttribute("max", today);
    //shows an error msg below the input field
    function showError(el, msg) {
        removeError(el);
        const e = document.createElement("div");
        e.className = "error";
        e.style.fontSize = "12px";
        e.style.color = "red";
        e.innerText = msg;
        el.after(e);
    }
    //removes error msg for an input
    function removeError(el) {
        if (el.nextElementSibling && el.nextElementSibling.classList.contains("error")) {
            el.nextElementSibling.remove();
        }
    }
    //shows error for groups like radio buttons or checkboxes
    function showGroupError(el, msg) {
        if (!el) {
            return;
        }
        const parent = el.parentElement;
        if (!parent) {
            return;
        }
        const existing = parent.querySelector(".error");
        if (existing) {
            existing.remove();
        }
        const e = document.createElement("div");
        e.className = "error";
        e.style.color = "red";
        e.style.fontSize = "12px";
        e.innerText = msg;
        parent.appendChild(e);
    }
    //expense title
    const titleInput = document.getElementById("exptitle");
    function validateTitle(showRequired = false) {
        const value = titleInput.value;
        removeError(titleInput);
        if (showRequired && value.trim() === "") {
            showError(titleInput, "Please enter a title.");
            return false;
        }
        if (value.trim() !== "") {
            if (!/^[a-zA-Z0-9]/.test(value)) {
                showError(titleInput, "Title must start with a letter or number and cannot start with space or special character.");
                return false;
            }
            const trimmed = value.trim();
            if (trimmed.length < 3) {
                showError(titleInput, "Please enter a minimum of 3 characters.");
                return false;
            }
            if (trimmed.length > 50) {
                showError(titleInput, "Please enter no more than 50 characters.");
                return false;
            }
        }
        return true;
    }
    titleInput.addEventListener("input", () => validateTitle(false));
    titleInput.addEventListener("blur", () => validateTitle(true));
    //amount
    const amountInput = document.getElementById("amount");
    function validateAmount(showRequired = false) {
        const value = amountInput.value.trim();
        removeError(amountInput);
        if (showRequired && value === "") {
            showError(amountInput, 'Please enter an amount.');
            return false;
        }
        if (value !== "") {
            if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
                showError(amountInput, "Enter a valid number (up to 10 digits and 2 decimals).");
                return false;
            }
            if (Number(value) <= 0) {
                showError(amountInput, 'Please enter a positive amount.');
                return false;
            }
        }
        return true;
    }
    amountInput.addEventListener("input", () => validateAmount(false));
    amountInput.addEventListener("blur", () => validateAmount(true));
    //remove errors on typig/select
    const allFields = document.querySelectorAll("input,select");
    allFields.forEach(field => {
        field.addEventListener("input", (e) => {
            const target = e.target;
            removeError(target);
            if (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox")) {
                const parent = target.parentElement;
                const err = parent?.querySelector(".error");
                if (err)
                    err.remove();
            }
        });
        field.addEventListener("change", (e) => {
            const target = e.target;
            removeError(target);
            if (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox")) {
                const parent = target.parentElement;
                const err = parent?.querySelector(".error");
                if (err)
                    err.remove();
            }
        });
    });
    //table and form submission
    const table = document.getElementById("expenseTable");
    let editRow = null;
    btn.onclick = () => {
        let valid = true;
        document.querySelectorAll(".error").forEach(err => err.remove());
        if (!validateTitle(true))
            valid = false;
        if (!validateAmount(true))
            valid = false;
        //inputs
        document.querySelectorAll("input[required]").forEach(input => {
            if (input.type === "radio" || input.type === "checkbox")
                return;
            if (input.value.trim() === "" && input.id !== "exptitle" && input.id !== "amount") {
                if (input.id === "dt")
                    showError(input, 'Please select a date.');
                else
                    showError(input, "This field is required.");
                valid = false;
            }
        });
        //selects
        document.querySelectorAll("select[required]").forEach(select => {
            if (select.value === "") {
                if (select.id === "category")
                    showError(select, "Please select a Category.");
                else if (select.id === "currency")
                    showError(select, "Please select a Currency.");
                else
                    showError(select, "Please select an option.");
                valid = false;
            }
        });
        //payment(radio)
        const radios = document.querySelectorAll('input[name="payment"]');
        let radioChecked = false;
        radios.forEach(radio => {
            if (radio.checked) {
                radioChecked = true;
            }
        });
        //checkbox
        const save = document.querySelector('input[type="checkbox"][required]');
        if (save && !save.checked) {
            showGroupError(save, "You must save this expense to continue.");
            valid = false;
        }
        //date validation
        if (dateInput.value > today) {
            showError(dateInput, "Expense date cannot be in the future.");
            valid = false;
        }
        if (!valid) {
            const firstError = document.querySelector(".error");
            if (firstError)
                firstError.scrollIntoView({ behavior: "smooth" });
            return;
        }
        const tableBody = table.tBodies[0];
        const paymentValue = document.querySelector('input[name="payment"]:checked').value;
        if (!editRow) {
            tableBody.querySelector("#noData")?.remove();
            //Insertig new row
            const newRow = tableBody.insertRow();
            newRow.insertCell(0).innerText = titleInput.value;
            newRow.insertCell(1).innerText = document.getElementById("category").value;
            newRow.insertCell(2).innerText = document.getElementById("currency").value;
            newRow.insertCell(3).innerText = amountInput.value;
            newRow.insertCell(4).innerText = dateInput.value;
            newRow.insertCell(5).innerText = document.getElementById("appt").value;
            newRow.insertCell(6).innerText = paymentValue;
            newRow.insertCell(7).innerText = document.getElementById("transaction").value;
            newRow.insertCell(8).innerText = document.getElementById("name").value;
            newRow.insertCell(9).innerText = document.getElementById("loc").value;
            newRow.insertCell(10).innerText = document.querySelector('input[name="receipt"]:checked')?.value || "";
            newRow.insertCell(11).innerText = document.getElementById("note").value;
            newRow.insertCell(12).innerText = document.getElementById("tags").value;
            newRow.insertCell(13).innerText = document.getElementById("save_recurring").checked ? "Yes" : "No";
            newRow.insertCell(14).innerHTML = "<button class='edit-btn'>Edit</button><br><button class='del-btn'>Delete</button>";
            alert("Form submitted successully!");
            table.scrollIntoView({ behavior: "smooth" });
        }
        else {
            editRow.cells[0].innerText = titleInput.value;
            editRow.cells[1].innerText = document.getElementById("category").value;
            editRow.cells[2].innerText = document.getElementById("currency").value;
            editRow.cells[3].innerText = amountInput.value;
            editRow.cells[4].innerText = dateInput.value;
            editRow.cells[5].innerText = document.getElementById("appt").value;
            editRow.cells[6].innerText = paymentValue;
            editRow.cells[7].innerText = document.getElementById("transaction").value;
            editRow.cells[8].innerText = document.getElementById("name").value;
            editRow.cells[9].innerText = document.getElementById("loc").value;
            const receiptInput = document.querySelector('input[name="receipt"]:checked');
            editRow.cells[10].innerText = receiptInput ? receiptInput.value : "";
            editRow.cells[11].innerText = document.getElementById("note").value;
            editRow.cells[12].innerText = document.getElementById("tags").value;
            editRow.cells[13].innerText = document.getElementById("save_recurring").checked ? "Yes" : "No";
            editRow.classList.remove("editing");
            alert("Form updated successfully!");
            editRow.scrollIntoView({ behavior: "smooth" });
            editRow = null;
            btn.innerText = "SUBMIT";
        }
        form.reset();
    };
    table.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.parentElement)
            return;
        const row = target.parentElement.parentElement;
        if (target.classList.contains("edit-btn")) {
            table.querySelector(".editing")?.classList.remove("editing");
            editRow = row;
            row.classList.add("editing");
            titleInput.value = row.cells[0].innerText;
            document.getElementById("category").value = row.cells[1].innerText;
            document.getElementById("currency").value = row.cells[2].innerText;
            amountInput.value = row.cells[3].innerText;
            dateInput.value = row.cells[4].innerText;
            document.getElementById("appt").value = row.cells[5].innerText;
            document.getElementsByName("payment").forEach(p => {
                if (p.value === row.cells[6].innerText)
                    p.checked = true;
            });
            document.getElementById("transaction").value = row.cells[7].innerText;
            document.getElementById("name").value = row.cells[8].innerText;
            document.getElementById("loc").value = row.cells[9].innerText;
            const receipt = row.cells[10].innerText;
            document.getElementById("receipt_yes").checked = receipt === "yes";
            document.getElementById("receipt_no").checked = receipt === "no";
            document.getElementById("note").value = row.cells[11].innerText;
            document.getElementById("tags").value = row.cells[12].innerText;
            document.getElementById("save_recurring").checked = row.cells[13].innerText === "Yes";
            btn.innerText = "UPDATE";
        }
        if (target.classList.contains("del-btn")) {
            if (confirm('Are you sure you want to delete this expense?')) {
                row.remove();
                const tbody = table.querySelector("tbody");
                if (!tbody)
                    return;
                if (tbody.rows.length === 0) {
                    const emptyRow = tbody.insertRow();
                    const emptyCell = emptyRow.insertCell(0);
                    emptyCell.colSpan = 15;
                    emptyCell.innerText = "No Data Found";
                    emptyCell.style.textAlign = "center";
                }
            }
        }
    });
});
export {};
