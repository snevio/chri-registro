

async function copyContent() {
    const tbody = document.querySelector('#ordersTable');

    const rows = Array.from(tbody.rows).map(row => {
        return Array.from(row.cells).map(cell => cell.textContent.trim()).join('\t');
    });
    const tableText = rows.join('\n');
    const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([tableText], { type: 'text/plain' })
    });

    await navigator.clipboard.write([clipboardItem]);
    console.log('Table copied!');
}


async function retrieveOrders() {
    const sheetId = document.getElementById("google-id").value
    const errorContainer = document.getElementById("error-wrapper")

    console.log(sheetId)
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = ''
    const URL = `/api/orders?sheetId=${sheetId}`
    const res = await fetch(URL)

    if (!res.ok) {
        errorContainer.innerHTML = '<div style="color:red">API Key o URL </div>'
    }

    const data = await res.json();

    console.log(data)


    console.log(data)
    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${entry.orderId}</td>
      <td>${entry.numeroOrdine}</td>
      <td>${entry.data}</td>
      <td>${entry.nomeProdotto} (SKU: ${entry.prodottoSku})</td>
      <td>${entry.quantita}</td>
      <td>€${entry.prezzoProdotto}</td>
      <td>€${entry.prezzoSpedizione}</td>
      <td>€${entry.prezzoTotale}</td>
      <td>${entry.stato}</td>
      <td>${entry.testMode}</td>
    `;
        tbody.appendChild(row);
    });




}
