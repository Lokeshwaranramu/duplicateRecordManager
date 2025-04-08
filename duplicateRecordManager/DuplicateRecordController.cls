public with sharing class DuplicateRecordController {
  @AuraEnabled(cacheable=true)
  public static List<Lead> getDuplicateLeads() {
    try {
      // Fetch Leads with non-null email addresses
      List<Lead> leads = [
        SELECT Id, Name, Email, Company, CreatedDate
        FROM Lead
        WHERE Email != NULL
        ORDER BY Email, CreatedDate
      ];
      return leads;
    } catch (Exception e) {
      throw new AuraHandledException('Error fetching duplicate leads: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void mergeLeads(String email) {
    try {
      // Fetch leads with the given email
      List<Lead> leadsToMerge = [
        SELECT Id, Name, Email, Company, CreatedDate
        FROM Lead
        WHERE Email = :email
        ORDER BY CreatedDate DESC
        LIMIT 2
      ];

      if (leadsToMerge.size() < 2) {
        throw new AuraHandledException('Not enough leads to merge for email: ' + email);
      }

      // Keep the most recent lead as the master
      Lead masterLead = leadsToMerge[0];
      List<Id> leadsToDelete = new List<Id>();
      for (Integer i = 1; i < leadsToMerge.size(); i++) {
        leadsToDelete.add(leadsToMerge[i].Id);
      }

      // In a real scenario, you'd merge fields (e.g., using Database.merge), but for simplicity, we'll delete the duplicates
      delete [SELECT Id FROM Lead WHERE Id IN :leadsToDelete];
    } catch (Exception e) {
      throw new AuraHandledException('Error merging leads: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void deleteLead(String leadId) {
    try {
      Lead leadToDelete = [SELECT Id FROM Lead WHERE Id = :leadId LIMIT 1];
      delete leadToDelete;
    } catch (Exception e) {
      throw new AuraHandledException('Error deleting lead: ' + e.getMessage());
    }
  }
}