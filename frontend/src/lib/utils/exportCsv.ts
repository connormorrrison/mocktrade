import type { Activity } from "@/lib/types/activity";
import { formatMoney } from "@/lib/formatMoney";
import { formatShares } from "@/lib/formatShares";

/**
 * generates and triggers the download of a csv file
 * from an array of activity data.
 */
/**
 * Escapes a CSV field by wrapping it in quotes if it contains special characters
 */
const escapeCsvField = (field: string): string => {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

export const exportActivitiesToCsv = (activities: Activity[], filename = 'activity.csv') => {
    // prepare the headers for csv file
    const headers = ['ID', 'Date', 'Action', 'Symbol', 'Quantity', 'Price per Share', 'Total'];

    // build an array of csv rows, starting with headers
    const csvRows = [headers.join(',')];

    // add a row for each activity
    activities.forEach(tx => {
      const row = [
        tx.id.toString(),
        escapeCsvField(new Date(tx.created_at).toLocaleString()), // escape date as it may contain commas
        tx.action,
        tx.symbol,
        formatShares(tx.quantity), // format quantity to 3 decimal places for fractional shares
        escapeCsvField(formatMoney(tx.price)), // format price as currency and escape (contains $ and commas)
        escapeCsvField(formatMoney(tx.total_amount)), // format total as currency and escape (contains $ and commas)
      ];
      csvRows.push(row.join(','));
    });

    // convert the array to a single csv string
    const csvString = csvRows.join('\n');

    // create a blob object from the csv string
    const blob = new Blob([csvString], { type: 'text/csv' });

    // create a temporary url for the blob
    const url = window.URL.createObjectURL(blob);

    // create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // use the provided filename

    // append link to body, click it, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // revoke the object url to free up memory
    window.URL.revokeObjectURL(url);
};
