import type { Activity } from "@/lib/types/activity";

/**
 * generates and triggers the download of a csv file
 * from an array of activity data.
 */
export const exportActivitiesToCsv = (activities: Activity[], filename = 'activity.csv') => {
    // prepare the headers for csv file
    const headers = ['ID', 'Date', 'Action', 'Symbol', 'Quantity', 'Price per Share', 'Total'];
    
    // build an array of csv rows, starting with headers
    const csvRows = [headers.join(',')];
    
    // add a row for each activity
    activities.forEach(tx => {
      const row = [
        tx.id.toString(), // ensure string
        new Date(tx.created_at).toLocaleString(), // format date nicely
        tx.action,
        tx.symbol,
        tx.quantity.toString(),
        tx.price.toString(),
        tx.total_amount.toString(),
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
