document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form") as HTMLFormElement;
    const btn = document.querySelector("button") as HTMLButtonElement;

    //date
    const dateInput = document.getElementById("dt") as HTMLInputElement;
    const today = new Date().toISOString().slice(0,10);
    dateInput.setAttribute("max", today);

    //shows an error msg below the input field
    function showError(el: HTMLElement, msg: string) {
        removeError(el);
        const e = document.createElement("div");
        e.className = "error";
        e.style.fontSize = "12px";
        e.style.color = "red";
        e.innerText = msg;
        el.after(e);
    }

    //removes error msg for an input
    function removeError(el: HTMLElement) {
        if (el.nextElementSibling && el.nextElementSibling.classList.contains("error")) {
            el.nextElementSibling.remove();
        }
    }

    //shows error for groups like radio buttons or checkboxes
    function showGroupError(el: HTMLElement | null, msg: string) {
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
    const titleInput = document.getElementById("exptitle") as HTMLInputElement;
    function validateTitle(showRequired = false): boolean {
        const value = titleInput.value;
        removeError(titleInput);

        if (showRequired && value.trim() === "") {
            showError(titleInput, "Please enter a title.");
            return false;
        }
        if (value.trim() !== "") {

            if (!/^[a-zA-Z0-9]/.test(value)) {
                showError(titleInput, "Title must start with a letter or number and cannot start with space or special character.")
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
    const amountInput = document.getElementById("amount") as HTMLInputElement;
    function validateAmount(showRequired = false): boolean {
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
    const allFields = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input,select");
    allFields.forEach(field => {
        field.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLInputElement | HTMLSelectElement;
            removeError(target as HTMLElement);
            if (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox")) {
                const parent = target.parentElement;
                const err = parent?.querySelector(".error");
                if (err) err.remove();
            }
        });
        
        field.addEventListener("change", (e: Event) => {
            const target = e.target as HTMLInputElement | HTMLSelectElement;
            removeError(target as HTMLElement);
            if (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox")) {
                const parent = target.parentElement;
                const err = parent?.querySelector(".error");
                if (err) err.remove();
            }
        });
    });

    //table and form submission
    const table = document.getElementById("expenseTable") as HTMLTableElement;

    let editRow: HTMLTableRowElement | null = null;
    
    

    btn.onclick = () => {

        let valid = true;
        document.querySelectorAll(".error").forEach(err => err.remove());

        if (!validateTitle(true)) valid = false;
        if (!validateAmount(true)) valid = false;

        //inputs
        document.querySelectorAll<HTMLInputElement>("input[required]").forEach(input => {
            if (input.type === "radio" || input.type === "checkbox") return;
            if (input.value.trim() === "" && input.id !== "exptitle" && input.id !== "amount") {
                if (input.id === "dt") showError(input, 'Please select a date.');
                else showError(input, "This field is required.");
                valid = false;
            }
        });

        //selects
        document.querySelectorAll<HTMLSelectElement>("select[required]").forEach(select => {
            if (select.value === "") {
                if (select.id === "category") showError(select, "Please select a Category.");
                else if (select.id === "currency") showError(select, "Please select a Currency.");
                else showError(select, "Please select an option.");
                valid = false;
            }
        });

        //payment(radio)
        const radios = document.querySelectorAll<HTMLInputElement>('input[name="payment"]');
        let radioChecked = false;
        radios.forEach(radio => {
            if (radio.checked) {
                radioChecked = true;
            }
        });

        //checkbox
        const save = document.querySelector<HTMLInputElement>('input[type="checkbox"][required]');
        if (save && !save.checked) {
            showGroupError(save, "You must save this expense to continue.");
            valid = false;
        }

        //date validation
        if (dateInput.value > today) {
            showError(dateInput, "Expense date cannot be in the future.")
            valid = false;
        }

        if (!valid) {
            const firstError = document.querySelector(".error");
            if (firstError) firstError.scrollIntoView({ behavior: "smooth" });
            return;
        }

        const tableBody = table.tBodies[0] as HTMLTableSectionElement;
        const paymentValue = document.querySelector<HTMLInputElement>('input[name="payment"]:checked')!.value;

        if (!editRow) {
            tableBody.querySelector("#noData")?.remove();
            //Insertig new row
            const newRow = tableBody.insertRow();

            newRow.insertCell(0).innerText = titleInput.value;
            newRow.insertCell(1).innerText = (document.getElementById("category") as HTMLSelectElement).value;
            newRow.insertCell(2).innerText = (document.getElementById("currency") as HTMLSelectElement).value;
            newRow.insertCell(3).innerText = amountInput.value;
            newRow.insertCell(4).innerText = dateInput.value;
            newRow.insertCell(5).innerText = (document.getElementById("appt") as HTMLInputElement).value;
            newRow.insertCell(6).innerText = paymentValue;
            newRow.insertCell(7).innerText = (document.getElementById("transaction") as HTMLInputElement).value;
            newRow.insertCell(8).innerText = (document.getElementById("name") as HTMLInputElement).value;
            newRow.insertCell(9).innerText = (document.getElementById("loc") as HTMLInputElement).value;
            newRow.insertCell(10).innerText = document.querySelector<HTMLInputElement>('input[name="receipt"]:checked')?.value || "";
            newRow.insertCell(11).innerText = (document.getElementById("note") as HTMLTextAreaElement).value;
            newRow.insertCell(12).innerText = (document.getElementById("tags") as HTMLInputElement).value;
            newRow.insertCell(13).innerText = (document.getElementById("save_recurring") as HTMLInputElement).checked ? "Yes" : "No";

            newRow.insertCell(14).innerHTML = "<button class='edit-btn'>Edit</button><br><button class='del-btn'>Delete</button>";

            alert("Form submitted successully!");
            table.scrollIntoView({ behavior: "smooth" });
        } else {
            editRow.cells[0]!.innerText = titleInput.value;
            editRow.cells[1]!.innerText = (document.getElementById("category") as HTMLSelectElement).value;
            editRow.cells[2]!.innerText = (document.getElementById("currency") as HTMLSelectElement).value;
            editRow.cells[3]!.innerText = amountInput.value;
            editRow.cells[4]!.innerText = dateInput.value;
            editRow.cells[5]!.innerText = (document.getElementById("appt") as HTMLInputElement).value;
            editRow.cells[6]!.innerText = paymentValue;
            editRow.cells[7]!.innerText = (document.getElementById("transaction") as HTMLInputElement).value;
            editRow.cells[8]!.innerText = (document.getElementById("name") as HTMLInputElement).value;
            editRow.cells[9]!.innerText = (document.getElementById("loc") as HTMLInputElement).value;

            const receiptInput = document.querySelector<HTMLInputElement>('input[name="receipt"]:checked');
            editRow.cells[10]!.innerText = receiptInput ? receiptInput.value : "";
            
            editRow.cells[11]!.innerText = (document.getElementById("note") as HTMLTextAreaElement).value;
            editRow.cells[12]!.innerText = (document.getElementById("tags") as HTMLInputElement).value;
            editRow.cells[13]!.innerText = (document.getElementById("save_recurring") as HTMLInputElement).checked ? "Yes" : "No";

            editRow.classList.remove("editing");

            alert("Form updated successfully!");
            editRow.scrollIntoView({ behavior: "smooth" });
            editRow = null;
            btn.innerText = "SUBMIT";
        }
        form.reset();
    };

    table.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.parentElement) return;
        const row = target.parentElement.parentElement as HTMLTableRowElement;

        if (target.classList.contains("edit-btn")) {
            table.querySelector(".editing")?.classList.remove("editing");

            editRow = row;
            row.classList.add("editing");

            titleInput.value = row.cells[0]!.innerText;
            (document.getElementById("category") as HTMLSelectElement).value = row.cells[1]!.innerText;
            (document.getElementById("currency") as HTMLSelectElement).value = row.cells[2]!.innerText;
            amountInput.value = row.cells[3]!.innerText;
            dateInput.value = row.cells[4]!.innerText;
            (document.getElementById("appt") as HTMLInputElement).value = row.cells[5]!.innerText;
            (document.getElementsByName("payment") as NodeListOf<HTMLInputElement>).forEach(p => {
                if (p.value === row.cells[6]!.innerText) p.checked = true;
            });
            (document.getElementById("transaction") as HTMLInputElement).value = row.cells[7]!.innerText;
            (document.getElementById("name") as HTMLInputElement).value = row.cells[8]!.innerText;
            (document.getElementById("loc") as HTMLInputElement).value = row.cells[9]!.innerText;

            const receipt = row.cells[10]!.innerText;
            (document.getElementById("receipt_yes") as HTMLInputElement).checked = receipt === "yes";
            (document.getElementById("receipt_no") as HTMLInputElement).checked = receipt === "no";

            (document.getElementById("note") as HTMLTextAreaElement).value = row.cells[11]!.innerText;
            (document.getElementById("tags") as HTMLInputElement).value = row.cells[12]!.innerText;

            (document.getElementById("save_recurring") as HTMLInputElement).checked = row.cells[13]!.innerText === "Yes";

            btn.innerText = "UPDATE";
        }
        if (target.classList.contains("del-btn")) {
            if (confirm('Are you sure you want to delete this expense?')) {
                row.remove();

                const tbody = table.querySelector("tbody");
                if (!tbody) return;
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

