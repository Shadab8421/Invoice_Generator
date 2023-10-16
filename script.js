function GetPdf() {
    window.print();
    const inputValues = document.getElementsByClassName("input-value");
    for (let i = 0; i < inputValues.length; i++) {
        const inputValue = inputValues[i];
        const inputText = document.createTextNode(inputValue.innerText);
        inputValue.parentNode.replaceChild(inputText, inputValue);
    }
    var editableSpan = document.querySelector(".editable-value");
    var enteredValue = editableSpan.textContent;

    const invoiceNumber = generateInvoiceNumber();
    localStorage.setItem("lastInvoiceNumber", invoiceNumber);

    // Generate PDF and store it in the local storage folder
    const element = document.getElementById("invoice");
    html2pdf()
        .set({
            filename: `Invoice_${invoiceNumber}.pdf`,
            output: "blob",
            html2canvas: {
                scale: 2,
                logging: true,
                dpi: 192,
                letterRendering: true,
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait",
            },
        })
        .from(element)
        .then((pdf) => {
            // Prompt user to choose location to save the PDF
            // const downloadLocation = prompt("Please enter the desired download location (including the filename):");
            if (downloadLocation) {
                pdf.save(downloadLocation);
            }
        });
}

function generateInvoiceNumber() {
    var lastInvoiceNumber =
        parseInt(localStorage.getItem("lastInvoiceNumber")) || 0;
    lastInvoiceNumber++;
    return lastInvoiceNumber;
}

function initializeInvoiceNumber() {
    var invoiceNumberInput = document.getElementById("invoiceNumber");
    var lastInvoiceNumber =
        parseInt(localStorage.getItem("lastInvoiceNumber")) || 0;
    invoiceNumberInput.value = lastInvoiceNumber;
}

window.onload = initializeInvoiceNumber;

function btnadd() {
    var b = $("#Trow").clone().appendTo("#Tbody");
    $(b).find("input").val("");
    $(b).removeClass("d-none");
    $(b)
        .find("th")
        .first()
        .html($("tr").length - 2);
}

function btndel(b) {
    $(b).parent().parent().remove();
    GetTotal();

    $("#Tbody")
        .find("tr")
        .each(function(index) {
            $(this).find("th").first().html(index);
        });
}

function handleItemNameChange(input) {
    var row = input.parentNode.parentNode;
    var amtField = row.querySelector("input[name='amt']");
    var itemName = input.innerText;
    if (itemName.includes("Installation Charges")) {
        amtField.disabled = false;
        Calc(amtField);
    } else {
        amtField.disabled = true;
        amtField.value = 0;
        GetTotal();
    }
}

function Calc(input) {
    var row = input.parentNode.parentNode;
    var qty = row.querySelector("input[name='qty']").value;
    var rate = row.querySelector("input[name='rate']").value;
    var amtField = row.querySelector("input[name='amt']");
    var itemName = row.querySelector(".editable-value").innerText;

    var amt = qty * rate;

    if (itemName.includes("Installation Charges")) {
        var installationValue = itemName.split("Inst")[1].trim();
        if (installationValue) {
            var installationCharge = parseFloat(installationValue);
            amt += installationCharge;
            amtField.disabled = false;
        }
    }

    amtField.value = amt;
    GetTotal();
}

function GetTotal() {
    var sum = 0;
    var amts = document.getElementsByName("amt");
    for (let index = 0; index < amts.length; index++) {
        var amt = amts[index].value;
        sum = +sum + +amt;
    }
    document.getElementById("FTotal").value = sum;

    var net = +sum + +((sum * 18) / 100);

    document.getElementById("FNet").value = net;

    var cgst = (sum * 0.09).toFixed(2);
    document.getElementById("CGST").value = cgst;

    var sgst = (sum * 0.09).toFixed(2);
    document.getElementById("SGST").value = sgst;

    var amountInWords = convertToWords(net);
    document.getElementById("amountInWords").innerText = amountInWords;
}

function convertToWords(amount) {
    var words = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];

    var tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];

    var inWords = "";

    if (amount === 0) {
        inWords = "Zero Rupees";
    } else {
        var amountString = amount.toFixed(2).toString();
        var amountArray = amountString.split(".");

        var rupees = parseInt(amountArray[0]);
        var paise = parseInt(amountArray[1]);

        if (rupees > 0) {
            inWords += convert(rupees) + " Rupees";
        }

        if (paise > 0) {
            inWords += " and " + convert(paise) + " Paise";
        }
    }
    inWords += " Only";
    return inWords;

    function convert(num) {
        if (num < 20) {
            return words[num];
        }

        if (num < 100) {
            return tens[Math.floor(num / 10)] + " " + words[num % 10];
        }

        if (num < 1000) {
            return words[Math.floor(num / 100)] + " Hundred " + convert(num % 100);
        }

        if (num < 100000) {
            return (
                convert(Math.floor(num / 1000)) + " Thousand " + convert(num % 1000)
            );
        }

        if (num < 10000000) {
            return (
                convert(Math.floor(num / 100000)) + " Lakh " + convert(num % 100000)
            );
        }

        return (
            convert(Math.floor(num / 10000000)) + " Crore " + convert(num % 10000000)
        );
    }
}