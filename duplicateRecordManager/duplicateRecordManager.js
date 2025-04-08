import { LightningElement, track } from 'lwc';
import getDuplicateLeads from '@salesforce/apex/DuplicateRecordController.getDuplicateLeads';
import mergeLeads from '@salesforce/apex/DuplicateRecordController.mergeLeads';
import deleteLead from '@salesforce/apex/DuplicateRecordController.deleteLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DuplicateRecordManager extends LightningElement {
  @track duplicateGroups = [];
  @track error;

  connectedCallback() {
    this.fetchDuplicates();
  }

  handleRefresh() {
    this.fetchDuplicates();
  }

  async fetchDuplicates() {
    try {
      this.error = null;
      this.duplicateGroups = [];
      const data = await getDuplicateLeads();
      
      // Group records by email and prepare for display
      const groupedData = data.reduce((acc, record) => {
        const email = record.Email;
        if (!acc[email]) {
          acc[email] = { email, records: [] };
        }
        acc[email].records.push(record);
        return acc;
      }, {});

      // Convert to array and filter groups with more than one record
      this.duplicateGroups = Object.values(groupedData)
        .filter(group => group.records.length > 1)
        .map(group => ({
          ...group,
          mergeDisabled: group.records.length < 2 // Disable merge if less than 2 records
        }));
    } catch (error) {
      this.error = 'Error fetching duplicates: ' + (error.body?.message || error.message);
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: this.error,
          variant: 'error'
        })
      );
    }
  }

  async handleDelete(event) {
    const leadId = event.target.dataset.id;
    try {
      await deleteLead({ leadId });
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Success',
          message: 'Lead deleted successfully!',
          variant: 'success'
        })
      );
      this.fetchDuplicates(); // Refresh the list
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: 'Error deleting lead: ' + (error.body?.message || error.message),
          variant: 'error'
        })
      );
    }
  }

  async handleMerge(event) {
    const email = event.target.dataset.email;
    try {
      await mergeLeads({ email });
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Success',
          message: 'Leads merged successfully!',
          variant: 'success'
        })
      );
      this.fetchDuplicates(); // Refresh the list
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: 'Error merging leads: ' + (error.body?.message || error.message),
          variant: 'error'
        })
      );
    }
  }
}